// Kleiner Server zum lokalen Ansehen der Website und für den AKKI Smart Editor.
// Liefert die Dateien aus public/ aus und bietet /api/doi (Crossref-Abfrage).
// Keine Zusatzpakete nötig.
// Start: node --env-file-if-exists=.env server.js
//   (ohne .env läuft alles außer der KI-Einführung, die Felder bleiben dann zum selbst Schreiben)
//
// Datenschutz: Eingegebene DOIs, Texte und Abfrage-Ergebnisse werden weder gespeichert noch geloggt.
// Der API-Schlüssel steht nur in .env und wird nie ausgegeben.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');

// Der Smart Editor liegt bewusst NICHT in public/, damit er nie mit veröffentlicht wird.
// Nur dieser Server liefert ihn aus, und nur an diesen Rechner (KONZEPT.md, Abschnitt 4).
const REDAKTION = path.join(__dirname, 'redaktion', 'redaktion.html');
const NUR_LOKAL = new Set(['/redaktion', '/redaktion/', '/redaktion.html']);

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
<body style="font-family:sans-serif;background:#FFFFFF;color:#002B45;padding:40px 16px;text-align:center">
<h1>Diese Seite folgt</h1><p>Sie ist noch nicht gebaut.</p><p><a href="/" style="color:#00508A">Zur Startseite</a></p>
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

// --- Nächster KI-Lab-Termin (erster Dienstag im Monat, 18–19 Uhr, Zeitzone Berlin) ---

function berlinJetzt() {
  const teile = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const t = Object.fromEntries(teile.map(p => [p.type, Number(p.value)]));
  return { jahr: t.year, monat: t.month, tag: t.day, stunde: t.hour };
}

function ersterDienstag(jahr, monat) {
  const wochentag = new Date(Date.UTC(jahr, monat - 1, 1)).getUTCDay(); // 0 = Sonntag, 2 = Dienstag
  return 1 + ((2 - wochentag + 7) % 7);
}

function naechsterTermin() {
  const j = berlinJetzt();
  let jahr = j.jahr, monat = j.monat, tag = ersterDienstag(jahr, monat);
  // Termin dieses Monats schon vorbei (nach 19 Uhr am Termintag)? Dann nächster Monat.
  if (j.tag > tag || (j.tag === tag && j.stunde >= 19)) {
    monat += 1;
    if (monat > 12) { monat = 1; jahr += 1; }
    tag = ersterDienstag(jahr, monat);
  }
  const zwei = n => String(n).padStart(2, '0');
  return { datum: `${jahr}-${zwei(monat)}-${zwei(tag)}`, beginn: '18:00', ende: '19:00' };
}

// --- KI-Einführung für den Newsletter (Claude API, Schlüssel aus .env) ---------

const MAX_ZEICHEN = 500;
const KI_MODELL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';

// VORSCHLAG – vom Team zu prüfen und freizugeben (siehe CLAUDE.md).
const SYSTEMPROMPT_EINFUEHRUNG = `Du schreibst die kurze Themeneinführung für eine Einladung zum DGOU KI Lab. Das ist ein Online-Treffen des AKKI (Arbeitskreis Künstliche Intelligenz der AG Digitalisierung der DGOU) für Ärztinnen und Ärzte aus Orthopädie und Unfallchirurgie.

Regeln:
- Verwende nur das angegebene Thema, die Referentin oder den Referenten und die Stichpunkte. Erfinde keine Fakten, Zahlen, Studien, Titel oder Funktionen.
- Höchstens 450 Zeichen einschließlich Leerzeichen, zwei bis drei Sätze.
- Deutsch, sachlich und einladend, ohne Werbesprache und ohne Emojis.
- Keine Anrede, keine Grußformel, kein Datum, keine Uhrzeit, keine Links.
- Gib nur den Einführungstext aus.`;

function aufLaengeKuerzen(text) {
  if (text.length <= MAX_ZEICHEN) return text;
  const teil = text.slice(0, MAX_ZEICHEN);
  const satzende = Math.max(teil.lastIndexOf('. '), teil.lastIndexOf('! '), teil.lastIndexOf('? '));
  if (satzende > 200) return teil.slice(0, satzende + 1);
  return teil.slice(0, teil.lastIndexOf(' ', MAX_ZEICHEN - 1)) + '…';
}

function koerperLesen(req, grenze = 10000) {
  return new Promise((ok, fehler) => {
    let daten = '';
    req.setEncoding('utf8');
    req.on('data', stueck => {
      daten += stueck;
      if (daten.length > grenze) { fehler(new Error('zu gross')); req.destroy(); }
    });
    req.on('end', () => ok(daten));
    req.on('error', fehler);
  });
}

async function apiEinfuehrung(req, res) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(res, 503, { fehler: 'Kein API-Schlüssel in .env. Bitte die Einführung selbst schreiben.' });
  }
  let eingabe;
  try { eingabe = JSON.parse(await koerperLesen(req)); } catch { return json(res, 400, { fehler: 'Ungültige Anfrage.' }); }
  const thema = String(eingabe.thema || '').trim().slice(0, 300);
  const referent = String(eingabe.referent || '').trim().slice(0, 200);
  const stichpunkte = String(eingabe.stichpunkte || '').trim().slice(0, 3000);
  if (!thema) return json(res, 400, { fehler: 'Bitte zuerst ein Thema eintragen.' });

  const nachricht = `Thema: ${thema}\nReferent:in: ${referent || '(nicht angegeben)'}\nStichpunkte:\n${stichpunkte || '(keine)'}`;

  try {
    const antwort = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2026-10-21',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
      },
      body: JSON.stringify({
        model: KI_MODELL,
        max_tokens: 4000,
        output_config: { effort: 'low' },
        fallbacks: 'default',
        system: SYSTEMPROMPT_EINFUEHRUNG,
        messages: [{ role: 'user', content: nachricht }],
      }),
      signal: AbortSignal.timeout(60000),
    });
    const d = await antwort.json();
    if (!antwort.ok) {
      const grund = antwort.status === 401 ? 'Der API-Schlüssel in .env wird nicht akzeptiert.'
        : antwort.status === 429 ? 'Zu viele Anfragen. Bitte kurz warten und noch einmal versuchen.'
        : 'Die KI ist gerade nicht erreichbar. Bitte selbst schreiben oder später versuchen.';
      return json(res, 502, { fehler: grund });
    }
    if (d.stop_reason === 'refusal') {
      return json(res, 502, { fehler: 'Die KI hat diese Anfrage abgelehnt. Bitte die Einführung selbst schreiben.' });
    }
    const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    if (!text) return json(res, 502, { fehler: 'Die KI hat keinen Text geliefert. Bitte noch einmal versuchen.' });
    return json(res, 200, { einfuehrung: aufLaengeKuerzen(text) });
  } catch {
    return json(res, 502, { fehler: 'Die KI ist nicht erreichbar. Bitte Internetverbindung prüfen.' });
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

  if ((NUR_LOKAL.has(urlPath) || urlPath.startsWith('/api/')) && !istLokal(req)) return seiteFolgt(res);

  if (urlPath === '/api/doi') {
    if (req.method !== 'GET') return json(res, 405, { fehler: 'Nur GET erlaubt.' });
    return apiDoi(req, res, url);
  }
  if (urlPath === '/api/naechster-termin') return json(res, 200, naechsterTermin());
  if (urlPath === '/api/status') return json(res, 200, { ki: Boolean(process.env.ANTHROPIC_API_KEY) });
  if (urlPath === '/api/einfuehrung') {
    if (req.method !== 'POST') return json(res, 405, { fehler: 'Nur POST erlaubt.' });
    return apiEinfuehrung(req, res);
  }
  if (urlPath.startsWith('/api/')) return json(res, 404, { fehler: 'Unbekannte Schnittstelle.' });

  if (NUR_LOKAL.has(urlPath)) {
    if (urlPath !== '/redaktion') { res.writeHead(301, { Location: '/redaktion' }); return res.end(); }
    return fs.readFile(REDAKTION, (err, inhalt) => {
      if (err) return seiteFolgt(res);
      res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store' });
      res.end(inhalt);
    });
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
  console.log(`AKKI Smart Editor (nur lokal): http://localhost:${PORT}/redaktion`);
});
