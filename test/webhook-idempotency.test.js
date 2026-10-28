import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiHandler } from '../server/api-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

function createTestContext() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(schemaSql);

  const gatewayKey = 'test-midtrans-server-key-12345';
  const env = {
    ADMIN_API_TOKEN: 'secret-admin-token-min-32-chars-long-test',
    PAYMENT_GATEWAY_SERVER_KEY: gatewayKey,
    NODE_ENV: 'test',
    ALLOWED_ORIGINS: 'http://localhost:5173'
  };

  const handler = createApiHandler({
    getDb: () => db,
    env,
    logger: {
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {}
    }
  });

  return { db, handler, gatewayKey };
}

function createMockReqRes({ method = 'GET', url = '/', body = null, headers = {} }) {
  const req = {
    method,
    url,
    headers: {
      origin: 'http://localhost:5173',
      host: 'localhost:5173',
      ...headers
    },
    socket: { remoteAddress: '127.0.0.1' },
    body
  };

  let statusCode = 200;
  const resHeaders = {};
  let responseData = '';

  const res = {
    setHeader: (k, v) => { resHeaders[k.toLowerCase()] = v; },
    getHeader: (k) => resHeaders[k.toLowerCase()],
    removeHeader: (k) => { delete resHeaders[k.toLowerCase()]; },
    set statusCode(code) { statusCode = code; },
    get statusCode() { return statusCode; },
    end: (data) => {
      if (data) responseData += data.toString();
    }
  };

  return {
    req,
    res,
    getResponse: () => {
      let parsed = null;
      try { parsed = JSON.parse(responseData); } catch { parsed = responseData; }
      return { status: statusCode, headers: resHeaders, body: parsed };
    }
  };
}

test('Webhook & Signature Verification Tests', async (t) => {
  const { db, handler, gatewayKey } = createTestContext();

  const futureDate = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);
  const orderId = 'TRX-20261028-TESTWEBHOOK1';
  const bookingId = 'MWJ-TEST-20261028-001';
  const customerId = 'CUST-TEST-001';

  // Seed sample booking and payment
  db.prepare(`INSERT INTO customers (customer_id, name, email, phone) VALUES (?, ?, ?, ?)`).run(customerId, 'Test User', 'test@example.com', '6281234567890');
  db.prepare(`INSERT INTO services (service_id, service_name, category) VALUES ('SRV001', 'Test Service', 'Tour')`).run();
  db.prepare(`INSERT INTO packages (package_id, service_id, package_name, price, duration) VALUES ('PKG001', 'SRV001', 'Test Pkg', 350000, '3h')`).run();
  db.prepare(`INSERT INTO bookings (booking_id, customer_id, service_id, package_id, booking_date, booking_time, pax, subtotal, tax, total_amount, status) VALUES (?, ?, 'SRV001', 'PKG001', ?, '09:00:00', 1, 350000, 0, 350000, 'pending')`).run(bookingId, customerId, futureDate);
  db.prepare(`INSERT INTO payments (payment_id, booking_id, order_id, idempotency_key, payment_method, amount, status, expired_at) VALUES ('PAY-001', ?, ?, ?, 'qris', 350000, 'pending', datetime('now', '+1 day'))`).run(bookingId, orderId, orderId);

  await t.test('POST /api/payments/webhook rejects tampered or invalid signature', async () => {
    const { req, res, getResponse } = createMockReqRes({
      method: 'POST',
      url: '/api/payments/webhook',
      headers: { 'content-type': 'application/json' },
      body: {
        order_id: orderId,
        status_code: '200',
        gross_amount: '350000',
        transaction_status: 'settlement',
        signature_key: 'tampered-signature-invalid'
      }
    });

    await handler(req, res);
    const resp = getResponse();
    assert.strictEqual(resp.status, 401);
    assert.strictEqual(resp.body.code, 'ERR_INVALID_SIGNATURE');
  });

  await t.test('POST /api/payments/webhook accepts valid signature and confirms payment', async () => {
    // Generate valid Midtrans SHA-512 signature: sha512(order_id + status_code + gross_amount + ServerKey)
    const rawSig = `${orderId}200350000${gatewayKey}`;
    const validSignature = crypto.createHash('sha512').update(rawSig).digest('hex');

    const { req, res, getResponse } = createMockReqRes({
      method: 'POST',
      url: '/api/payments/webhook',
      headers: { 'content-type': 'application/json' },
      body: {
        order_id: orderId,
        status_code: '200',
        gross_amount: '350000',
        transaction_status: 'settlement',
        signature_key: validSignature
      }
    });

    await handler(req, res);
    const resp = getResponse();
    assert.strictEqual(resp.status, 200);
    assert.strictEqual(resp.body.status, 'success');

    // Verify database state: payment is paid, booking is confirmed
    const payment = db.prepare('SELECT status, paid_at FROM payments WHERE order_id = ?').get(orderId);
    assert.strictEqual(payment.status, 'paid');
    assert.ok(payment.paid_at);

    const booking = db.prepare('SELECT status FROM bookings WHERE booking_id = ?').get(bookingId);
    assert.strictEqual(booking.status, 'confirmed');
  });
});
