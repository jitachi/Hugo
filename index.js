const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".map": "application/json",
};

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      serve404(res);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function serve404(res) {
  const notFoundPath = path.join(PUBLIC_DIR, "404.html");
  fs.readFile(notFoundPath, (err, data) => {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(err ? "404 Not Found" : data);
  });
}

const server = http.createServer((req, res) => {
  // Strip query string and decode URI
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split("?")[0]);
  } catch {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }

  // Prevent directory traversal
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      serve404(res);
      return;
    }

    if (stats.isDirectory()) {
      // Try index.html inside the directory
      const indexPath = path.join(filePath, "index.html");
      fs.stat(indexPath, (err2) => {
        if (err2) {
          serve404(res);
        } else {
          serveFile(indexPath, res);
        }
      });
    } else {
      serveFile(filePath, res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, serving files from ${PUBLIC_DIR}`);
});
