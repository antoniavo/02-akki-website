// Stil-Vorschau (nur zum Ausprobieren): Aufruf einmal mit ?stil=aktuell|a|b|c, danach merkt sich der Browser die Wahl (nur dieser Tab).
// Unten links erscheint dann eine kleine Leiste zum Umschalten. Ohne ?stil sieht niemand etwas davon.
(function () {
  const NAMEN = { aktuell: 'Aktuell', a: 'A · Klar', b: 'B · Weich', c: 'C · Kontrast' };
  let wahl = null;
  try {
    const p = new URLSearchParams(location.search).get('stil');
    if (p && NAMEN[p]) sessionStorage.setItem('akkiStil', p);
    wahl = sessionStorage.getItem('akkiStil');
  } catch (e) { /* ohne Speicher keine Vorschau */ }
  if (!wahl || !NAMEN[wahl]) return;

  if (wahl !== 'aktuell') {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'stile/stil-' + wahl + '.css';
    document.head.appendChild(l);
  }

  const leiste = document.createElement('div');
  leiste.setAttribute('role', 'group');
  leiste.setAttribute('aria-label', 'Stil-Vorschau');
  leiste.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9999;display:flex;gap:4px;padding:6px;background:#1B2F40;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.35);font:600 13px system-ui,sans-serif';
  Object.keys(NAMEN).forEach(k => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = NAMEN[k];
    b.setAttribute('aria-pressed', String(k === wahl));
    b.style.cssText = 'border:0;border-radius:999px;padding:8px 12px;cursor:pointer;font:inherit;min-height:36px;' +
      (k === wahl ? 'background:#fff;color:#1B2F40' : 'background:transparent;color:#fff');
    b.addEventListener('click', () => { try { sessionStorage.setItem('akkiStil', k); } catch (e) {} location.reload(); });
    leiste.appendChild(b);
  });
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(leiste));
  if (document.readyState !== 'loading') document.body.appendChild(leiste);
})();
