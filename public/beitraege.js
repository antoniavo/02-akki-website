// Lädt "Aktuelles" und die KI-Lab-Termine aus EINER Datei: public/daten/beitraege.json
// und zeigt sie dort an, wo die Seite passende Plätze hat:
//   #aktuelles-liste  – Karten "Aktuelles" (Startseite)
//   #kilab-letzte     – die letzten drei KI-Lab-Termine (Startseite)
//   #kilab-archiv     – alle KI-Lab-Termine (Seite "Treffen")
// Alle Texte werden als reiner Text eingefügt (kein HTML aus der Datei).
(function () {
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  function el(tag, klasse, text) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }

  // "2026-11-03" -> "03.11.2026", "2026-06" -> "Juni 2026"
  function datumText(datum) {
    const [j, m, t] = String(datum).split('-');
    if (!t) return `${MONATE[Number(m) - 1]} ${j}`;
    return `${t}.${m}.${j}`;
  }

  function folgt(text) { return el('span', 'text-folgt', text || 'folgt'); }
  function bestaetigen() { return el('span', 'bestaetigen', 'wird bestätigt'); }

  // Ein Termin für das Archiv auf "Treffen" (zeigt auch "folgt"-Einträge)
  function terminZeile(t) {
    const li = el('li');
    li.appendChild(el('span', 'datum', datumText(t.datum)));
    const titel = el('span', 'titel');
    if (t.titel) {
      titel.append(t.titel);
      if (t.bestaetigen) { titel.append(' '); titel.appendChild(bestaetigen()); }
    } else {
      titel.appendChild(folgt());
    }
    const teile = [];
    if (t.beschreibung) teile.push(document.createTextNode(t.beschreibung));
    if (t.referent) teile.push(document.createTextNode(t.referent));
    else if (t.referentRolle) {
      const f = document.createDocumentFragment();
      f.append(t.referentRolle + ': '); f.appendChild(folgt());
      teile.push(f);
    }
    if (teile.length) {
      const b = el('span', 'beschreibung');
      teile.forEach((teil, i) => { if (i) b.append(' · '); b.appendChild(teil); });
      titel.appendChild(b);
    }
    li.appendChild(titel);
    return li;
  }

  // Kompakte Karte für die Startseite (nur bestätigte Angaben)
  function terminKarte(t) {
    const a = el('a', 'termin-karte');
    a.href = 'treffen.html';
    a.appendChild(el('span', 'termin-karte__datum', datumText(t.datum)));
    a.appendChild(el('span', 'termin-karte__titel', t.titel));
    const zeile = [t.beschreibung, t.referent].filter(Boolean).join(' · ');
    if (zeile) a.appendChild(el('span', 'termin-karte__text', zeile));
    return a;
  }

  function aktuellKarte(b) {
    const art = el('article', 'aktuell-karte');
    art.appendChild(el('span', 'aktuell-karte__art', b.art));
    art.appendChild(el('h3', null, b.titel));
    art.appendChild(el('p', 'aktuell-karte__wann', [b.zeitraum, b.ort].filter(Boolean).join(' · ')));
    if (b.text) art.appendChild(el('p', null, b.text));
    if (b.link) {
      const a = el('a', 'pfeil-link', b.linkText || 'Mehr erfahren');
      a.href = b.link;
      art.appendChild(a);
    }
    return art;
  }

  function fehlerText(ziel) {
    ziel.replaceChildren(el('p', 'hinweis', 'Die Termine konnten gerade nicht geladen werden.'));
  }

  const aktuell = document.getElementById('aktuelles-liste');
  const letzte = document.getElementById('kilab-letzte');
  const archiv = document.getElementById('kilab-archiv');
  if (!aktuell && !letzte && !archiv) return;

  fetch('daten/beitraege.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(daten => {
      const termine = (daten.kiLab || []).slice().sort((a, b) => String(a.datum).localeCompare(String(b.datum)));

      if (aktuell) aktuell.replaceChildren(...(daten.aktuelles || []).map(aktuellKarte));

      if (letzte) {
        const bestaetigt = termine.filter(t => t.titel).slice(-3).reverse();
        letzte.replaceChildren(...bestaetigt.map(terminKarte));
      }

      if (archiv) archiv.replaceChildren(...termine.map(terminZeile));
    })
    .catch(() => [aktuell, letzte, archiv].filter(Boolean).forEach(fehlerText));
})();
