// Kleiner Server zum lokalen Ansehen der Website und für den AKKI Smart Editor.
// Liefert die Dateien aus public/ aus und bietet die Schnittstellen des Smart Editors (Crossref, PubMed, Speichern).
// Keine Zusatzpakete nötig.
// Start: node --env-file-if-exists=.env server.js
//   (ohne .env läuft alles außer der KI-Einführung, die Felder bleiben dann zum selbst Schreiben)
//
// Datenschutz: Eingaben und Abfrage-Ergebnisse werden nicht geloggt. Gespeichert wird nur, was ausdrücklich freigegeben wird (public/daten).
// Der API-Schlüssel steht nur in .env und wird nie ausgegeben.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

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
  '.yml': 'text/yaml; charset=utf-8',
};

function seiteFolgt(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Seite folgt – AKKI</title></head>
<body style="font-family:sans-serif;background:#FFFFFF;color:#2C4F6B;padding:40px 16px;text-align:center">
<h1>Diese Seite folgt</h1><p>Sie ist noch nicht gebaut.</p><p><a href="/" style="color:#00508A">Zur Startseite</a></p>
</body></html>`);
}

function json(res, status, daten) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(daten));
}

// --- Bearbeitungsbereich /admin: nur mit Anmeldung (HTTP Basic Auth) ---------------------
// Benutzername und Passwort stehen nur in .env (ADMIN_USER, ADMIN_PASSWORT). Fehlen sie, ist /admin gesperrt.
// Die Zugangsdaten werden weder geloggt noch ausgegeben.
function gleich(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y); // gleich lange Prüfsummen, kein Zeitunterschied
}
function adminErlaubt(req, res) {
  const user = process.env.ADMIN_USER, pass = process.env.ADMIN_PASSWORT;
  if (!user || !pass) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Der Bearbeitungsbereich ist gesperrt.');
    return false;
  }
  const kopf = String(req.headers.authorization || '');
  if (kopf.startsWith('Basic ')) {
    const roh = Buffer.from(kopf.slice(6), 'base64').toString('utf8');
    const i = roh.indexOf(':');
    if (i >= 0 && gleich(roh.slice(0, i), user) & gleich(roh.slice(i + 1), pass)) return true;
  }
  res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="AKKI Bearbeitungsbereich", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end('Anmeldung nötig.');
  return false;
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

const KOPF_ABFRAGE = { 'User-Agent': 'AKKI-Smart-Editor/0.2 (Prototyp)' };

// "Müller, Anna-Lena" -> "Müller AL" (Schreibweise der Publikationsliste)
function autorKurz(a) {
  if (!a.family) return a.name || '';
  const kuerzel = (a.given || '').split(/[\s.-]+/).filter(Boolean).map(t => t[0].toUpperCase()).join('');
  return [a.family, kuerzel].filter(Boolean).join(' ');
}
const bindestrichZuGedankenstrich = t => String(t || '').replace(/-/g, '–');

async function crossrefAbfragen(doi) {
  const antwort = await fetch('https://api.crossref.org/works/' + encodeURIComponent(doi), {
    headers: KOPF_ABFRAGE,
    signal: AbortSignal.timeout(10000),
  });
  if (antwort.status === 404) return { status: 404, fehler: 'Zu dieser DOI hat Crossref keinen Eintrag gefunden.' };
  if (!antwort.ok) return { status: 502, fehler: 'Crossref antwortet gerade nicht. Bitte später noch einmal versuchen.' };

  const w = (await antwort.json()).message || {};
  const datum = w.issued || w['published-print'] || w['published-online'] || {};
  const jahr = (datum['date-parts'] && datum['date-parts'][0] && datum['date-parts'][0][0]) || '';
  const kurzJournal = w['short-container-title'] && w['short-container-title'][0];

  return {
    status: 200,
    daten: {
      doi: w.DOI || doi,
      pubmed: '',
      titel: ((w.title && w.title[0]) || '').replace(/<[^>]+>/g, ''),
      autoren: (w.author || []).map(autorKurz).filter(Boolean),
      journal: kurzJournal || (w['container-title'] && w['container-title'][0]) || '',
      jahr: jahr ? String(jahr) : '',
      band: w.volume || '',
      heft: w.issue || '',
      seiten: bindestrichZuGedankenstrich(w.page),
      abstract: abstractAlsText(w.abstract),
    },
  };
}

// PubMed: Zusammenfassung zu einer PubMed-ID (NCBI E-Utilities)
async function pubmedAbfragen(pmid) {
  const antwort = await fetch(
    'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' + pmid,
    { headers: KOPF_ABFRAGE, signal: AbortSignal.timeout(10000) });
  if (!antwort.ok) return { status: 502, fehler: 'PubMed antwortet gerade nicht. Bitte später noch einmal versuchen.' };
  const e = ((await antwort.json()).result || {})[pmid];
  if (!e || e.error) return { status: 404, fehler: 'Zu dieser PubMed-ID gibt es keinen Eintrag.' };
  const doi = ((e.articleids || []).find(x => x.idtype === 'doi') || {}).value || '';
  return {
    status: 200,
    daten: {
      doi, pubmed: pmid,
      titel: String(e.title || '').replace(/\.$/, ''),
      autoren: (e.authors || []).map(a => a.name).filter(Boolean),
      journal: e.source || '',
      jahr: String(e.pubdate || '').slice(0, 4),
      band: e.volume || '', heft: e.issue || '', seiten: bindestrichZuGedankenstrich(e.pages),
      abstract: '',
    },
  };
}

// --- Nächster KI-Lab-Termin: jeden ersten Dienstag im Monat (vom Team bestätigt, 27.11.2026) ---
// Gleiche Regel wie public/beitraege.js. Die Uhrzeit kommt nur aus der Datei (regeltermin oder Eintrag), sonst bleibt sie leer.

function berlinHeute() {
  const t = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date()).map(p => [p.type, Number(p.value)]));
  return { jahr: t.year, monat: t.month, tag: t.day };
}
function ersterDienstag(jahr, monat) {
  const wochentag = new Date(Date.UTC(jahr, monat - 1, 1)).getUTCDay(); // 0 = Sonntag, 2 = Dienstag
  return 1 + ((2 - wochentag + 7) % 7);
}
function naechsterTermin() {
  const zwei = n => String(n).padStart(2, '0');
  const h = berlinHeute();
  const heute = `${h.jahr}-${zwei(h.monat)}-${zwei(h.tag)}`;
  let jahr = h.jahr, monat = h.monat;
  let datum = `${jahr}-${zwei(monat)}-${zwei(ersterDienstag(jahr, monat))}`;
  if (datum < heute) {
    monat += 1;
    if (monat > 12) { monat = 1; jahr += 1; }
    datum = `${jahr}-${zwei(monat)}-${zwei(ersterDienstag(jahr, monat))}`;
  }
  let daten = {};
  try { daten = JSON.parse(fs.readFileSync(path.join(ROOT, 'daten', 'beitraege.json'), 'utf8')); } catch { /* ohne Datei: kein Thema */ }
  const eintrag = (daten.kiLab || []).find(t => t.datum === datum && t.titel) || null;
  const regel = daten.regeltermin || {};
  const beginn = (eintrag && eintrag.beginn) || regel.beginn;
  const ende = (eintrag && eintrag.ende) || regel.ende;
  const ok = z => /^\d{2}:\d{2}$/.test(String(z));
  const hatZeit = ok(beginn) && ok(ende);
  return {
    datum,
    titel: eintrag ? eintrag.titel : '',
    referent: eintrag && eintrag.referent ? eintrag.referent : '',
    beginn: hatZeit ? beginn : '',
    ende: hatZeit ? ende : '',
  };
}
// --- Datendateien und Dublettenprüfung ---------------------------------------

const DATEN = path.join(ROOT, 'daten');
const PUB_DATEI = path.join(DATEN, 'publikationen.json');
const TERMIN_DATEI = path.join(DATEN, 'beitraege.json');

const dateiLesen = pfad => JSON.parse(fs.readFileSync(pfad, 'utf8'));
function dateiSchreiben(pfad, text) {
  fs.writeFileSync(pfad + '.tmp', text, 'utf8');
  fs.renameSync(pfad + '.tmp', pfad); // erst ganz schreiben, dann ersetzen
}
const heuteIso = () => new Date().toLocaleDateString('sv-SE');
const titelSchluessel = t => String(t || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');

function dublette(doi, titel) {
  const liste = dateiLesen(PUB_DATEI).publikationen || [];
  const d = String(doi || '').toLowerCase();
  const t = titelSchluessel(titel);
  return liste.find(p => (d && p.doi && p.doi.toLowerCase() === d) || (t && titelSchluessel(p.titel) === t)) || null;
}

// Nimmt DOI, PubMed-ID (nur Ziffern, auch "PMID: 123") oder doi.org-Link an
async function apiQuelle(req, res, url) {
  const eingabe = String(url.searchParams.get('q') || '').trim();
  const pmidTreffer = eingabe.match(/^(?:pmid:?\s*)?(\d{1,9})$/i);
  const doi = pmidTreffer ? null : doiBereinigen(eingabe);
  if (!pmidTreffer && !doi) {
    return json(res, 400, { fehler: 'Das sieht weder nach einer DOI noch nach einer PubMed-ID aus. Beispiele: 10.1371/journal.pmed.1002686 oder 29799845' });
  }
  try {
    let ergebnis;
    if (pmidTreffer) {
      ergebnis = await pubmedAbfragen(pmidTreffer[1]);
      if (ergebnis.fehler) return json(res, ergebnis.status, { fehler: ergebnis.fehler });
      if (ergebnis.daten.doi) { // Crossref liefert meist die vollständigeren Angaben
        const cr = await crossrefAbfragen(ergebnis.daten.doi).catch(() => null);
        if (cr && cr.daten) { cr.daten.pubmed = pmidTreffer[1]; ergebnis = cr; }
      }
    } else {
      ergebnis = await crossrefAbfragen(doi);
      if (ergebnis.fehler) return json(res, ergebnis.status, { fehler: ergebnis.fehler });
    }
    const d = ergebnis.daten;
    const treffer = dublette(d.doi, d.titel);
    d.dublette = treffer ? { titel: treffer.titel, jahr: treffer.jahr, nr: treffer.nr } : null;
    return json(res, 200, d);
  } catch {
    return json(res, 502, { fehler: 'Die Abfrage hat nicht geklappt. Bitte Internetverbindung prüfen.' });
  }
}

// --- Freigegebene Beiträge speichern ----------------------------------------
// Geschrieben wird nur nach Freigabe ("Freigegeben von"). Danach speichert (commit) und pusht das Team.

const THEMEN = ['KI', 'Telemedizin', 'Lehre', 'Apps/DiGA', 'Social Media', 'Sportmedizin', 'VR/Simulation', 'Digitalisierung allgemein'];
const KENNZEICHEN = ['AKKI-Publikation', 'AG-Publikation'];
const KATEGORIEN = ['KI-Tools', 'Automatisierung', 'Strategie', 'Praxisbericht', 'Datenschutz', 'Forschung', 'Klinische KI', 'Softwareentwicklung'];

const text = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const nurEintraege = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined));

async function jsonKoerper(req, res) {
  try { return JSON.parse(await koerperLesen(req, 60000)); } catch { json(res, 400, { fehler: 'Ungültige Anfrage.' }); return null; }
}

async function apiPublikationSpeichern(req, res) {
  const e = await jsonKoerper(req, res);
  if (!e) return;
  const doi = text(e.doi, 200) ? doiBereinigen(e.doi) : '';
  if (doi === null) return json(res, 400, { fehler: 'Die DOI ist nicht gültig.' });
  const eintrag = {
    titel: text(e.titel, 500), autoren: text(e.autoren, 1500), journal: text(e.journal, 200),
    jahr: text(e.jahr, 4), band: text(e.band, 20), heft: text(e.heft, 20), seiten: text(e.seiten, 30),
    pubmed: text(e.pubmed, 9), freigabe: text(e.freigegebenVon, 120),
  };
  const fehlt = [['titel', 'Titel'], ['autoren', 'Autoren'], ['journal', 'Journal'], ['freigabe', 'Freigegeben von']]
    .filter(([k]) => !eintrag[k]).map(([, n]) => n);
  if (!/^\d{4}$/.test(eintrag.jahr)) fehlt.push('Jahr (vier Ziffern)');
  if (eintrag.pubmed && !/^\d{1,9}$/.test(eintrag.pubmed)) fehlt.push('PubMed-ID (nur Ziffern)');
  if (fehlt.length) return json(res, 400, { fehler: 'Noch offen: ' + fehlt.join(', ') + '.' });
  const themen = (Array.isArray(e.themen) ? e.themen : []).filter(t => THEMEN.includes(t));
  const kennzeichen = KENNZEICHEN.includes(e.kennzeichen) ? e.kennzeichen : null;

  const datei = dateiLesen(PUB_DATEI);
  const liste = datei.publikationen || [];
  const treffer = dublette(doi, eintrag.titel);
  if (treffer) return json(res, 409, { fehler: `Diese Publikation steht schon auf der Seite („${treffer.titel}“, ${treffer.jahr}).` });

  const ersterAutor = (eintrag.autoren.split(',')[0] || 'autor').trim().replace(/\s+\S{1,3}$/, '');
  const wort = (eintrag.titel.toLowerCase().match(/[a-zäöüß]{4,}/g) || ['beitrag']).find(w => !['with', 'from', 'that', 'this', 'using', 'eine', 'einer', 'wird'].includes(w)) || 'beitrag';
  const basis = [ersterAutor, eintrag.jahr, wort].join('-').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let id = basis, i = 2;
  while (liste.some(p => p.id === id)) id = basis + '-' + i++;

  const angabe = [eintrag.band, eintrag.heft ? `(${eintrag.heft})` : '', eintrag.seiten ? ':' + eintrag.seiten : ''].join('') || null;
  const neu = {
    id,
    nr: Math.min(0, ...liste.map(p => p.nr || 0)) - 1, // ganz nach vorn in der Liste
    autoren: eintrag.autoren, titel: eintrag.titel, journal: eintrag.journal, jahr: Number(eintrag.jahr),
    angabe, band: eintrag.band || null, heft: eintrag.heft || null, seiten: eintrag.seiten || null,
    themen, kennzeichen, doi: doi || null, pubmed: eintrag.pubmed || null,
    quelle: 'Smart Editor (' + (eintrag.pubmed && !doi ? 'PubMed' : 'Crossref') + ')',
    freigegeben_von: eintrag.freigabe, stand: heuteIso(), status: 'bestaetigt',
  };
  // Als Text einfügen statt die ganze Datei neu zu schreiben: der Git-Verlauf zeigt nur den neuen Eintrag
  const roh = fs.readFileSync(PUB_DATEI, 'utf8');
  const marke = roh.match(/"publikationen"\s*:\s*\[/);
  if (!marke) return json(res, 500, { fehler: 'publikationen.json hat ein unerwartetes Format.' });
  const einfuegen = marke.index + marke[0].length;
  const block = JSON.stringify(neu, null, 2).replace(/^/gm, '    ');
  let ergebnis = roh.slice(0, einfuegen) + '\n' + block + ',' + roh.slice(einfuegen);
  ergebnis = ergebnis.replace(/("stand"\s*:\s*)"\d{4}-\d{2}-\d{2}"/, `$1"${heuteIso()}"`); // erstes "stand" = Dateikopf
  try { JSON.parse(ergebnis); } catch { return json(res, 500, { fehler: 'Speichern abgebrochen: Die Datei wäre ungültig geworden.' }); }
  dateiSchreiben(PUB_DATEI, ergebnis);
  return json(res, 200, { ok: true, id });
}

// beitraege.json: ein KI-Lab-Termin pro Zeile (wie in der Datei bisher)
function einzeilig(v) {
  if (Array.isArray(v)) return '[' + v.map(einzeilig).join(', ') + ']';
  if (v && typeof v === 'object') return '{ ' + Object.entries(v).map(([k, w]) => JSON.stringify(k) + ': ' + einzeilig(w)).join(', ') + ' }';
  return JSON.stringify(v);
}
function beitraegeText(d) {
  const teile = Object.entries(d).map(([k, v]) => {
    if (k === 'kiLab') return `  "kiLab": [\n${v.map(t => '    ' + einzeilig(t)).join(',\n')}\n  ]`;
    return `  ${JSON.stringify(k)}: ${JSON.stringify(v, null, 2).replace(/\n/g, '\n  ')}`;
  });
  return '{\n' + teile.join(',\n') + '\n}\n';
}

async function apiTerminSpeichern(req, res) {
  const e = await jsonKoerper(req, res);
  if (!e) return;
  const t = {
    datum: text(e.datum, 10), beginn: text(e.beginn, 5), ende: text(e.ende, 5),
    titel: text(e.titel, 200), beschreibung: text(e.beschreibung, 500), referent: text(e.referent, 120),
    freigabe: text(e.freigegebenVon, 120),
  };
  const bestaetigt = e.bestaetigt === true;
  const kategorien = (Array.isArray(e.kategorien) ? e.kategorien : []).filter(k => KATEGORIEN.includes(k));
  const fehlt = [];
  const echtesDatum = /^\d{4}-\d{2}-\d{2}$/.test(t.datum) && !isNaN(Date.parse(t.datum));
  if (!echtesDatum) fehlt.push('Datum');
  if (!t.titel) fehlt.push('Titel');
  if (!t.freigabe) fehlt.push('Freigegeben von');
  if ((t.beginn && !/^\d{2}:\d{2}$/.test(t.beginn)) || (t.ende && !/^\d{2}:\d{2}$/.test(t.ende))) fehlt.push('Uhrzeit im Format 18:00');
  if (bestaetigt && (!t.beginn || !t.ende)) fehlt.push('Beginn und Ende (für „bestätigt“)');
  if (fehlt.length) return json(res, 400, { fehler: 'Noch offen: ' + fehlt.join(', ') + '.' });

  const datei = dateiLesen(TERMIN_DATEI);
  let liste = datei.kiLab || [];
  const gleicherTag = liste.find(x => x.datum === t.datum);
  if (gleicherTag && e.ersetzen !== true) {
    return json(res, 409, { fehler: `Für diesen Tag gibt es schon einen Eintrag („${gleicherTag.titel || 'ohne Titel'}“).`, ersetzbar: true });
  }
  // Ein Monatsplatzhalter ohne Titel (z. B. "2026-10") wird durch den genauen Termin ersetzt
  liste = liste.filter(x => x.datum !== t.datum && !(x.titel === null && x.datum === t.datum.slice(0, 7)));
  liste.push(nurEintraege({
    datum: t.datum, beginn: t.beginn || undefined, ende: t.ende || undefined,
    titel: t.titel, beschreibung: t.beschreibung || undefined, referent: t.referent || undefined,
    kategorien, bestaetigt: bestaetigt || undefined,
    quelle: 'Smart Editor', freigegeben_von: t.freigabe, stand: heuteIso(), status: 'bestaetigt',
  }));
  liste.sort((a, b) => String(a.datum).localeCompare(String(b.datum)));
  datei.kiLab = liste;
  dateiSchreiben(TERMIN_DATEI, beitraegeText(datei));
  return json(res, 200, { ok: true });
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

  if (urlPath === '/admin' || urlPath.startsWith('/admin/')) {
    if (!adminErlaubt(req, res)) return;
    if (urlPath === '/admin') { res.writeHead(301, { Location: '/admin/' }); return res.end(); }
  }

  if ((NUR_LOKAL.has(urlPath) || urlPath.startsWith('/api/')) && !istLokal(req)) return seiteFolgt(res);

  // Schreibende Anfragen nur von der Editor-Seite selbst (schützt vor fremden Webseiten im Browser)
  if (req.method === 'POST' && req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) {
    return json(res, 403, { fehler: 'Anfrage nicht erlaubt.' });
  }

  if (urlPath === '/api/naechster-termin') return json(res, 200, naechsterTermin());
  if (urlPath === '/api/quelle') {
    if (req.method !== 'GET') return json(res, 405, { fehler: 'Nur GET erlaubt.' });
    return apiQuelle(req, res, url);
  }
  if (urlPath === '/api/publikation-speichern') {
    if (req.method !== 'POST') return json(res, 405, { fehler: 'Nur POST erlaubt.' });
    return apiPublikationSpeichern(req, res);
  }
  if (urlPath === '/api/termin-speichern') {
    if (req.method !== 'POST') return json(res, 405, { fehler: 'Nur POST erlaubt.' });
    return apiTerminSpeichern(req, res);
  }
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
