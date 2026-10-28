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

  return { db, handler };
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
    [Symbol.asyncIterator]: async function* () {
      if (body) {
        yield Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
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
      try { parsed = JSON.parse(responseData); } catch { parsed = responseData; }
      return { status: statusCode, headers: resHeaders, body: parsed };
    }
  };
}

test('Concurrency & Slot Capacity Protection Tests', async (t) => {
  const { handler } = createTestContext();
  const testDate = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
  const timeSlot = '12:00';

  await t.test('Prevents overbooking when remaining slot capacity is exceeded', async () => {
    // 1. First booking: 6 pax (Capacity is 8) -> OK
    const { req: req1, res: res1, getResponse: getResp1 } = createMockReqRes({
      method: 'POST',
      url: '/api/bookings',
      headers: { 'content-type': 'application/json' },
      body: {
        customer_name: 'Customer Group One',
        email: 'group1@example.com',
        phone: '6281234567891',
        service_id: 'SRV001',
        package_id: 'PKG001',
        booking_date: testDate,
        booking_time: timeSlot,
        pax: 6,
        payment_method: 'card'
      }
    });

    await handler(req1, res1);
    const resp1 = getResp1();
    assert.strictEqual(resp1.status, 201);
    assert.strictEqual(resp1.body.status, 'success');

    // 2. Second booking: 4 pax (6 + 4 = 10 > 8 Max) -> Must be rejected with 409 ERR_SLOT_FULL
    const { req: req2, res: res2, getResponse: getResp2 } = createMockReqRes({
      method: 'POST',
      url: '/api/bookings',
      headers: { 'content-type': 'application/json' },
      body: {
        customer_name: 'Customer Group Two',
        email: 'group2@example.com',
        phone: '6281234567892',
        service_id: 'SRV001',
        package_id: 'PKG001',
        booking_date: testDate,
        booking_time: timeSlot,
        pax: 4,
        payment_method: 'card'
      }
    });

    await handler(req2, res2);
    const resp2 = getResp2();
    assert.strictEqual(resp2.status, 409);
    assert.strictEqual(resp2.body.code, 'ERR_SLOT_FULL');
    assert.ok(resp2.body.message.includes('tidak mencukupi'));

    // 3. Third booking: exactly 2 pax (6 + 2 = 8 == Max) -> Must succeed
    const { req: req3, res: res3, getResponse: getResp3 } = createMockReqRes({
      method: 'POST',
      url: '/api/bookings',
      headers: { 'content-type': 'application/json' },
      body: {
        customer_name: 'Customer Group Three',
        email: 'group3@example.com',
        phone: '6281234567893',
        service_id: 'SRV001',
        package_id: 'PKG001',
        booking_date: testDate,
        booking_time: timeSlot,
        pax: 2,
        payment_method: 'card'
      }
    });

    await handler(req3, res3);
    const resp3 = getResp3();
    assert.strictEqual(resp3.status, 201);
    assert.strictEqual(resp3.body.status, 'success');

    // 4. Fourth booking: even 1 pax now exceeds slot -> Must fail
    const { req: req4, res: res4, getResponse: getResp4 } = createMockReqRes({
      method: 'POST',
      url: '/api/bookings',
      headers: { 'content-type': 'application/json' },
      body: {
        customer_name: 'Customer Solo',
        email: 'solo@example.com',
        phone: '6281234567894',
        service_id: 'SRV001',
        package_id: 'PKG001',
        booking_date: testDate,
        booking_time: timeSlot,
        pax: 1,
        payment_method: 'card'
      }
    });

    await handler(req4, res4);
    const resp4 = getResp4();
    assert.strictEqual(resp4.status, 409);
    assert.strictEqual(resp4.body.code, 'ERR_SLOT_FULL');
  });
});
