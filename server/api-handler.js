/**
 * Shared API Handler (dipakai oleh server.js DAN middleware Vite dev)
 *
 * Sebelumnya logika API diduplikasi di dua tempat sehingga perbaikan keamanan
 * mudah terlewat. Sekarang semua route ada di satu file ini.
 *
 * Endpoint:
 *  Publik (rate-limited):
 *   - POST /api/bookings
 *  Admin (wajib Authorization: Bearer <ADMIN_API_TOKEN>):
 *   - GET  /api/admin/bookings
 *   - GET  /api/admin/availability
 *   - GET  /api/admin/payments
 *   - GET  /api/admin/payments/:order_id
 *   - GET  /api/admin/customers
 *   - POST /api/admin/customers/notify
 *   - POST /api/payments/charge   (admin, atau simulasi lokal jika ALLOW_SIMULATED_PAYMENTS=true)
 *  Gateway (wajib signature valid):
 *   - POST /api/payments/webhook
 *
 * Semua query memakai prepared statement + parameter binding (anti SQL Injection).
 */
import crypto from 'node:crypto';
import { PACKAGES, SERVICES, FIXED_TIME_SLOTS, getMaxPaxForService } from '../src/data.js';
import {
  INPUT_LIMITS,
  PAYMENT_METHODS,
  sanitizeText,
  digitsOnly,
  isValidName,
  isValidEmail,
  isValidPhoneDigits,
  isValidDateString,
  isValidTimeString,
  isValidInvoiceId,
  isValidBookingCode,
  isValidOrderId,
  isValidGenericId,
  pickAllowed
} from '../src/utils/security.js';
import {
  HttpError,
  applySecurityHeaders,
  applyCors,
  getClientIp,
  createRateLimiter,
  readJsonBody,
  requireAdmin,
  sendJson,
  sendError,
  verifyMidtransSignature
} from './security.js';

const BOOKING_STATUSES = ['pending', 'confirmed', 'paid', 'completed', 'cancelled', 'failed'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'expired', 'refunded'];
const NOTIFY_CHANNELS = ['whatsapp', 'email'];
const ADMIN_TIME_SLOTS = FIXED_TIME_SLOTS.map((s) => s.time);
const MAX_CAPACITY_PER_SLOT = 8;

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

/** Tanggal hari ini di zona Bali (UTC+8) format YYYY-MM-DD */
function baliToday(offsetDays = 0) {
  const d = new Date(Date.now() + 8 * 3600000 + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

function slugify(name) {
  return String(name || 'JOURNEY')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'JOURNEY';
}

function randomToken(bytes = 4) {
  return crypto.randomBytes(bytes).toString('hex').toUpperCase();
}

/** Jalankan fungsi di dalam transaksi SQLite */
function withTransaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch { /* ignore */ }
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Validasi payload booking (server-side, JANGAN percaya client)       */
/* ------------------------------------------------------------------ */
function validateBookingPayload(body) {
  const errors = {};

  const customerName = sanitizeText(body.customer_name, INPUT_LIMITS.NAME_MAX);
  if (!isValidName(customerName)) errors.customer_name = 'Nama tidak valid (2-100 huruf).';

  const email = sanitizeText(body.email, INPUT_LIMITS.EMAIL_MAX).toLowerCase();
  if (!isValidEmail(email)) errors.email = 'Email tidak valid.';

  const phone = digitsOnly(body.phone, 20);
  if (!isValidPhoneDigits(phone)) errors.phone = 'Nomor WhatsApp tidak valid (7-15 digit).';

  const pkg = PACKAGES.find((p) => p.package_id === body.package_id);
  if (!pkg) errors.package_id = 'Paket tidak dikenal.';

  const service = pkg ? SERVICES.find((s) => s.service_id === pkg.service_id) : null;
  if (pkg && body.service_id && body.service_id !== pkg.service_id) {
    errors.service_id = 'Layanan tidak sesuai dengan paket.';
  }

  const bookingDate = String(body.booking_date || '');
  if (!isValidDateString(bookingDate)) {
    errors.booking_date = 'Format tanggal harus YYYY-MM-DD.';
  } else if (bookingDate < baliToday() || bookingDate > baliToday(365)) {
    errors.booking_date = 'Tanggal di luar rentang yang diizinkan.';
  }

  const bookingTime = String(body.booking_time || '').slice(0, 5);
  if (!isValidTimeString(bookingTime) || !ADMIN_TIME_SLOTS.includes(bookingTime)) {
    errors.booking_time = 'Slot waktu tidak tersedia.';
  }

  const maxPax = service ? getMaxPaxForService(service) : 1;
  const pax = Number(body.pax ?? 1);
  if (!Number.isInteger(pax) || pax < 1 || pax > maxPax) {
    errors.pax = `Jumlah peserta harus 1-${maxPax}.`;
  }

  const paymentMethod = pickAllowed(String(body.payment_method || 'card').toLowerCase(), PAYMENT_METHODS);
  if (!paymentMethod) errors.payment_method = 'Metode pembayaran tidak dikenal.';

  const notes = sanitizeText(body.notes, INPUT_LIMITS.SERIALIZED_NOTES_MAX, { multiline: true });

  const bookingId = isValidBookingCode(body.booking_id) ? body.booking_id : null;
  const invoiceNumber = isValidInvoiceId(body.invoice_number) ? body.invoice_number : null;

  if (Object.keys(errors).length > 0) {
    throw new HttpError(422, 'ERR_VALIDATION', 'Data booking tidak valid.', errors);
  }

  // Harga dihitung ulang di server dari katalog resmi (anti manipulasi harga)
  const subtotal = pkg.price * pax;

  return {
    customerName, email, phone, pkg, service, bookingDate, bookingTime,
    pax, paymentMethod, notes, bookingId, invoiceNumber,
    subtotal, tax: 0, total: subtotal
  };
}

/* ------------------------------------------------------------------ */
/* Factory                                                             */
/* ------------------------------------------------------------------ */
export function createApiHandler({ getDb, env = process.env, logger = console }) {
  const isProduction = env.NODE_ENV === 'production';
  const config = {
    adminToken: env.ADMIN_API_TOKEN || '',
    gatewayServerKey: env.PAYMENT_GATEWAY_SERVER_KEY || '',
    // Simulasi pembayaran TIDAK PERNAH aktif di production
    allowSimulatedPayments: env.ALLOW_SIMULATED_PAYMENTS === 'true' && !isProduction,
    trustProxy: env.TRUST_PROXY === 'true',
    allowedOrigins: (env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',')
      : DEFAULT_ALLOWED_ORIGINS
    ).map((s) => s.trim()).filter(Boolean)
  };

  const publicLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });
  const adminLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });
  const authFailLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 10 });
  const activeLocks = new Set();

  const guardAdmin = (req, ip) => {
    const fail = authFailLimiter(`peek:${ip}`);
    // "peek" hanya untuk membaca status blokir tanpa menghitung sukses
    if (!fail.allowed) {
      throw new HttpError(429, 'ERR_TOO_MANY_ATTEMPTS', 'Terlalu banyak percobaan. Coba lagi nanti.');
    }
    try {
      requireAdmin(req, config.adminToken);
    } catch (err) {
      if (err.status === 401) authFailLimiter(`peek:${ip}`);
      throw err;
    }
    const rl = adminLimiter(`admin:${ip}`);
    if (!rl.allowed) throw new HttpError(429, 'ERR_RATE_LIMIT', 'Terlalu banyak request.');
  };

  return async function handleApi(req, res) {
    const requestId = crypto.randomUUID();
    applySecurityHeaders(res);
    res.setHeader('X-Request-Id', requestId);

    try {
      if (!applyCors(req, res, config.allowedOrigins)) {
        throw new HttpError(403, 'ERR_ORIGIN_NOT_ALLOWED', 'Origin tidak diizinkan.');
      }

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
      }

      const parsedUrl = new URL(req.url || '/', 'http://localhost');
      const pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';
      const query = Object.fromEntries(parsedUrl.searchParams.entries());
      const ip = getClientIp(req, config.trustProxy);
      const db = getDb();

      /* ============================ ADMIN ============================ */
      if (pathname.startsWith('/api/admin/')) {
        guardAdmin(req, ip);

        // GET /api/admin/bookings
        if (pathname === '/api/admin/bookings' && req.method === 'GET') {
          let sql = `
            SELECT b.booking_id, c.name AS customer_name, c.phone, c.email,
                   s.service_name, p.package_name, b.booking_date, b.booking_time,
                   b.pax, b.total_amount, b.status
            FROM bookings b
            JOIN customers c ON b.customer_id = c.customer_id
            JOIN services s ON b.service_id = s.service_id
            LEFT JOIN packages p ON b.package_id = p.package_id
            WHERE 1=1`;
          const params = [];
          if (query.status && query.status !== 'all') {
            const status = pickAllowed(query.status.toLowerCase(), BOOKING_STATUSES);
            if (!status) throw new HttpError(400, 'ERR_VALIDATION', 'Parameter status tidak valid.');
            sql += ' AND LOWER(b.status) = ?';
            params.push(status);
          }
          if (query.date) {
            if (!isValidDateString(query.date)) throw new HttpError(400, 'ERR_VALIDATION', 'Parameter date tidak valid.');
            sql += ' AND b.booking_date = ?';
            params.push(query.date);
          }
          sql += ' ORDER BY b.created_at DESC LIMIT 500';
          const rows = db.prepare(sql).all(...params);
          return sendJson(res, 200, { status: 'success', total: rows.length, data: rows });
        }

        // GET /api/admin/availability
        if (pathname === '/api/admin/availability' && req.method === 'GET') {
          const targetDate = query.date || baliToday();
          if (!isValidDateString(targetDate)) throw new HttpError(400, 'ERR_VALIDATION', 'Parameter date tidak valid.');

          const bookings = db.prepare(`
            SELECT b.booking_id, b.booking_time, b.pax, b.status, c.name AS customer_name, s.service_name
            FROM bookings b
            JOIN customers c ON b.customer_id = c.customer_id
            JOIN services s ON b.service_id = s.service_id
            WHERE b.booking_date = ? AND b.status != 'cancelled'
          `).all(targetDate);

          const data = ADMIN_TIME_SLOTS.map((time) => {
            const matched = bookings.filter((b) => String(b.booking_time).slice(0, 5) === time);
            const bookedPax = matched.reduce((acc, cur) => acc + (cur.pax || 1), 0);
            return {
              time_slot: time,
              max_capacity: MAX_CAPACITY_PER_SLOT,
              booked_pax: bookedPax,
              remaining_quota: Math.max(0, MAX_CAPACITY_PER_SLOT - bookedPax),
              is_available: MAX_CAPACITY_PER_SLOT > bookedPax,
              bookings: matched
            };
          });
          return sendJson(res, 200, { status: 'success', date: targetDate, data });
        }

        // GET /api/admin/payments/:order_id
        if (pathname.startsWith('/api/admin/payments/') && req.method === 'GET') {
          let orderId;
          try {
            orderId = decodeURIComponent(pathname.slice('/api/admin/payments/'.length));
          } catch {
            throw new HttpError(400, 'ERR_VALIDATION', 'order_id tidak valid.');
          }
          if (!isValidOrderId(orderId)) throw new HttpError(400, 'ERR_VALIDATION', 'order_id tidak valid.');

          const payment = db.prepare(`
            SELECT p.payment_id, p.booking_id, p.order_id, p.payment_reference, p.payment_method,
                   p.amount, p.currency, p.status, p.paid_at, p.expired_at, p.created_at,
                   c.name AS customer_name, c.phone AS customer_phone,
                   b.service_id, b.booking_date, b.booking_time
            FROM payments p
            LEFT JOIN bookings b ON p.booking_id = b.booking_id
            LEFT JOIN customers c ON b.customer_id = c.customer_id
            WHERE p.order_id = ? OR p.idempotency_key = ?
          `).get(orderId, orderId);

          if (!payment) throw new HttpError(404, 'ERR_NOT_FOUND', 'Data pembayaran tidak ditemukan.');
          return sendJson(res, 200, { status: 'success', data: payment });
        }

        // GET /api/admin/payments
        if (pathname === '/api/admin/payments' && req.method === 'GET') {
          let sql = `
            SELECT p.payment_id, p.booking_id, p.order_id, p.payment_reference, p.payment_method,
                   p.amount, p.currency, p.status, p.paid_at, p.expired_at, p.created_at,
                   c.name AS customer_name, c.phone AS customer_phone
            FROM payments p
            LEFT JOIN bookings b ON p.booking_id = b.booking_id
            LEFT JOIN customers c ON b.customer_id = c.customer_id
            WHERE 1=1`;
          const params = [];
          if (query.status && query.status !== 'all') {
            const status = pickAllowed(query.status.toLowerCase(), PAYMENT_STATUSES);
            if (!status) throw new HttpError(400, 'ERR_VALIDATION', 'Parameter status tidak valid.');
            sql += ' AND LOWER(p.status) = ?';
            params.push(status);
          }
          if (query.start_date) {
            if (!isValidDateString(query.start_date)) throw new HttpError(400, 'ERR_VALIDATION', 'start_date tidak valid.');
            sql += ' AND p.created_at >= ?';
            params.push(query.start_date);
          }
          if (query.end_date) {
            if (!isValidDateString(query.end_date)) throw new HttpError(400, 'ERR_VALIDATION', 'end_date tidak valid.');
            sql += ' AND p.created_at <= ?';
            params.push(`${query.end_date} 23:59:59`);
          }
          sql += ' ORDER BY p.created_at DESC LIMIT 500';
          const rows = db.prepare(sql).all(...params);
          return sendJson(res, 200, { status: 'success', total: rows.length, data: rows });
        }

        // GET /api/admin/customers
        if (pathname === '/api/admin/customers' && req.method === 'GET') {
          const customers = db.prepare(`
            SELECT c.customer_id, c.name, c.email, c.phone, c.notes, c.created_at,
                   COUNT(b.booking_id) AS total_bookings,
                   COALESCE(SUM(b.total_amount), 0) AS total_spent
            FROM customers c
            LEFT JOIN bookings b ON c.customer_id = b.customer_id
            GROUP BY c.customer_id
            ORDER BY c.created_at DESC
            LIMIT 500
          `).all();
          return sendJson(res, 200, { status: 'success', total: customers.length, data: customers });
        }

        // POST /api/admin/customers/notify
        if (pathname === '/api/admin/customers/notify' && req.method === 'POST') {
          const body = await readJsonBody(req);
          const customerId = String(body.customer_id || '');
          if (!isValidGenericId(customerId)) throw new HttpError(422, 'ERR_VALIDATION', 'customer_id tidak valid.');

          const exists = db.prepare('SELECT 1 FROM customers WHERE customer_id = ?').get(customerId);
          if (!exists) throw new HttpError(404, 'ERR_NOT_FOUND', 'Pelanggan tidak ditemukan.');

          const channel = pickAllowed(String(body.channel || 'whatsapp').toLowerCase(), NOTIFY_CHANNELS);
          if (!channel) throw new HttpError(422, 'ERR_VALIDATION', 'Channel tidak valid.');

          const template = isValidGenericId(String(body.template || 'custom')) ? String(body.template || 'custom') : null;
          if (!template) throw new HttpError(422, 'ERR_VALIDATION', 'Template tidak valid.');

          const message = sanitizeText(body.message, INPUT_LIMITS.MESSAGE_MAX, { multiline: true });
          if (!message) throw new HttpError(422, 'ERR_VALIDATION', 'Pesan wajib diisi.');

          const notifId = `NTF-${Date.now()}-${randomToken(3)}`;
          db.prepare(`
            INSERT INTO customer_notifications (notification_id, customer_id, channel, template, message, status)
            VALUES (?, ?, ?, ?, ?, 'queued')
          `).run(notifId, customerId, channel, template, message);

          return sendJson(res, 200, { status: 'success', message: 'Notifikasi masuk antrean.', notification_id: notifId });
        }

        throw new HttpError(404, 'ERR_NOT_FOUND', 'Endpoint tidak ditemukan.');
      }

      /* ============================ PUBLIC =========================== */
      // GET /api/availability?date=YYYY-MM-DD
      if (pathname === '/api/availability' && req.method === 'GET') {
        const rl = publicLimiter(`avail:${ip}`);
        if (!rl.allowed) throw new HttpError(429, 'ERR_RATE_LIMIT', 'Terlalu banyak request.');

        const targetDate = query.date || baliToday();
        if (!isValidDateString(targetDate)) {
          throw new HttpError(400, 'ERR_VALIDATION', 'Format parameter date tidak valid (YYYY-MM-DD).');
        }

        const bookings = db.prepare(`
          SELECT booking_time, pax, status
          FROM bookings
          WHERE booking_date = ? AND status NOT IN ('cancelled', 'failed')
        `).all(targetDate);

        const data = ADMIN_TIME_SLOTS.map((time) => {
          const matched = bookings.filter((b) => String(b.booking_time).slice(0, 5) === time);
          const bookedPax = matched.reduce((acc, cur) => acc + (cur.pax || 1), 0);
          const remainingQuota = Math.max(0, MAX_CAPACITY_PER_SLOT - bookedPax);
          return {
            time_slot: time,
            max_capacity: MAX_CAPACITY_PER_SLOT,
            booked_pax: bookedPax,
            remaining_quota: remainingQuota,
            is_available: remainingQuota > 0
          };
        });

        return sendJson(res, 200, {
          status: 'success',
          date: targetDate,
          timezone: 'Asia/Makassar (WITA)',
          data
        });
      }

      // GET /api/bookings/lookup?ref=... (Sanitized invoice/booking lookup)
      if (pathname === '/api/bookings/lookup' && req.method === 'GET') {
        const rl = publicLimiter(`lookup:${ip}`);
        if (!rl.allowed) throw new HttpError(429, 'ERR_RATE_LIMIT', 'Terlalu banyak request.');

        const ref = String(query.ref || query.order_id || query.booking_id || '').trim();
        if (!ref || (!isValidOrderId(ref) && !isValidBookingCode(ref) && !isValidInvoiceId(ref))) {
          throw new HttpError(400, 'ERR_VALIDATION', 'Parameter ref tidak valid.');
        }

        const row = db.prepare(`
          SELECT b.booking_id, b.booking_date, b.booking_time, b.pax, b.status AS booking_status,
                 b.total_amount, b.subtotal, b.notes, b.created_at,
                 s.service_name, p.package_name,
                 c.name AS customer_name,
                 pay.order_id, pay.status AS payment_status, pay.payment_method, pay.paid_at
          FROM bookings b
          JOIN customers c ON b.customer_id = c.customer_id
          JOIN services s ON b.service_id = s.service_id
          LEFT JOIN packages p ON b.package_id = p.package_id
          LEFT JOIN payments pay ON b.booking_id = pay.booking_id
          WHERE b.booking_id = ? OR pay.order_id = ?
        `).get(ref, ref);

        if (!row) {
          throw new HttpError(404, 'ERR_NOT_FOUND', 'Data reservasi tidak ditemukan.');
        }

        return sendJson(res, 200, {
          status: 'success',
          data: {
            booking_id: row.booking_id,
            order_id: row.order_id,
            customer_name: row.customer_name,
            service_name: row.service_name,
            package_name: row.package_name,
            booking_date: row.booking_date,
            booking_time: String(row.booking_time).slice(0, 5),
            pax: row.pax,
            total_amount: row.total_amount,
            booking_status: row.booking_status,
            payment_status: row.payment_status || 'pending',
            payment_method: row.payment_method,
            paid_at: row.paid_at,
            created_at: row.created_at
          }
        });
      }

      // POST /api/bookings
      if (pathname === '/api/bookings' && req.method === 'POST') {
        const rl = publicLimiter(`booking:${ip}`);
        if (!rl.allowed) {
          res.setHeader('Retry-After', String(rl.retryAfterSec));
          throw new HttpError(429, 'ERR_RATE_LIMIT', 'Terlalu banyak request. Coba lagi sebentar.');
        }

        const body = await readJsonBody(req);
        const v = validateBookingPayload(body);
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

        const result = withTransaction(db, () => {
          // 1. Cek ketersediaan kuota slot secara atomik di dalam transaksi (Pencegahan Overbooking / Race Condition)
          const slotCheck = db.prepare(`
            SELECT COALESCE(SUM(b.pax), 0) AS booked_pax
            FROM bookings b
            WHERE b.booking_date = ? 
              AND (b.booking_time = ? OR b.booking_time = ?)
              AND b.status NOT IN ('cancelled', 'failed')
          `).get(v.bookingDate, v.bookingTime, `${v.bookingTime}:00`);

          const currentBooked = slotCheck ? Number(slotCheck.booked_pax) : 0;
          if (currentBooked + v.pax > MAX_CAPACITY_PER_SLOT) {
            const remaining = Math.max(0, MAX_CAPACITY_PER_SLOT - currentBooked);
            throw new HttpError(
              409,
              'ERR_SLOT_FULL',
              `Kapasitas sesi pada tanggal ${v.bookingDate} pukul ${v.bookingTime} WITA tidak mencukupi (sisa kuota: ${remaining} tamu, diminta: ${v.pax} tamu). Silakan pilih slot waktu lain.`
            );
          }

          // Pastikan service & package dari katalog resmi ada di DB (untuk foreign key)
          db.prepare(`INSERT OR IGNORE INTO services (service_id, service_name, category, status) VALUES (?, ?, ?, 'active')`)
            .run(v.service.service_id, v.service.service_name, v.service.category || 'General');
          db.prepare(`INSERT OR IGNORE INTO packages (package_id, service_id, package_name, price, duration) VALUES (?, ?, ?, ?, ?)`)
            .run(v.pkg.package_id, v.pkg.service_id, v.pkg.package_name, v.pkg.price, String(v.pkg.duration || '-'));

          let bookingId = v.bookingId;
          if (!bookingId || db.prepare('SELECT 1 FROM bookings WHERE booking_id = ?').get(bookingId)) {
            bookingId = `MWJ-${slugify(v.pkg.package_name)}-${dateStr}-${randomToken(3)}`;
          }

          const existingCustomer = db.prepare('SELECT customer_id FROM customers WHERE email = ?').get(v.email);
          let customerId = existingCustomer?.customer_id;
          if (!customerId) {
            customerId = `CUST-${crypto.randomUUID()}`.slice(0, 36);
            db.prepare('INSERT INTO customers (customer_id, name, email, phone) VALUES (?, ?, ?, ?)')
              .run(customerId, v.customerName, v.email, v.phone);
          }

          db.prepare(`
            INSERT INTO bookings (booking_id, customer_id, service_id, package_id, booking_date, booking_time, pax, subtotal, tax, total_amount, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
          `).run(bookingId, customerId, v.service.service_id, v.pkg.package_id, v.bookingDate, `${v.bookingTime}:00`,
            v.pax, v.subtotal, v.tax, v.total, v.notes);

          let orderId = v.invoiceNumber;
          if (!orderId || db.prepare('SELECT 1 FROM payments WHERE order_id = ?').get(orderId)) {
            orderId = `TRX-${dateStr}-${randomToken(6)}`;
          }

          db.prepare(`
            INSERT INTO payments (payment_id, booking_id, order_id, idempotency_key, payment_reference, payment_method, amount, status, expired_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
          `).run(`PAY-${dateStr}-${randomToken(4)}`, bookingId, orderId, orderId, `PGW-${randomToken(6)}`,
            v.paymentMethod, v.total, new Date(Date.now() + 24 * 3600000).toISOString());

          return { bookingId, orderId };
        });

        // Hanya kembalikan data yang diperlukan (tidak echo seluruh body)
        return sendJson(res, 201, {
          status: 'success',
          message: 'Booking berhasil disimpan dengan status pending.',
          data: {
            booking_id: result.bookingId,
            order_id: result.orderId,
            subtotal: v.subtotal,
            tax: v.tax,
            total_amount: v.total,
            status: 'pending'
          }
        });
      }

      // POST /api/payments/charge
      if (pathname === '/api/payments/charge' && req.method === 'POST') {
        // Mengubah status ke "paid" adalah aksi sensitif -> hanya admin,
        // kecuali mode simulasi lokal diaktifkan secara eksplisit (non-production).
        if (!config.allowSimulatedPayments) {
          guardAdmin(req, ip);
        } else {
          const rl = publicLimiter(`charge:${ip}`);
          if (!rl.allowed) throw new HttpError(429, 'ERR_RATE_LIMIT', 'Terlalu banyak request.');
        }

        const body = await readJsonBody(req);
        const targetKey = String(body.idempotency_key || body.order_id || '');
        if (!isValidOrderId(targetKey)) throw new HttpError(422, 'ERR_VALIDATION', 'order_id tidak valid.');
        const paymentMethod = pickAllowed(String(body.payment_method || 'qris').toLowerCase(), PAYMENT_METHODS);
        if (!paymentMethod) throw new HttpError(422, 'ERR_VALIDATION', 'Metode pembayaran tidak dikenal.');

        if (activeLocks.has(targetKey)) {
          throw new HttpError(409, 'ERR_CONCURRENT_REQUEST', 'Transaksi sedang diproses.');
        }
        activeLocks.add(targetKey);
        try {
          const existing = db.prepare('SELECT payment_id, booking_id, order_id, status FROM payments WHERE order_id = ? OR idempotency_key = ?')
            .get(targetKey, targetKey);
          if (!existing) throw new HttpError(404, 'ERR_NOT_FOUND', 'Transaksi tidak ditemukan.');

          if (existing.status === 'paid') {
            return sendJson(res, 200, { status: 'success', is_idempotent_replay: true, message: 'Transaksi sudah dibayar sebelumnya.', data: { order_id: existing.order_id, status: 'paid' } });
          }
          if (existing.status !== 'pending') {
            throw new HttpError(409, 'ERR_INVALID_STATE', 'Status transaksi tidak dapat diubah.');
          }

          withTransaction(db, () => {
            db.prepare(`UPDATE payments SET status = 'paid', payment_method = ?, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE payment_id = ?`)
              .run(paymentMethod, existing.payment_id);
            db.prepare(`UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE booking_id = ?`)
              .run(existing.booking_id);
          });

          return sendJson(res, 200, { status: 'success', is_idempotent_replay: false, message: 'Pembayaran dikonfirmasi.', data: { order_id: existing.order_id, status: 'paid' } });
        } finally {
          activeLocks.delete(targetKey);
        }
      }

      // POST /api/payments/webhook  (callback payment gateway)
      if (pathname === '/api/payments/webhook' && req.method === 'POST') {
        if (!config.gatewayServerKey) {
          throw new HttpError(503, 'ERR_WEBHOOK_NOT_CONFIGURED', 'Webhook belum dikonfigurasi.');
        }
        const body = await readJsonBody(req);
        if (!verifyMidtransSignature(body, config.gatewayServerKey)) {
          logger.warn(`[API][${requestId}] Webhook signature tidak valid dari ${ip}`);
          throw new HttpError(401, 'ERR_INVALID_SIGNATURE', 'Signature tidak valid.');
        }

        const orderId = String(body.order_id);
        if (!isValidOrderId(orderId)) throw new HttpError(422, 'ERR_VALIDATION', 'order_id tidak valid.');

        const existing = db.prepare('SELECT payment_id, booking_id, amount, status FROM payments WHERE order_id = ?').get(orderId);
        if (!existing) throw new HttpError(404, 'ERR_NOT_FOUND', 'Order tidak ditemukan.');

        if (existing.status === 'paid') {
          return sendJson(res, 200, { status: 'ignored', message: 'Pembayaran sudah berstatus paid.' });
        }

        // Nominal dari gateway harus sama dengan nominal di database
        if (Math.round(Number(body.gross_amount)) !== Math.round(Number(existing.amount))) {
          logger.warn(`[API][${requestId}] Nominal webhook tidak cocok untuk ${orderId}`);
          throw new HttpError(422, 'ERR_AMOUNT_MISMATCH', 'Nominal tidak sesuai.');
        }

        const txStatus = String(body.transaction_status || '');
        const fraudOk = !body.fraud_status || body.fraud_status === 'accept';
        withTransaction(db, () => {
          if ((txStatus === 'settlement' || txStatus === 'capture') && fraudOk) {
            db.prepare(`UPDATE payments SET status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE payment_id = ?`).run(existing.payment_id);
            db.prepare(`UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE booking_id = ?`).run(existing.booking_id);
          } else if (['deny', 'cancel', 'failure'].includes(txStatus)) {
            db.prepare(`UPDATE payments SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE payment_id = ?`).run(existing.payment_id);
          } else if (txStatus === 'expire') {
            db.prepare(`UPDATE payments SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE payment_id = ?`).run(existing.payment_id);
          }
        });

        return sendJson(res, 200, { status: 'success', message: 'Webhook diproses.' });
      }

      throw new HttpError(404, 'ERR_NOT_FOUND', 'Endpoint tidak ditemukan.');
    } catch (err) {
      return sendError(res, err, { requestId, logger });
    }
  };
}
