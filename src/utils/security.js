/**
 * Security Utilities (Isomorphic: Browser + Node.js)
 *
 * Modul ini TIDAK bergantung pada window/document sehingga bisa dipakai
 * oleh frontend (render HTML aman) maupun backend (validasi server-side).
 *
 * Prinsip:
 * 1. Validasi input  -> tolak data yang tidak sesuai format (allowlist).
 * 2. Sanitasi input  -> buang karakter kontrol / berbahaya, batasi panjang.
 * 3. Escape output   -> setiap data dinamis yang masuk ke HTML WAJIB di-escape.
 */

/* ------------------------------------------------------------------ */
/* Batas panjang input (dipakai di frontend & backend agar konsisten)  */
/* ------------------------------------------------------------------ */
export const INPUT_LIMITS = Object.freeze({
  NAME_MIN: 2,
  NAME_MAX: 100,
  customer_name: 100,
  EMAIL_MAX: 254,
  email: 254,
  PHONE_MIN: 7,
  PHONE_MAX: 15,
  phone: 15,
  NOTES_MAX: 1000,
  notes: 1000,
  SERIALIZED_NOTES_MAX: 1800,
  ADDRESS_MAX: 300,
  address: 300,
  MESSAGE_MAX: 1000,
  message: 1000,
  ID_MAX: 80
});

export const PAYMENT_METHODS = Object.freeze(['card', 'paypal', 'qris']);

/* ------------------------------------------------------------------ */
/* Anti-XSS: HTML escaping                                             */
/* ------------------------------------------------------------------ */
const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};

/**
 * Escape nilai apa pun agar aman disisipkan ke dalam HTML
 * (baik sebagai teks maupun nilai atribut yang diapit tanda kutip).
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPES[ch]);
}

/** Alias pendek untuk template literal: `${esc(data.name)}` */
export const esc = escapeHtml;

/* ------------------------------------------------------------------ */
/* Sanitasi input                                                      */
/* ------------------------------------------------------------------ */
// Karakter kontrol + karakter bidi/zero-width yang sering dipakai untuk spoofing
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

/**
 * Membersihkan teks bebas dari user.
 * - Normalisasi unicode (NFC)
 * - Hapus karakter kontrol & bidi override
 * - Hapus tanda < > (defense-in-depth, escaping output tetap wajib)
 * - Rapikan whitespace & batasi panjang
 */
export function sanitizeText(value, maxLength = 255, { multiline = false } = {}) {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (typeof text.normalize === 'function') text = text.normalize('NFC');
  text = text.replace(CONTROL_CHARS, '').replace(/[<>]/g, '');
  text = multiline
    ? text.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')
    : text.replace(/\s+/g, ' ');
  return text.trim().slice(0, maxLength);
}

/** Hanya menyisakan digit (untuk nomor telepon) */
export function digitsOnly(value, maxLength = 20) {
  return String(value ?? '').replace(/\D/g, '').slice(0, maxLength);
}

/* ------------------------------------------------------------------ */
/* Validasi input (allowlist)                                          */
/* ------------------------------------------------------------------ */
const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const EMAIL_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const INVOICE_REGEX = /^INV-[A-Z0-9-]{6,40}$/;
const BOOKING_CODE_REGEX = /^MWJ-[A-Z0-9-]{3,76}$/;
const ORDER_ID_REGEX = /^[A-Z0-9][A-Z0-9-]{5,63}$/;
const GENERIC_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;

export function isValidName(name) {
  if (typeof name !== 'string') return false;
  const len = name.trim().length;
  return len >= INPUT_LIMITS.NAME_MIN && len <= INPUT_LIMITS.NAME_MAX && NAME_REGEX.test(name.trim());
}

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const value = email.trim();
  if (value.length > INPUT_LIMITS.EMAIL_MAX) return false;
  const [local] = value.split('@');
  if (!local || local.length > 64) return false;
  return EMAIL_REGEX.test(value);
}

export function isValidPhoneDigits(phone) {
  return typeof phone === 'string'
    && /^\d+$/.test(phone)
    && phone.length >= INPUT_LIMITS.PHONE_MIN
    && phone.length <= INPUT_LIMITS.PHONE_MAX;
}

/** Validasi format YYYY-MM-DD dan memastikan tanggalnya benar-benar ada */
export function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function isValidTimeString(value) {
  return typeof value === 'string' && TIME_REGEX.test(value);
}

export function isValidInvoiceId(value) {
  return typeof value === 'string' && INVOICE_REGEX.test(value);
}

export function isValidBookingCode(value) {
  return typeof value === 'string' && BOOKING_CODE_REGEX.test(value);
}

export function isValidOrderId(value) {
  return typeof value === 'string' && ORDER_ID_REGEX.test(value);
}

export function isValidGenericId(value) {
  return typeof value === 'string' && GENERIC_ID_REGEX.test(value);
}

/** Mengembalikan value jika ada di allowlist, jika tidak kembalikan fallback */
export function pickAllowed(value, allowed, fallback = null) {
  return allowed.includes(value) ? value : fallback;
}

/* ------------------------------------------------------------------ */
/* Random yang aman secara kriptografis (bukan Math.random)            */
/* ------------------------------------------------------------------ */
const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa karakter ambigu (0/O, 1/I)

export function secureRandomString(length = 8, alphabet = ALPHANUM) {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.getRandomValues) {
    throw new Error('Secure random generator tidak tersedia.');
  }
  const bytes = new Uint8Array(length);
  cryptoObj.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/** Nomor invoice yang sulit ditebak, contoh: INV-20261023-7KQ2M9XA */
export function generateInvoiceId(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `INV-${y}${m}${d}-${secureRandomString(8)}`;
}
