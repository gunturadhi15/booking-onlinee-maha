import { defineConfig } from 'vite';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database', 'booking.db');

import { getDatabase } from './database/init-db.js';
import { createApiHandler } from './server/api-handler.js';

let sharedApiHandler = null;

function apiPlugin() {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      if (!sharedApiHandler) {
        sharedApiHandler = createApiHandler({
          getDb: () => getDatabase(),
          env: process.env,
          logger: console
        });
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) {
          return next();
        }
        await sharedApiHandler(req, res);
      });
    }
  };
}


function inlineCssPlugin() {
  return {
    name: 'inline-css-plugin',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const distDir = path.join(__dirname, 'dist');
      const htmlPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(htmlPath)) return;

      let html = fs.readFileSync(htmlPath, 'utf-8');
      const assetsDir = path.join(distDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        const cssFiles = files.filter(f => f.endsWith('.css'));

        for (const cssFile of cssFiles) {
          const cssPath = path.join(assetsDir, cssFile);
          const cssContent = fs.readFileSync(cssPath, 'utf-8');
          const linkRegex = new RegExp(`<link[^>]*href="[^"]*${cssFile}"[^>]*>`, 'gi');
          if (linkRegex.test(html)) {
            html = html.replace(linkRegex, `<style id="inlined-critical-css">${cssContent}</style>`);
          } else {
            html = html.replace('</head>', `<style id="inlined-critical-css">${cssContent}</style></head>`);
          }
        }
        fs.writeFileSync(htmlPath, html, 'utf-8');
      }
    }
  };
}

export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [apiPlugin(), inlineCssPlugin()],
  server: {
    port: 5173,
    host: true,
    fs: {
      deny: ['.env', '.env.*', '**/*.db', '**/*.sqlite', 'database/**', 'server/**']
    }
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  build: {
    cssCodeSplit: true,
    cssMinify: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            return 'vendor';
          }
          if (id.includes('/src/i18n.js') || id.includes('/src/benefitTranslations.js') || id.includes('/src/packageTranslations.js')) {
            return 'translations';
          }
        }
      }
    }
  }
});
