/**
 * Sacred Journey Bali - Standalone Node.js Backend API Server
 * Engine: Node.js native http + node:sqlite + secure API handler
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase, getDatabase } from './database/init-db.js';
import { createApiHandler } from './server/api-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Initialize SQLite DB
initDatabase();

const handleApi = createApiHandler({
  getDb: () => getDatabase(),
  env: process.env,
  logger: console
});

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://localhost:${PORT}`);
  if (parsedUrl.pathname.startsWith('/api/')) {
    return handleApi(req, res);
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'error', message: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Sacred Journey Secure API Server aktif di http://localhost:${PORT}`);
});

