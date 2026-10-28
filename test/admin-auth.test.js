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

  return { db, handler, env };
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

test('Admin Authorization & Security Controls Tests', async (t) => {
  const { handler, env } = createTestContext();

  await t.test('GET /api/admin/bookings rejects request with missing Authorization header', async () => {
    const { req, res, getResponse } = createMockReqRes({
      method: 'GET',
      url: '/api/admin/bookings'
    });

    await handler(req, res);
    const resp = getResponse();
    assert.strictEqual(resp.status, 401);
    assert.strictEqual(resp.body.code, 'ERR_UNAUTHORIZED');
  });

  await t.test('GET /api/admin/bookings rejects request with wrong token', async () => {
    const { req, res, getResponse } = createMockReqRes({
      method: 'GET',
      url: '/api/admin/bookings',
      headers: {
        authorization: 'Bearer wrong-or-tampered-token'
      }
    });

    await handler(req, res);
    const resp = getResponse();
    assert.strictEqual(resp.status, 401);
  });

  await t.test('GET /api/admin/bookings succeeds with correct Bearer token', async () => {
    const { req, res, getResponse } = createMockReqRes({
      method: 'GET',
      url: '/api/admin/bookings',
      headers: {
        authorization: `Bearer ${env.ADMIN_API_TOKEN}`
      }
    });

    await handler(req, res);
    const resp = getResponse();
    assert.strictEqual(resp.status, 200);
    assert.strictEqual(resp.body.status, 'success');
    assert.ok(Array.isArray(resp.body.data));
  });
});
