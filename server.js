// Kleiner Server zum lokalen Ansehen der Website und für den AKKI Smart Editor.
// Liefert die Dateien aus public/ aus und bietet /api/doi (Crossref-Abfrage).
// Keine Zusatzpakete nötig.
// Start: node server.js   (später mit KI-Teil: node --env-file=.env server.js)
//
// Datenschutz: Eingegebene DOIs, Texte und Abfrage-Ergebnisse werden weder gespeichert noch geloggt.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');

// Nur auf diesem Rechner erreichbar (KONZEPT.md, Abschnitt 4)
const NUR_LOKAL = new Set(['/redaktion.html', '/api/doi']);

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

function json(res, status, daten) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(daten));
}

function istLokal(req) {
  const a = req.socket.remoteAddress || '';
  return a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1';
}

// --- Crossref ---------------------------------------------------------------

// Nimmt "10.xxxx/...", "doi:10.xxxx/..." oder "https://doi.org/10.xxxx/..." an
function doiBereinigen(eingabe) {
  let d = String(eingabe || '').trim();
  d = d.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '');
  return /^10\.\d{4,9}\/\S+$/.test(d) ? d : null;
}

// Crossref liefert Abstracts oft mit JATS-Auszeichnung (<jats:p> usw.) – als reinen Text zurückgeben
function abstractAlsText(roh) {
  if (!roh) return '';
  return roh
    .replace(/<jats:title>[^<]*<\/jats:title>/gi, '')
    .replace(/<\/(jats:)?p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*/g, '\n\n')
    .trim();
}

async function crossrefAbfragen(doi) {
  const antwort = await fetch('https://api.crossref.org/works/' + encodeURIComponent(doi), {
    headers: { 'User-Agent': 'AKKI-Smart-Editor/0.1 (Prototyp)' },
    signal: AbortSignal.timeout(10000),
  });
  if (antwort.status === 404) return { status: 404, fehler: 'Zu dieser DOI hat Crossref keinen Eintrag gefunden.' };
  if (!antwort.ok) return { status: 502, fehler: 'Crossref antwortet gerade nicht. Bitte später noch einmal versuchen.' };

  const w = (await antwort.json()).message || {};
  const datum = w.issued || w['published-print'] || w['published-online'] || {};
  const jahr = (datum['date-parts'] && datum['date-parts'][0] && datum['date-parts'][0][0]) || '';
  const autoren = (w.author || []).map(a => [a.given, a.family].filter(Boolean).join(' ') || a.name || '').filter(Boolean);

  return {
    status: 200,
    daten: {
      doi: w.DOI || doi,
      titel: (w.title && w.title[0]) || '',
      autoren,
      journal: (w['container-title'] && w['container-title'][0]) || '',
      jahr: jahr ? String(jahr) : '',
      abstract: abstractAlsText(w.abstract),
    },
  };
}

async function apiDoi(req, res, url) {
  const doi = doiBereinigen(url.searchParams.get('doi'));
  if (!doi) return json(res, 400, { fehler: 'Das sieht nicht wie eine DOI aus. Beispiel: 10.1371/journal.pmed.1002686' });
  try {
    const ergebnis = await crossrefAbfragen(doi);
    if (ergebnis.fehler) return json(res, ergebnis.status, { fehler: ergebnis.fehler });
    return json(res, 200, ergebnis.daten);
  } catch {
    return json(res, 502, { fehler: 'Crossref ist nicht erreichbar. Bitte Internetverbindung prüfen.' });
  }
}

// --- Server -----------------------------------------------------------------

http.createServer((req, res) => {
  let url, urlPath;
  try {
    url = new URL(req.url, 'http://localhost');
    urlPath = decodeURIComponent(url.pathname);
  } catch {
    return seiteFolgt(res);
  }

  if (NUR_LOKAL.has(urlPath) && !istLokal(req)) return seiteFolgt(res);

  if (urlPath === '/api/doi') {
    if (req.method !== 'GET') return json(res, 405, { fehler: 'Nur GET erlaubt.' });
    return apiDoi(req, res, url);
  }
  if (urlPath.startsWith('/api/')) return json(res, 404, { fehler: 'Unbekannte Schnittstelle.' });

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
  console.log(`AKKI Smart Editor (nur lokal): http://localhost:${PORT}/redaktion.html`);
});
