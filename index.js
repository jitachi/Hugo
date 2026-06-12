#!/usr/bin/env node

'use strict';

const { execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME type map for common static asset extensions
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
  '.txt':  'text/plain; charset=utf-8',
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

// ---------------------------------------------------------------------------
// Build step — compile CSS then run Hugo
// ---------------------------------------------------------------------------
function build() {
  console.log('[build] Running npm run build (CSS compilation)...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('[build] Running hugo...');
  execSync('hugo', { stdio: 'inherit' });

  console.log('[build] Build complete. Static files are in ./public');
}

// ---------------------------------------------------------------------------
// HTTP server — serve files from ./public
// ---------------------------------------------------------------------------
function serve() {
  const server = http.createServer((req, res) => {
    // Strip query string and decode URI
    const urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Resolve to an absolute path inside PUBLIC_DIR (prevent path traversal)
    let filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // If the resolved path is a directory, look for index.html inside it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      const status = err ? 404 : 200;
      const contentType = err ? 'text/plain' : getMimeType(filePath);

      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} → ${status}`);

      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  server.listen(PORT, () => {
    console.log(`[server] Serving ./public on http://0.0.0.0:${PORT}`);
  });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
try {
  build();
} catch (err) {
  console.error('[build] Build failed:', err.message);
  process.exit(1);
}

serve();
