/**
 * Server-side Security Helpers (Node.js only)
 *
 * - Security headers & CORS allowlist
 * - Body parser dengan batas ukuran + validasi Content-Type
 * - Rate limiter in-memory
 * - Auth admin (Bearer token, perbandingan timing-safe)
 * - Error handler yang tidak membocorkan detail internal
 * - Verifikasi signature webhook payment gateway (Midtrans-style)
 * - Validasi & "scan" file upload (magic bytes, ukuran, konten berbahaya)
 */
import crypto from 'node:crypto';

/* ------------------------------------------------------------------ */
/* HttpError: error yang AMAN untuk ditampilkan ke client              */
/* ------------------------------------------------------------------ */
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = true;
  }
}

/* ------------------------------------------------------------------ */
/* Security headers untuk semua response API                           */
/* ------------------------------------------------------------------ */
export function applySecurityHeaders(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.removeHeader('X-Powered-By');
}

/**
 * CORS berbasis allowlist (bukan '*').
 * @returns {boolean} true jika origin diizinkan / tidak ada origin (server-to-server)
 */
export function applyCors(req, res, allowedOrigins) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (!allowedOrigins.includes(origin)) return false;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '600');
  return true;
}

/* ------------------------------------------------------------------ */
/* Client IP (X-Forwarded-For hanya dipercaya jika TRUST_PROXY=true)   */
/* ------------------------------------------------------------------ */
export function getClientIp(req, trustProxy = false) {
  if (trustProxy) {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

/* ------------------------------------------------------------------ */
/* Rate limiter sederhana (fixed window, in-memory)                    */
/* ------------------------------------------------------------------ */
export function createRateLimiter({ windowMs, max }) {
  const hits = new Map();
  return function check(key) {
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || now - entry.start >= windowMs) {
      entry = { start: now, count: 0 };
      hits.set(key, entry);
    }
    entry.count += 1;

    // Bersihkan entry kadaluarsa agar memori tidak membengkak
    if (hits.size > 5000) {
      for (const [k, v] of hits) {
        if (now - v.start >= windowMs) hits.delete(k);
      }
    }

    return {
      allowed: entry.count <= max,
      retryAfterSec: Math.max(1, Math.ceil((entry.start + windowMs - now) / 1000))
    };
  };
}

/* ------------------------------------------------------------------ */
/* JSON body reader: batas ukuran + wajib application/json             */
/* ------------------------------------------------------------------ */
export function readJsonBody(req, maxBytes = 16 * 1024) {
  return new Promise((resolve, reject) => {
    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    if (!contentType.startsWith('application/json')) {
      reject(new HttpError(415, 'ERR_UNSUPPORTED_MEDIA_TYPE', 'Content-Type harus application/json.'));
      req.resume();
      return;
    }

    const declared = Number(req.headers['content-length'] || 0);
    if (declared > maxBytes) {
      reject(new HttpError(413, 'ERR_PAYLOAD_TOO_LARGE', 'Ukuran request terlalu besar.'));
      req.resume();
      return;
    }

    let size = 0;
    const chunks = [];
    let aborted = false;

    req.on('data', (chunk) => {
      if (aborted) return;
      size += chunk.length;
      if (size > maxBytes) {
        aborted = true;
        reject(new HttpError(413, 'ERR_PAYLOAD_TOO_LARGE', 'Ukuran request terlalu besar.'));
        req.resume();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (aborted) return;
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return reject(new HttpError(400, 'ERR_INVALID_JSON', 'Body harus berupa objek JSON.'));
        }
        // Cegah prototype pollution
        delete parsed.__proto__;
        delete parsed.constructor;
        delete parsed.prototype;
        resolve(parsed);
      } catch {
        reject(new HttpError(400, 'ERR_INVALID_JSON', 'Format JSON tidak valid.'));
      }
    });

    req.on('error', () => {
      if (!aborted) reject(new HttpError(400, 'ERR_BAD_REQUEST', 'Request tidak dapat dibaca.'));
    });
  });
}

/* ------------------------------------------------------------------ */
/* Auth admin: Authorization: Bearer <ADMIN_API_TOKEN>                 */
/* ------------------------------------------------------------------ */
export function timingSafeEqualStr(a, b) {
  // Hash dulu agar panjang buffer sama -> tidak bocor info panjang token
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const MIN_ADMIN_TOKEN_LENGTH = 32;

export function requireAdmin(req, adminToken) {
  if (!adminToken || adminToken.length < MIN_ADMIN_TOKEN_LENGTH) {
    // Fail-closed: endpoint admin mati total jika token belum dikonfigurasi
    throw new HttpError(503, 'ERR_ADMIN_AUTH_NOT_CONFIGURED', 'Akses admin belum dikonfigurasi di server.');
  }
  const header = String(req.headers.authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || !timingSafeEqualStr(match[1].trim(), adminToken)) {
    throw new HttpError(401, 'ERR_UNAUTHORIZED', 'Autentikasi diperlukan.');
  }
}

/* ------------------------------------------------------------------ */
/* Response helpers + error handler yang tidak bocor                   */
/* ------------------------------------------------------------------ */
export function sendJson(res, status, data) {
  if (res.headersSent) return;
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export function sendError(res, err, { requestId, logger = console } = {}) {
  if (err instanceof HttpError && err.expose) {
    return sendJson(res, err.status, {
      status: 'error',
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
      request_id: requestId
    });
  }

  // Error tak terduga: log detail di server, kirim pesan generik ke client
  logger.error(`[API][${requestId}]`, err);
  return sendJson(res, 500, {
    status: 'error',
    code: 'ERR_INTERNAL',
    message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
    request_id: requestId
  });
}

/* ------------------------------------------------------------------ */
/* Verifikasi signature webhook (format Midtrans)                      */
/* signature_key = SHA512(order_id + status_code + gross_amount + key) */
/* ------------------------------------------------------------------ */
export function verifyMidtransSignature(body, serverKey) {
  if (!serverKey) return false;
  const { order_id, status_code, gross_amount, signature_key } = body || {};
  if (![order_id, status_code, gross_amount, signature_key].every((v) => typeof v === 'string' && v.length > 0)) {
    return false;
  }
  const expected = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');
  return timingSafeEqualStr(expected, signature_key.toLowerCase());
}

/* ------------------------------------------------------------------ */
/* Scan & validasi file upload                                         */
/* (Belum ada fitur upload di aplikasi, helper ini WAJIB dipakai jika   */
/*  nanti menambahkan upload: bukti transfer, foto, dokumen, dll.)      */
/* ------------------------------------------------------------------ */
const FILE_TYPES = {
  'image/jpeg': { exts: ['jpg', 'jpeg'], check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': {
    exts: ['png'],
    check: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  },
  'image/webp': {
    exts: ['webp'],
    check: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP'
  },
  'application/pdf': { exts: ['pdf'], check: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-' }
};

// Pola konten berbahaya (polyglot file, script tersembunyi, PDF aktif)
const DANGEROUS_PATTERNS = [
  /<script/i, /<\?php/i, /<%[=@]?/, /javascript:/i, /<iframe/i, /<svg[\s>]/i, /onerror\s*=/i, /onload\s*=/i
];
const DANGEROUS_PDF_PATTERNS = [/\/JavaScript/, /\/JS\b/, /\/Launch/, /\/EmbeddedFile/, /\/OpenAction/, /\/AA\b/];

/**
 * @param {{buffer: Buffer, originalName: string, maxBytes?: number, allowedTypes?: string[]}} file
 * @returns {{ mime: string, ext: string, safeName: string, sha256: string }}
 */
export function validateUploadedFile({
  buffer,
  originalName,
  maxBytes = 5 * 1024 * 1024,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new HttpError(400, 'ERR_FILE_EMPTY', 'File kosong atau tidak valid.');
  }
  if (buffer.length > maxBytes) {
    throw new HttpError(413, 'ERR_FILE_TOO_LARGE', `Ukuran file maksimal ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }

  const name = String(originalName || '');
  const parts = name.toLowerCase().split('.');
  const ext = parts.length > 1 ? parts.pop() : '';
  // Tolak double-extension berbahaya, contoh: shell.php.jpg
  if (parts.some((p) => /^(php\d?|phtml|asp|aspx|jsp|exe|sh|bat|cmd|js|mjs|html?|svg)$/.test(p))) {
    throw new HttpError(400, 'ERR_FILE_NAME', 'Nama file tidak diizinkan.');
  }

  // Deteksi tipe berdasarkan magic bytes (BUKAN dari Content-Type / ekstensi user)
  const detected = allowedTypes.find((mime) => FILE_TYPES[mime]?.check(buffer));
  if (!detected) {
    throw new HttpError(415, 'ERR_FILE_TYPE', 'Tipe file tidak diizinkan.');
  }
  if (!FILE_TYPES[detected].exts.includes(ext)) {
    throw new HttpError(415, 'ERR_FILE_EXT_MISMATCH', 'Ekstensi file tidak sesuai dengan isi file.');
  }

  // Scan konten berbahaya
  const sample = buffer.toString('latin1');
  const patterns = detected === 'application/pdf' ? DANGEROUS_PDF_PATTERNS : DANGEROUS_PATTERNS;
  if (patterns.some((re) => re.test(sample))) {
    throw new HttpError(422, 'ERR_FILE_MALICIOUS', 'File terdeteksi mengandung konten berbahaya.');
  }

  const safeExt = FILE_TYPES[detected].exts[0];
  return {
    mime: detected,
    ext: safeExt,
    // Nama file acak: jangan pernah simpan dengan nama asli dari user
    safeName: `${crypto.randomUUID()}.${safeExt}`,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex')
  };
}
