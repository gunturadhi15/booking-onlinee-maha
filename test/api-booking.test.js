import test from 'node:test';
import assert from 'node:assert/strict';
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

  const env = {
    ADMIN_API_TOKEN: 'secret-admin-token-min-32-chars-long-test',
    PAYMENT_GATEWAY_SERVER_KEY: 'test-gateway-key',
    NODE_ENV: 'test',
    ALLOW_SIMULATED_PAYMENTS: 'false',
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

  return { db, handler, env };
}

function createMockReqRes({ method = 'GET', url = '/', body = null, headers = {} }) {
  const reqHeaders = {
    origin: 'http://localhost:5173',
    host: 'localhost:5173',
    ...headers
  };

  const req = {
    method,
    url,
    headers: reqHeaders,
    socket: { remoteAddress: '127.0.0.1' },
    [Symbol.asyncIterator]: async function* () {
      if (body) {
        const str = typeof body === 'string' ? body : JSON.stringify(body);
        yield Buffer.from(str);
      }
    }
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
      try {
        parsed = JSON.parse(responseData);
      } catch {
        parsed = responseData;
      }
      return { status: statusCode, headers: resHeaders, body: parsed };
    }
  };
}

test('API Booking Endpoints Tests', async (t) => {
  const { db, handler } = createTestContext();

  const futureDate = new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10);

  await t.test('POST /api/bookings creates valid booking and recalculates total in server', async () => {
    const { req, res, getResponse } = createMockReqRes({
      method: 'POST',
      url: '/api/bookings',
      headers: { 'content-type': 'application/json' },
      body: {
        customer_name: 'Wayan Suartana',
        email: 'wayan.suartana@example.com',
        phone: '6281234567890',
        service_id: 'SRV001',
        package_id: 'PKG001',
        booking_date: futureDate,
        booking_time: '09:00',
        pax: 2,
        payment_method: 'card',
        notes: 'Vegetarian lunch requested',
        // Client tries to spoof total price as Rp 100
        total_amount: 100
      }
    });

    await handler(req, res);
    const resp = getResponse();

    assert.strictEqual(resp.status, 201);
    assert.strictEqual(resp.body.status, 'success');
    // Package PKG001 price is Rp 350.000, 2 pax = Rp 700.000
    assert.strictEqual(resp.body.data.total_amount, 700000);
    assert.strictEqual(resp.body.data.status, 'pending');

    // Verify record in SQLite database
    const booking = db.prepare('SELECT * FROM bookings WHERE booking_id = ?').get(resp.body.data.booking_id);
    assert.ok(booking);
    assert.strictEqual(Number(booking.total_amount), 700000);
    assert.strictEqual(booking.status, 'pending');
  });

  await t.test('POST /api/bookings rejects past dates', async () => {
    const { req, res, getResponse } = createMockReqRes({
      method: 'POST',
      url: '/api/bookings',
      headers: { 'content-type': 'application/json' },
      body: {
        customer_name: 'Sarah Connor',
        email: 'sarah@example.com',
        phone: '6281234567890',
        service_id: 'SRV001',
        package_id: 'PKG001',
        booking_date: '2020-01-01',
        booking_time: '09:00',
        pax: 1,
        payment_method: 'card'
      }
    });

    await handler(req, res);
    const resp = getResponse();
    assert.strictEqual(resp.status, 422);
    assert.strictEqual(resp.body.code, 'ERR_VALIDATION');
  });

  await t.test('POST /api/bookings rejects invalid pax count', async () => {
    const { req, res, getResponse } = createMockReqRes({
      method: 'POST',
      url: '/api/bookings',
      headers: { 'content-type': 'application/json' },
      body: {
        customer_name: 'David Miller',
        email: 'david@example.com',
        phone: '6281234567890',
        service_id: 'SRV001',
        package_id: 'PKG001',
        booking_date: futureDate,
        booking_time: '09:00',
        pax: 0,
        payment_method: 'card'
      }
    });

    await handler(req, res);
    const resp = getResponse();
    assert.strictEqual(resp.status, 422);
  });

  await t.test('GET /api/availability returns slot quota for public clients', async () => {
    const { req, res, getResponse } = createMockReqRes({
      method: 'GET',
      url: `/api/availability?date=${futureDate}`
    });

    await handler(req, res);
    const resp = getResponse();
    assert.strictEqual(resp.status, 200);
    assert.strictEqual(resp.body.status, 'success');
    assert.ok(Array.isArray(resp.body.data));
    const slot09 = resp.body.data.find((s) => s.time_slot === '09:00');
    assert.ok(slot09);
    // 2 pax was booked earlier
    assert.strictEqual(slot09.booked_pax, 2);
    assert.strictEqual(slot09.remaining_quota, 6);
  });
});
