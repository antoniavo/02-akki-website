// Startseite: Hackathon-Karte (aus daten/usecases.json) und neueste Publikationen (aus daten/publikationen.json).
// Die neuesten KI-Lab-Termine zeigt beitraege.js. Alle Texte werden als reiner Text eingefügt; leere Felder werden ausgelassen.
(function () {
  function el(tag, klasse, text) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }
  const holen = datei => fetch(datei).then(r => { if (!r.ok) throw new Error(datei); return r.json(); });

  // ---------- Runder Mitmachen-Button: Textring dreht bei Hover und Fokus schneller (16 s -> ca. 5 s pro Umdrehung) ----------
  // Die Drehung selbst steht in style.css (bei "Bewegung reduzieren" gibt es keine Animation, dann passiert hier nichts).
  const rund = document.getElementById('mitmachen-knopf');
  const ring = rund && rund.querySelector('.mitmach-rund__ring');
  if (ring) {
    // Buchstabenabstand so wählen, dass der Text die Kreisbahn (Umfang 2·π·41) genau füllt, egal welche Monospace-Schrift das Gerät hat
    const text = ring.querySelector('text'), pfad = ring.querySelector('textPath');
    const passen = () => {
      text.style.letterSpacing = '0px';
      const natuerlich = pfad.getComputedTextLength();
      text.style.letterSpacing = Math.max(0, (2 * Math.PI * 41 - natuerlich) / pfad.textContent.length) + 'px';
    };
    passen();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(passen);
    const tempo = faktor => ring.getAnimations().forEach(a => a.updatePlaybackRate(faktor));
    ['pointerenter', 'focus'].forEach(e => rund.addEventListener(e, () => tempo(16 / 5)));
    ['pointerleave', 'blur'].forEach(e => rund.addEventListener(e, () => tempo(1)));
  }

  // ---------- Unterzeilen der Einstiegskacheln: aktuelle Infos aus den Datendateien (reiner Text) ----------
  // Der Termin für die Kachel "KI Lab" kommt aus beitraege.js. Schlägt das Laden fehl, bleibt der feste Text stehen.
  const info = name => document.querySelector(`[data-info="${name}"]`);
  const kuerzen = (text, max) => {
    if (text.length <= max) return text;
    const teil = text.slice(0, max);
    return teil.slice(0, Math.max(teil.lastIndexOf(' '), Math.floor(max / 2))).replace(/[\s,;:–-]+$/, '') + '…';
  };
  const zaehlen = (n, einzahl, mehrzahl) => `${n} ${n === 1 ? einzahl : mehrzahl}`;

  const forschung = info('forschung');
  if (forschung) {
    Promise.all([holen('daten/projekte.json'), holen('daten/usecases.json')]).then(([p, u]) => {
      const projekte = (p.projekte || []).length, cases = (u.usecases || []).length;
      forschung.textContent = `${zaehlen(projekte, 'Projekt', 'Projekte')} · ${zaehlen(cases, 'Hackathon-Use-Case', 'Hackathon-Use-Cases')}`;
    }).catch(() => { /* fester Text bleibt */ });
  }

  const pubInfo = info('publikationen');
  if (pubInfo) {
    holen('daten/publikationen.json').then(d => {
      const alle = (d.publikationen || []).filter(p => p.titel && p.jahr)
        .sort((a, b) => (b.jahr - a.jahr) || ((a.nr || 0) - (b.nr || 0)));
      if (!alle.length) return;
      pubInfo.textContent = `${zaehlen(alle.length, 'Publikation', 'Publikationen')} · neu: ${kuerzen(alle[0].titel, 28)}`;
    }).catch(() => { /* fester Text bleibt */ });
  }
  // ---------- Hackathon ----------
  const karte = document.getElementById('hackathon-karte');
  if (karte) {
    holen('daten/usecases.json').then(d => {
      const h = d.hackathon;
      if (!h) return;
      document.getElementById('hackathon-titel').textContent = h.titel;
      document.getElementById('hackathon-fakten').textContent = [h.zeitraum, h.ort].filter(Boolean).join(' · ');
      if (h.website) {
        const a = document.getElementById('hackathon-website');
        a.href = h.website; a.hidden = false;
      }
      const cases = d.usecases || [];
      document.getElementById('hackathon-anzahl').textContent = cases.length;
      document.getElementById('hackathon-chips').replaceChildren(...cases.map(u => {
        const li = el('li');
        const a = el('a', 'chip', u.titel);
        a.href = 'projekte.html#hackathon';
        li.appendChild(a);
        return li;
      }));
      karte.hidden = false;
    }).catch(() => { /* Karte bleibt ausgeblendet */ });
  }

  // ---------- Neueste Publikationen ----------
  const liste = document.getElementById('pub-neu');
  if (liste) {
    holen('daten/publikationen.json').then(d => {
      // Neueste zuerst: Jahr absteigend, innerhalb eines Jahres wie in der Liste (nr aufsteigend)
      const neu = (d.publikationen || [])
        .filter(p => p.titel && p.jahr)
        .sort((a, b) => (b.jahr - a.jahr) || ((a.nr || 0) - (b.nr || 0)))
        .slice(0, 3);
      liste.replaceChildren(...neu.map(p => {
        const li = el('li');
        const a = el('a', 'neu-pub');
        a.href = 'publikationen.html#' + encodeURIComponent(p.id);
        const text = el('span', 'neu-pub__text');
        text.appendChild(el('span', 'neu-pub__titel', p.titel));
        // Kein farbiges Kategorie-Schild; das Kennzeichen steht nur als dezenter Text in der Zeile darunter
        text.appendChild(el('span', 'neu-pub__meta', [p.journal, p.jahr, p.kennzeichen].filter(Boolean).join(' · ')));
        a.appendChild(text);
        a.appendChild(el('span', 'neu-pub__pfeil', '→')).setAttribute('aria-hidden', 'true');
        li.appendChild(a);
        return li;
      }));
    }).catch(() => { liste.replaceChildren(el('li', 'hinweis', 'Die Publikationen konnten gerade nicht geladen werden.')); });
  }
})();
