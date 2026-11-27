// Lädt "Aktuelles" und die KI-Lab-Termine aus EINER Datei: public/daten/beitraege.json
// und zeigt sie dort an, wo die Seite passende Plätze hat:
//   #aktuelles-liste   – Karten "Aktuelles" (Startseite)
//   #kilab-letzte      – die letzten drei KI-Lab-Termine (Startseite)
//   #naechster-termin  – nächster erster Dienstag im Monat mit Thema/Referent:in aus der Datei, falls eingetragen (Seite "KI Lab"); #kilab-naechster – dasselbe als Zeile (Startseite)
//   #kilab-archiv      – Raster der bisherigen Vorträge, neuester zuerst und breiter (Seite "KI Lab")
// Alle Texte werden als reiner Text eingefügt (kein HTML aus der Datei).
// Termine ohne Titel ("folgt") werden nicht angezeigt; Referent:innen nur, wenn eingetragen (= bestätigt).
(function () {
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  // Mehrfachzuordnung: "kategorien" (Liste); das alte Einzelfeld "kategorie" wird weiter verstanden
  const kategorienVon = t => (Array.isArray(t.kategorien) ? t.kategorien : (t.kategorie ? [t.kategorie] : []));

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

  // Nur Termine mit Titel, die schon stattgefunden haben, neueste zuerst.
  // Ein Termin zählt als vergangen, wenn sein Tag vor heute (Berlin) liegt; bei JJJJ-MM zählt der Monat.
  function bestaetigteTermine(daten) {
    const j = berlinJetzt();
    const heute = `${j.jahr}-${zwei(j.monat)}-${zwei(j.tag)}`;
    const vergangen = t => (String(t.datum).length > 7 ? String(t.datum) < heute : String(t.datum) < heute.slice(0, 7));
    return (daten.kiLab || []).filter(t => t.titel && vergangen(t))
      .sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  }

  // Nächster Termin: das KI Lab findet jeden ersten Dienstag im Monat statt (vom Team bestätigt, 27.11.2026).
  // Berechnet wird der nächste erste Dienstag (heute zählt noch mit). Thema und Referent:in nur, wenn für genau diesen Tag
  // ein Eintrag mit Titel in beitraege.json steht. Die Uhrzeit kommt nur aus dem Eintrag oder aus "regeltermin" in beitraege.json
  // (leer, solange sie nicht bestätigt ist). Nach dem Termin springt die Anzeige automatisch auf den nächsten Monat.
  function ersterDienstag(jahr, monat) {
    const wochentag = new Date(Date.UTC(jahr, monat - 1, 1)).getUTCDay(); // 0 = Sonntag, 2 = Dienstag
    return 1 + ((2 - wochentag + 7) % 7);
  }
  const istUhrzeit = z => /^\d{2}:\d{2}$/.test(String(z));
  function naechsterTermin(daten) {
    const j = berlinJetzt();
    const heute = `${j.jahr}-${zwei(j.monat)}-${zwei(j.tag)}`;
    let jahr = j.jahr, monat = j.monat;
    let datum = `${jahr}-${zwei(monat)}-${zwei(ersterDienstag(jahr, monat))}`;
    if (datum < heute) {
      monat += 1;
      if (monat > 12) { monat = 1; jahr += 1; }
      datum = `${jahr}-${zwei(monat)}-${zwei(ersterDienstag(jahr, monat))}`;
    }
    const eintrag = ((daten && daten.kiLab) || []).find(t => t.datum === datum && t.titel) || null;
    const regel = (daten && daten.regeltermin) || {};
    const beginn = (eintrag && eintrag.beginn) || regel.beginn;
    const ende = (eintrag && eintrag.ende) || regel.ende;
    const hatZeit = istUhrzeit(beginn) && istUhrzeit(ende);
    return {
      datum,
      titel: eintrag ? eintrag.titel : null,
      referent: eintrag && eintrag.referent ? eintrag.referent : null,
      beginn: hatZeit ? beginn : null,
      ende: hatZeit ? ende : null,
    };
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
    // Datumsblock links (Tag groß, Monat und Jahr klein), wenn ein voller Tag bekannt ist
    const [jahr, monat, tag] = String(t.datum).split('-');
    const inhalt = el('span', 'termin-karte__inhalt');
    if (tag) {
      a.classList.add('termin-karte--block');
      const block = el('span', 'datumsblock');
      block.appendChild(el('span', 'datumsblock__tag', String(Number(tag))));
      block.appendChild(el('span', 'datumsblock__monat', MONATE[Number(monat) - 1].slice(0, 3)));
      block.appendChild(el('span', 'datumsblock__jahr', jahr));
      a.appendChild(block);
    }
    // Keine Kategorie-Schilder auf den Karten (die Kategorien bleiben in den Daten für die Filter auf der KI-Lab-Seite)
    if (!tag) inhalt.appendChild(el('span', 'termin-karte__datum', datumText(t.datum)));
    inhalt.appendChild(el('span', 'termin-karte__titel', t.titel));
    // Namen von Referent:innen werden hier nicht angezeigt (das Feld referent bleibt in den Daten)
    if (t.beschreibung) inhalt.appendChild(el('span', 'termin-karte__text', t.beschreibung));
    a.appendChild(inhalt);
    return a;
  }

  // "Dienstag, 1. Dezember 2026 · online" (mit "· 18:00–19:00 Uhr", nur wenn die Uhrzeit bestätigt ist)
  function terminZeile(t) {
    const [j, m, tag] = t.datum.split('-').map(Number);
    const wochentag = WOCHENTAGE[new Date(Date.UTC(j, m - 1, tag)).getUTCDay()];
    const zeit = istUhrzeit(t.beginn) && istUhrzeit(t.ende) ? ` · ${t.beginn}–${t.ende} Uhr` : '';
    return `${wochentag}, ${datumLang(t.datum)}${zeit} · online`;
  }
  // Thema und Referent:in nur, wenn eingetragen; sonst die Frage nach einer Idee mit Button "Thema vorschlagen" (kein erfundenes Thema)
  function themaAnzeigen(ziel, t) {
    const thema = ziel.querySelector('[data-feld="thema"]');
    const ref = ziel.querySelector('[data-feld="referent"]');
    const frage = ziel.querySelector('[data-feld="ohne-thema"]');
    const vorschlag = ziel.querySelector('[data-feld="vorschlag"]');
    const hat = !!t.titel;
    if (thema) { thema.textContent = hat ? t.titel : ''; thema.hidden = !hat; }
    if (ref) { ref.textContent = t.referent || ''; ref.hidden = !(hat && t.referent); }
    if (frage) frage.hidden = hat;
    if (vorschlag) vorschlag.hidden = hat;
  }
  function naechsterAufStartseite(a, t) {
    if (!a || !t) return;
    a.querySelector('[data-feld="datum"]').textContent = terminZeile(t);
    themaAnzeigen(a, t);
    const thema = a.querySelector('[data-feld="thema"]');
    if (t.titel && t.referent) thema.textContent = `${t.titel} · ${t.referent}`;
    a.hidden = false;
  }
  // ---------- Seite "KI Lab": Vorträge als Raster kleiner Karten ----------
  // "2026-11-03" -> "3. November 2026"
  function datumLang(datum) {
    const [j, m, t] = String(datum).split('-');
    return t ? `${Number(t)}. ${MONATE[Number(m) - 1]} ${j}` : `${MONATE[Number(m) - 1]} ${j}`;
  }
  function materialLinks(t) {
    // Folien und Aufzeichnung nur nach Freigabe: leer = ausgeblendet
    const material = el('p', 'archiv-karte__material');
    [['Folien', t.folien], ['Aufzeichnung', t.aufzeichnung]].forEach(([name, url]) => {
      if (!url) return;
      const a = el('a', 'pfeil-link', name);
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      material.appendChild(a); material.appendChild(document.createTextNode(' '));
    });
    return material.childNodes.length ? material : null;
  }

  const pfeilSvg = () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'kl-zeile__pfeil');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M6 9l6 6 6-6'); s.appendChild(p);
    return s;
  };

  // Eine Zeile pro Vortrag: Datum, Titel, "· Referent:in" (nur wenn eingetragen), Pfeil. Die Beschreibung steht erst im aufgeklappten Teil.
  // Ohne Beschreibung, Themen und Material bleibt die Zeile fest (kein Pfeil, nicht klickbar).
  function vortragZeile(t, nr) {
    const li = el('li', 'kl-zeile');
    const kategorien = kategorienVon(t);
    const material = materialLinks(t);
    const hatDetails = Boolean(t.beschreibung || kategorien.length || material);

    const inhalt = el('span', 'kl-zeile__inhalt');
    inhalt.appendChild(el('span', 'kl-zeile__datum', datumText(t.datum)));
    const text = el('span', 'kl-zeile__text');
    text.appendChild(el('span', 'kl-zeile__titel', t.titel));
    // Namen von Referent:innen werden in der Liste nicht angezeigt: nur Datum und Titel (das Feld referent bleibt in den Daten)
    inhalt.appendChild(text);

    if (!hatDetails) {
      li.appendChild(el('div', 'kl-zeile__kopf kl-zeile__kopf--fest')).appendChild(inhalt);
      return li;
    }
    const knopf = el('button', 'kl-zeile__kopf');
    knopf.type = 'button';
    knopf.setAttribute('aria-expanded', 'false');
    knopf.setAttribute('aria-controls', 'kl-panel-' + nr);
    knopf.append(inhalt, pfeilSvg());
    li.appendChild(knopf);

    const panel = el('div', 'kl-panel');
    panel.id = 'kl-panel-' + nr;
    const innen = el('div', 'kl-panel__innen');
    if (t.beschreibung) innen.appendChild(el('p', null, t.beschreibung));
    if (kategorien.length) innen.appendChild(el('p', 'kl-zeile__themen', 'Themen: ' + kategorien.join(', ')));
    if (material) innen.appendChild(material);
    panel.appendChild(innen);
    li.appendChild(panel);
    return li;
  }

  // Nur eine Zeile ist zur selben Zeit offen
  function vortraegeEinrichten(ziel, termine) {
    const zeilen = termine.map((t, i) => vortragZeile(t, i));
    ziel.replaceChildren(...zeilen);
    zeilen.forEach(li => {
      const knopf = li.querySelector('button.kl-zeile__kopf');
      if (!knopf) return;
      knopf.addEventListener('click', () => {
        const auf = knopf.getAttribute('aria-expanded') !== 'true';
        zeilen.forEach(z => {
          z.classList.remove('kl-auf');
          const k = z.querySelector('button.kl-zeile__kopf');
          if (k) k.setAttribute('aria-expanded', 'false');
        });
        if (auf) { li.classList.add('kl-auf'); knopf.setAttribute('aria-expanded', 'true'); }
      });
    });
  }
  // ---------- Seite "KI Lab": nächster Termin + Kalenderdatei ----------
  function berlinJetzt() {
    const t = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map(p => [p.type, Number(p.value)]));
    return { jahr: t.year, monat: t.month, tag: t.day, stunde: t.hour };
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
  // beginn und ende nur, wenn die Uhrzeit bestätigt ist ("18:00"); sonst ein ganztägiger Kalendereintrag ohne Uhrzeit
  function kalenderdatei(datum, thema, email, beginn, ende) {
    const tag = datum.replace(/-/g, '');
    const uhr = z => z.replace(':', '') + '00';
    const jetzt = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const beschreibung = [
      thema ? `Thema: ${thema}` : 'Thema wird bekannt gegeben',
      'Online über Microsoft Teams, kostenlos.',
      email ? `Kontakt: ${email}` : '',
    ].filter(Boolean).join('\n');
    let zeitzeilen;
    if (beginn && ende) {
      zeitzeilen = [`DTSTART;TZID=Europe/Berlin:${tag}T${uhr(beginn)}`, `DTEND;TZID=Europe/Berlin:${tag}T${uhr(ende)}`];
    } else {
      const [j, m, t] = datum.split('-').map(Number);
      const folgetag = new Date(Date.UTC(j, m - 1, t + 1)).toISOString().slice(0, 10).replace(/-/g, '');
      zeitzeilen = [`DTSTART;VALUE=DATE:${tag}`, `DTEND;VALUE=DATE:${folgetag}`];
    }
    const zeilen = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AKKI//KI Lab//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE', 'TZID:Europe/Berlin',
      'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
      'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:ki-lab-${datum}@akki`,
      'DTSTAMP:' + jetzt,
      ...zeitzeilen,
      'SUMMARY:' + icsText('DGOU KI Lab' + (thema ? ': ' + thema : '')),
      'DESCRIPTION:' + icsText(beschreibung),
      'LOCATION:' + icsText('Online (Microsoft Teams)'),
      'END:VEVENT', 'END:VCALENDAR',
    ];
    return zeilen.map(icsFalten).join('\r\n') + '\r\n';
  }

  // Termin-Ticket: Datumsblock links, rechts "Nächstes KI Lab · Dienstag, online" und Thema (mit Referent:in) oder die Frage nach einer Idee.
  // Die Uhrzeit erscheint nur, wenn sie bestätigt ist. Ein Kalendereintrag (.ics) gibt es immer (ohne Uhrzeit ganztägig).
  function naechsterTerminEinrichten(ziel, eintrag) {
    if (!eintrag) { ziel.hidden = true; return; }
    const datum = eintrag.datum;
    const thema = eintrag.titel || null;
    const [j, m, t] = datum.split('-').map(Number);
    const wochentag = WOCHENTAGE[new Date(Date.UTC(j, m - 1, t)).getUTCDay()];
    const hatZeit = istUhrzeit(eintrag.beginn) && istUhrzeit(eintrag.ende);
    const feld = name => ziel.querySelector(`[data-feld="${name}"]`);
    feld('tag').textContent = String(t);
    feld('monat').textContent = MONATE[m - 1].slice(0, 3);
    feld('jahr').textContent = String(j);
    feld('zeile').textContent = `Nächstes KI Lab · ${wochentag}${hatZeit ? `, ${eintrag.beginn}–${eintrag.ende} Uhr` : ''}, online`;
    feld('datum-lang').textContent = ' ' + datumLang(datum);
    themaAnzeigen(ziel, eintrag);
    ziel.hidden = false;

    const knopf = document.getElementById('ics-knopf');
    if (!knopf) return;
    knopf.hidden = false;
    knopf.addEventListener('click', async () => {
      const kontakt = window.akkiKontakt ? await window.akkiKontakt : {};
      const blob = new Blob([kalenderdatei(datum, thema, kontakt.email, eintrag.beginn, eintrag.ende)], { type: 'text/calendar;charset=utf-8' });
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
  const naechsterStart = document.getElementById('kilab-naechster');
  const archiv = document.getElementById('kilab-archiv');
  if (!aktuell && !letzte && !naechster && !naechsterStart && !archiv) return;

  fetch('daten/beitraege.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(daten => {
      const termine = bestaetigteTermine(daten);
      if (aktuell) aktuell.replaceChildren(...(daten.aktuelles || []).map(aktuellKarte));
      if (letzte) letzte.replaceChildren(...termine.slice(0, 3).map(terminKarteKurz));
      if (naechster) naechsterTerminEinrichten(naechster, naechsterTermin(daten));
      naechsterAufStartseite(naechsterStart, naechsterTermin(daten));
      if (archiv) vortraegeEinrichten(archiv, termine);
    })
    .catch(() => {
      [aktuell, letzte, archiv].filter(Boolean).forEach(z => z.replaceChildren(el('p', 'hinweis', 'Die Inhalte konnten gerade nicht geladen werden.')));
      // Ohne die Datei gibt es kein Thema, der Termin selbst lässt sich trotzdem berechnen
      if (naechster) naechsterTerminEinrichten(naechster, naechsterTermin({}));
      naechsterAufStartseite(naechsterStart, naechsterTermin({}));
    });
})();
