// Lädt "Aktuelles" und die KI-Lab-Termine aus EINER Datei: public/daten/beitraege.json
// und zeigt sie dort an, wo die Seite passende Plätze hat:
//   #aktuelles-liste   – Karten "Aktuelles" (Startseite)
//   #kilab-letzte      – die letzten drei KI-Lab-Termine (Startseite)
//   #naechster-termin  – nächster KI-Lab-Termin, automatisch berechnet (Seite "KI Lab")
//   #kilab-archiv      – Archiv mit Suche (#kilab-suche) und Filtern (#kilab-filter) (Seite "KI Lab")
// Alle Texte werden als reiner Text eingefügt (kein HTML aus der Datei).
// Termine ohne Titel ("folgt") werden nicht angezeigt; Referent:innen nur, wenn eingetragen (= bestätigt).
(function () {
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const KATEGORIEN = ['KI-Tools', 'Automatisierung', 'Strategie', 'Praxisbericht'];

  function el(tag, klasse, text) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }
  const zwei = n => String(n).padStart(2, '0');

  // "2026-11-03" -> "03.11.2026", "2026-06" -> "Juni 2026"
  function datumText(datum) {
    const [j, m, t] = String(datum).split('-');
    if (!t) return `${MONATE[Number(m) - 1]} ${j}`;
    return `${t}.${m}.${j}`;
  }

  // Nur Termine mit Titel, neueste zuerst
  function bestaetigteTermine(daten) {
    return (daten.kiLab || []).filter(t => t.titel)
      .sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  }

  // ---------- Startseite ----------
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

  function terminKarteKurz(t) {
    const a = el('a', 'termin-karte');
    a.href = 'treffen.html';
    const kopf = el('span', 'termin-karte__kopf');
    kopf.appendChild(el('span', 'termin-karte__datum', datumText(t.datum)));
    if (t.kategorie) kopf.appendChild(el('span', 'kategorie', t.kategorie));
    a.appendChild(kopf);
    a.appendChild(el('span', 'termin-karte__titel', t.titel));
    const zeile = [t.beschreibung, t.referent].filter(Boolean).join(' · ');
    if (zeile) a.appendChild(el('span', 'termin-karte__text', zeile));
    return a;
  }

  // ---------- Seite "KI Lab": Archiv mit Suche und Filter ----------
  function archivKarte(t) {
    const art = el('article', 'archiv-karte');
    const kopf = el('div', 'termin-karte__kopf');
    kopf.appendChild(el('span', 'termin-karte__datum', datumText(t.datum)));
    if (t.kategorie) kopf.appendChild(el('span', 'kategorie', t.kategorie));
    art.appendChild(kopf);
    art.appendChild(el('h3', 'archiv-karte__titel', t.titel));
    if (t.referent) art.appendChild(el('p', 'archiv-karte__referent', t.referent));
    if (t.beschreibung) art.appendChild(el('p', 'archiv-karte__text', t.beschreibung));
    return art;
  }

  function archivEinrichten(ziel, termine) {
    const suche = document.getElementById('kilab-suche');
    const filterBox = document.getElementById('kilab-filter');
    const anzahl = document.getElementById('kilab-anzahl');
    let kategorie = 'Alle';

    if (filterBox) {
      const vorhanden = KATEGORIEN.filter(k => termine.some(t => t.kategorie === k));
      ['Alle', ...vorhanden].forEach(k => {
        const b = el('button', 'filter-knopf', k);
        b.type = 'button';
        b.setAttribute('aria-pressed', k === 'Alle' ? 'true' : 'false');
        b.addEventListener('click', () => {
          kategorie = k;
          filterBox.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          zeigen();
        });
        filterBox.appendChild(b);
      });
    }

    function zeigen() {
      const begriff = (suche ? suche.value : '').trim().toLowerCase();
      const treffer = termine.filter(t =>
        (kategorie === 'Alle' || t.kategorie === kategorie) &&
        (!begriff || [t.titel, t.beschreibung, t.referent, t.kategorie, datumText(t.datum)]
          .filter(Boolean).join(' ').toLowerCase().includes(begriff)));
      ziel.replaceChildren(...(treffer.length ? treffer.map(archivKarte) : [el('p', 'hinweis', 'Keine passenden Termine gefunden.')]));
      if (anzahl) anzahl.textContent = treffer.length === 1 ? '1 Termin' : `${treffer.length} Termine`;
    }
    if (suche) suche.addEventListener('input', zeigen);
    zeigen();
  }

  // ---------- Seite "KI Lab": nächster Termin + Kalenderdatei ----------
  function berlinJetzt() {
    const t = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map(p => [p.type, Number(p.value)]));
    return { jahr: t.year, monat: t.month, tag: t.day, stunde: t.hour };
  }
  function ersterDienstag(jahr, monat) {
    const wt = new Date(Date.UTC(jahr, monat - 1, 1)).getUTCDay();
    return 1 + ((2 - wt + 7) % 7);
  }
  // Erster Dienstag im Monat, 18–19 Uhr; nach 19 Uhr am Termintag zählt der nächste Monat
  function naechsterTermin() {
    const j = berlinJetzt();
    let jahr = j.jahr, monat = j.monat, tag = ersterDienstag(jahr, monat);
    if (j.tag > tag || (j.tag === tag && j.stunde >= 19)) {
      monat += 1;
      if (monat > 12) { monat = 1; jahr += 1; }
      tag = ersterDienstag(jahr, monat);
    }
    return `${jahr}-${zwei(monat)}-${zwei(tag)}`;
  }

  function icsText(t) {
    return String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }
  function icsFalten(zeile) {
    const enc = new TextEncoder();
    const teile = [];
    let aktuell = '', bytes = 0;
    for (const z of zeile) {
      const b = enc.encode(z).length;
      if (bytes + b > 75) { teile.push(aktuell); aktuell = ' '; bytes = 1; }
      aktuell += z; bytes += b;
    }
    teile.push(aktuell);
    return teile.join('\r\n');
  }
  function kalenderdatei(datum, thema, email) {
    const tag = datum.replace(/-/g, '');
    const jetzt = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const beschreibung = [
      thema ? `Thema: ${thema}` : 'Thema wird bekannt gegeben',
      'Online über Microsoft Teams, offen für alle Interessierten, kostenlos.',
      email ? `Kontakt: ${email}` : '',
    ].filter(Boolean).join('\n');
    const zeilen = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AKKI//KI Lab//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE', 'TZID:Europe/Berlin',
      'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
      'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:ki-lab-${datum}@akki`,
      'DTSTAMP:' + jetzt,
      `DTSTART;TZID=Europe/Berlin:${tag}T180000`,
      `DTEND;TZID=Europe/Berlin:${tag}T190000`,
      'SUMMARY:' + icsText('DGOU KI Lab' + (thema ? ': ' + thema : '')),
      'DESCRIPTION:' + icsText(beschreibung),
      'LOCATION:' + icsText('Online (Microsoft Teams)'),
      'END:VEVENT', 'END:VCALENDAR',
    ];
    return zeilen.map(icsFalten).join('\r\n') + '\r\n';
  }

  function naechsterTerminEinrichten(ziel, termine) {
    const datum = naechsterTermin();
    const eintrag = termine.find(t => t.datum === datum);
    const thema = eintrag ? eintrag.titel : null;
    const [j, m, t] = datum.split('-').map(Number);
    const wochentag = WOCHENTAGE[new Date(Date.UTC(j, m - 1, t)).getUTCDay()];

    ziel.querySelector('[data-feld="datum"]').textContent = `${wochentag}, ${datumText(datum)}`;
    ziel.querySelector('[data-feld="thema"]').textContent = thema || 'Thema wird bekannt gegeben';
    const ref = ziel.querySelector('[data-feld="referent"]');
    if (ref) { ref.textContent = eintrag && eintrag.referent ? eintrag.referent : ''; ref.hidden = !(eintrag && eintrag.referent); }

    const knopf = document.getElementById('ics-knopf');
    if (knopf) knopf.addEventListener('click', async () => {
      const kontakt = window.akkiKontakt ? await window.akkiKontakt : {};
      const blob = new Blob([kalenderdatei(datum, thema, kontakt.email)], { type: 'text/calendar;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `DGOU-KI-Lab-${datum}.ics`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  }

  // ---------- Start ----------
  const aktuell = document.getElementById('aktuelles-liste');
  const letzte = document.getElementById('kilab-letzte');
  const naechster = document.getElementById('naechster-termin');
  const archiv = document.getElementById('kilab-archiv');
  if (!aktuell && !letzte && !naechster && !archiv) return;

  fetch('daten/beitraege.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(daten => {
      const termine = bestaetigteTermine(daten);
      if (aktuell) aktuell.replaceChildren(...(daten.aktuelles || []).map(aktuellKarte));
      if (letzte) letzte.replaceChildren(...termine.slice(0, 3).map(terminKarteKurz));
      if (naechster) naechsterTerminEinrichten(naechster, termine);
      if (archiv) archivEinrichten(archiv, termine);
    })
    .catch(() => {
      [aktuell, letzte, archiv].filter(Boolean).forEach(z => z.replaceChildren(el('p', 'hinweis', 'Die Inhalte konnten gerade nicht geladen werden.')));
      if (naechster) naechsterTerminEinrichten(naechster, []);
    });
})();
