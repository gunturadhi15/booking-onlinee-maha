/**
 * Vercel Serverless Function Adapter for Sacred Journey / Mahawellnerjourney API
 * Route: /api/* -> server/api-handler.js
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { createApiHandler } from '../server/api-handler.js';

let sharedHandler = null;
let sharedDb = null;

function getDbInstance() {
  if (sharedDb) return sharedDb;

  const isVercel = Boolean(process.env.VERCEL);
  const dbDir = isVercel ? '/tmp' : path.join(process.cwd(), 'database');
  const dbPath = path.join(dbDir, 'booking.db');

  if (!fs.existsSync(dbDir)) {
    try { fs.mkdirSync(dbDir, { recursive: true }); } catch { /* ignore */ }
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');

  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schemaSql);
  }

  sharedDb = db;
  return db;
}

export default async function handler(req, res) {
  if (!sharedHandler) {
    sharedHandler = createApiHandler({
      getDb: () => getDbInstance(),
      env: process.env,
      logger: console
    });
  }
  return sharedHandler(req, res);
}
