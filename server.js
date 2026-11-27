// Kleiner Server zum lokalen Ansehen der Website.
// Liefert nur Dateien aus dem Ordner public/ aus. Keine Zusatzpakete nötig.
// Start: node server.js   (später mit KI-Teil: node --env-file=.env server.js)

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function seiteFolgt(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Seite folgt – AKKI</title></head>
<body style="font-family:sans-serif;background:#F4F7FA;color:#0D2740;padding:40px 16px;text-align:center">
<h1>Diese Seite folgt</h1><p>Sie ist noch nicht gebaut.</p><p><a href="/" style="color:#0B7A74">Zur Startseite</a></p>
</body></html>`);
}

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return seiteFolgt(res);
  }
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  const datei = path.normalize(path.join(ROOT, urlPath));
  // Nur Dateien innerhalb von public/, keine versteckten Dateien
  if (!datei.startsWith(ROOT + path.sep) || path.basename(datei).startsWith('.')) {
    return seiteFolgt(res);
  }

  fs.readFile(datei, (err, inhalt) => {
    if (err) return seiteFolgt(res);
    const typ = TYPES[path.extname(datei).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': typ });
    res.end(inhalt);
  });
}).listen(PORT, () => {
  console.log(`AKKI-Website läuft: http://localhost:${PORT}`);
});
