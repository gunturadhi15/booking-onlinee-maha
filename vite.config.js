import { defineConfig } from 'vite';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database', 'booking.db');

// In-memory mutex for payment locks
const activeLocks = new Set();

function apiPlugin() {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) {
          return next();
        }

        // Set JSON headers & CORS
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        const parsedUrl = new URL(url, 'http://localhost');
        const pathname = parsedUrl.pathname;
        const query = Object.fromEntries(parsedUrl.searchParams.entries());

        const getDb = () => {
          const db = new DatabaseSync(dbPath);
          db.exec('PRAGMA foreign_keys = ON;');
          return db;
        };

        const readBody = () => new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch {
              resolve({});
            }
          });
        });

        const sendJson = (statusCode, data) => {
          res.statusCode = statusCode;
          res.end(JSON.stringify(data, null, 2));
        };

        (async () => {
          try {
            const db = getDb();

            // 1. GET /api/admin/bookings
            if (pathname === '/api/admin/bookings' && req.method === 'GET') {
              let sql = `
                SELECT b.booking_id, c.name as customer_name, c.phone, c.email,
                       s.service_name, p.package_name, b.booking_date, b.booking_time,
                       b.pax, b.total_amount, b.status
                FROM bookings b
                JOIN customers c ON b.customer_id = c.customer_id
                JOIN services s ON b.service_id = s.service_id
                LEFT JOIN packages p ON b.package_id = p.package_id
                WHERE 1=1
              `;
              const params = [];
              if (query.status && query.status !== 'all') {
                sql += ' AND LOWER(b.status) = LOWER(?)';
                params.push(query.status);
              }
              if (query.date) {
                sql += ' AND b.booking_date = ?';
                params.push(query.date);
              }
              sql += ' ORDER BY b.created_at DESC';

              const rows = db.prepare(sql).all(...params);
              return sendJson(200, {
                status: 'success',
                total: rows.length,
                data: rows
              });
            }

            // 2. GET /api/admin/availability
            if (pathname === '/api/admin/availability' && req.method === 'GET') {
              const targetDate = query.date || '2026-10-15';
              const timeSlots = ['09:00:00', '10:00:00', '11:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00'];

              const bookings = db.prepare(`
                SELECT b.booking_id, b.booking_time, b.pax, b.status, c.name as customer_name, s.service_name
                FROM bookings b
                JOIN customers c ON b.customer_id = c.customer_id
                JOIN services s ON b.service_id = s.service_id
                WHERE b.booking_date = ? AND b.status != 'cancelled'
              `).all(targetDate);

              const data = timeSlots.map(time => {
                const matched = bookings.filter(b => b.booking_time.slice(0, 5) === time.slice(0, 5));
                const bookedPax = matched.reduce((acc, curr) => acc + (curr.pax || 1), 0);
                const maxCap = 8;
                return {
                  time_slot: time.slice(0, 5),
                  max_capacity: maxCap,
                  booked_pax: bookedPax,
                  remaining_quota: Math.max(0, maxCap - bookedPax),
                  is_available: maxCap > bookedPax,
                  bookings: matched
                };
              });

              return sendJson(200, {
                status: 'success',
                date: targetDate,
                data
              });
            }

            // 3. GET /api/admin/payments/:order_id
            if (pathname.startsWith('/api/admin/payments/') && req.method === 'GET') {
              const orderId = decodeURIComponent(pathname.replace('/api/admin/payments/', '').trim());
              const payment = db.prepare(`
                SELECT p.*, c.name as customer_name, c.phone as customer_phone, b.service_id, b.booking_date, b.booking_time
                FROM payments p
                LEFT JOIN bookings b ON p.booking_id = b.booking_id
                LEFT JOIN customers c ON b.customer_id = c.customer_id
                WHERE p.order_id = ? OR p.idempotency_key = ?
              `).get(orderId, orderId);

              if (!payment) {
                return sendJson(404, {
                  status: 'error',
                  message: `Pembayaran dengan order_id '${orderId}' tidak ditemukan.`
                });
              }

              return sendJson(200, {
                status: 'success',
                data: payment
              });
            }

            // 4. GET /api/admin/payments
            if (pathname === '/api/admin/payments' && req.method === 'GET') {
              let sql = `
                SELECT p.*, c.name as customer_name, c.phone as customer_phone
                FROM payments p
                LEFT JOIN bookings b ON p.booking_id = b.booking_id
                LEFT JOIN customers c ON b.customer_id = c.customer_id
                WHERE 1=1
              `;
              const params = [];
              if (query.status && query.status !== 'all') {
                sql += ' AND LOWER(p.status) = LOWER(?)';
                params.push(query.status);
              }
              if (query.start_date) {
                sql += ' AND p.created_at >= ?';
                params.push(query.start_date);
              }
              if (query.end_date) {
                sql += ' AND p.created_at <= ?';
                params.push(query.end_date);
              }
              sql += ' ORDER BY p.created_at DESC';

              const rows = db.prepare(sql).all(...params);
              return sendJson(200, {
                status: 'success',
                total: rows.length,
                data: rows
              });
            }

            // 5. GET /api/admin/customers
            if (pathname === '/api/admin/customers' && req.method === 'GET') {
              const customers = db.prepare(`
                SELECT c.*,
                       COUNT(b.booking_id) as total_bookings,
                       COALESCE(SUM(b.total_amount), 0) as total_spent
                FROM customers c
                LEFT JOIN bookings b ON c.customer_id = b.customer_id
                GROUP BY c.customer_id
                ORDER BY c.created_at DESC
              `).all();

              return sendJson(200, {
                status: 'success',
                total: customers.length,
                data: customers
              });
            }

            // 6. POST /api/admin/customers/notify
            if (pathname === '/api/admin/customers/notify' && req.method === 'POST') {
              const body = await readBody();
              const notifId = `NTF-${Date.now()}`;
              db.prepare(`
                INSERT INTO customer_notifications (notification_id, customer_id, channel, template, message, status)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(
                notifId,
                body.customer_id || 'CUST-001',
                body.channel || 'whatsapp',
                body.template || 'custom',
                body.message || 'Pemberitahuan dari admin.',
                'sent'
              );

              return sendJson(200, {
                status: 'success',
                message: 'Notifikasi berhasil dikirim melalui WhatsApp Gateway.',
                notification_id: notifId,
                data: body
              });
            }

            // 7. POST /api/bookings
            if (pathname === '/api/bookings' && req.method === 'POST') {
              const body = await readBody();
              const now = new Date();
              const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
              const rand = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
              const bookingId = `BKG-${dateStr}-${rand}`;

              // Register/Find Customer
              let cust = db.prepare('SELECT customer_id FROM customers WHERE email = ? OR phone = ?').get(body.email, body.phone);
              let custId = cust?.customer_id;
              if (!custId) {
                custId = `CUST-${Date.now()}`;
                db.prepare(`
                  INSERT INTO customers (customer_id, name, email, phone)
                  VALUES (?, ?, ?, ?)
                `).run(custId, body.customer_name, body.email, body.phone);
              }

              // Insert Booking
              db.prepare(`
                INSERT INTO bookings (booking_id, customer_id, service_id, package_id, booking_date, booking_time, pax, subtotal, tax, total_amount, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
              `).run(
                bookingId,
                custId,
                body.service_id,
                body.package_id,
                body.booking_date,
                body.booking_time,
                body.pax || 1,
                body.subtotal || 0,
                body.tax || 0,
                body.total_amount || 0,
                body.notes || ''
              );

              // Generate Idempotency Key TRX-{USER_ID}-{TIMESTAMP}-{RANDOM}
              const pad = (n) => String(n).padStart(2, '0');
              const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
              const randKey = Math.random().toString(36).substring(2, 6).toUpperCase();
              const userIdClean = custId.replace(/\D/g, '').slice(0, 6) || '102';
              const orderId = `TRX-${userIdClean}-${timeStr}-${randKey}`;

              // Insert Payment with UNIQUE order_id & idempotency_key
              db.prepare(`
                INSERT INTO payments (payment_id, booking_id, order_id, idempotency_key, payment_reference, payment_method, amount, status, expired_at)
                VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
              `).run(
                `PAY-${dateStr}-${rand}`,
                bookingId,
                orderId,
                orderId,
                `PGW-${randKey}`,
                body.total_amount || 0,
                new Date(Date.now() + 24 * 3600000).toISOString()
              );

              return sendJson(200, {
                status: 'success',
                message: 'Booking berhasil dibuat dengan status pending.',
                data: {
                  booking: { booking_id: bookingId, ...body },
                  payment: { order_id: orderId, idempotency_key: orderId },
                  redirect_url: `#/checkout?order_id=${orderId}&booking_id=${bookingId}`
                }
              });
            }

            // 8. POST /api/payments/charge (Idempotent Payment)
            if (pathname === '/api/payments/charge' && req.method === 'POST') {
              const body = await readBody();
              const targetKey = body.idempotency_key || body.order_id;

              if (activeLocks.has(targetKey)) {
                return sendJson(429, {
                  status: 'error',
                  code: 'ERR_CONCURRENT_REQUEST',
                  message: 'Transaksi sedang diproses. Duplikasi request diblokir (Idempotency Safe).'
                });
              }

              activeLocks.add(targetKey);
              try {
                const existing = db.prepare('SELECT * FROM payments WHERE order_id = ? OR idempotency_key = ?').get(targetKey, targetKey);
                if (existing && existing.status === 'paid') {
                  return sendJson(200, {
                    status: 'success',
                    is_idempotent_replay: true,
                    message: 'Transaksi sudah dibayar sebelumnya. Duplikasi dicegah.',
                    data: existing
                  });
                }

                // Update to paid
                db.prepare(`
                  UPDATE payments 
                  SET status = 'paid', payment_method = ?, paid_at = CURRENT_TIMESTAMP
                  WHERE order_id = ? OR idempotency_key = ?
                `).run(body.payment_method || 'QRIS', targetKey, targetKey);

                if (existing?.booking_id) {
                  db.prepare(`UPDATE bookings SET status = 'confirmed' WHERE booking_id = ?`).run(existing.booking_id);
                }

                const updated = db.prepare('SELECT * FROM payments WHERE order_id = ? OR idempotency_key = ?').get(targetKey, targetKey);
                return sendJson(200, {
                  status: 'success',
                  is_idempotent_replay: false,
                  message: 'Pembayaran berhasil dikonfirmasi.',
                  data: updated
                });
              } finally {
                activeLocks.delete(targetKey);
              }
            }

            // 9. POST /api/payments/webhook
            if (pathname === '/api/payments/webhook' && req.method === 'POST') {
              const body = await readBody();
              const orderId = body.order_id;
              const existing = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId);

              if (!existing) {
                return sendJson(404, { status: 'error', message: 'Order tidak ditemukan' });
              }

              // Aturan Idempotency: Jika sudah paid, abaikan callback kedua
              if (existing.status === 'paid') {
                return sendJson(200, {
                  status: 'ignored',
                  message: 'Callback diabaikan: Pembayaran sudah berstatus PAID (Idempotency Protection).'
                });
              }

              if (body.transaction_status === 'settlement' || body.transaction_status === 'capture') {
                db.prepare(`UPDATE payments SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE order_id = ?`).run(orderId);
                db.prepare(`UPDATE bookings SET status = 'confirmed' WHERE booking_id = ?`).run(existing.booking_id);
              }

              return sendJson(200, { status: 'success', message: 'Webhook diproses.' });
            }

            sendJson(404, { status: 'error', message: `Route ${pathname} tidak ditemukan.` });
          } catch (err) {
            console.error('API Middleware Error:', err);
            sendJson(500, { status: 'error', message: err.message });
          }
        })();
      });
    }
  };
}

export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [apiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
