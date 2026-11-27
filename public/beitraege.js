// Lädt "Aktuelles" und die KI-Lab-Termine aus EINER Datei: public/daten/beitraege.json
// und zeigt sie dort an, wo die Seite passende Plätze hat:
//   #aktuelles-liste   – Karten "Aktuelles" (Startseite)
//   #kilab-letzte      – die letzten drei KI-Lab-Termine (Startseite)
//   #naechster-termin  – nächster erster Dienstag im Monat mit Thema/Referent:in aus der Datei, falls eingetragen (Seite "KI Lab"); #kilab-naechster – dasselbe als Zeile (Startseite)
//   #kilab-archiv      – Liste der bisherigen Termine mit Lupen-Suche (#kilab-suche) und Themenkacheln (.kl-thema); #kilab-zuletzt – jüngster Vortrag (Seite "KI Lab")
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
    // Referent:in als eigene kleine Zeile unter dem Titel, nur wenn eingetragen (= bestätigt)
    if (t.referent) inhalt.appendChild(el('span', 'termin-karte__referent', t.referent));
    if (t.beschreibung) inhalt.appendChild(el('span', 'termin-karte__text', t.beschreibung));
    a.appendChild(inhalt);
    return a;
  }

  function naechsterAufStartseite(a, t) {
    if (!a || !t) return;
    const [j, m, tag] = t.datum.split('-').map(Number);
    const wochentag = WOCHENTAGE[new Date(Date.UTC(j, m - 1, tag)).getUTCDay()];
    const zeit = t.beginn ? ` · ${t.beginn}–${t.ende} Uhr` : '';
    a.querySelector('[data-feld="datum"]').textContent = `${wochentag}, ${datumText(t.datum)}${zeit}`;
    a.querySelector('[data-feld="thema"]').textContent = [t.titel || 'Thema wird bekannt gegeben', t.referent].filter(Boolean).join(' · ');
    a.hidden = false;
  }
  // ---------- Seite "KI Lab": jüngster Vortrag, Themenkacheln, Liste ----------
  // "2026-11-03" -> "3. November 2026"
  function datumLang(datum) {
    const [j, m, t] = String(datum).split('-');
    return t ? `${Number(t)}. ${MONATE[Number(m) - 1]} ${j}` : `${MONATE[Number(m) - 1]} ${j}`;
  }
  // Erster Satz einer Beschreibung; der Rest (falls vorhanden) kommt in die Details
  function satzTeilen(text) {
    const m = String(text || '').match(/^.*?[.!?](?=\s|$)/);
    const satz = m ? m[0] : String(text || '');
    return { satz, rest: String(text || '').slice(satz.length).trim() };
  }
  const terminId = t => 'termin-' + t.datum;

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

  function datumsBlock(datum) {
    const [jahr, monat, tag] = String(datum).split('-');
    if (!tag) return el('span', 'kl-eintrag__datum', datumText(datum));
    const block = el('span', 'datumsblock');
    block.appendChild(el('span', 'datumsblock__tag', String(Number(tag))));
    block.appendChild(el('span', 'datumsblock__monat', MONATE[Number(monat) - 1].slice(0, 3)));
    block.appendChild(el('span', 'datumsblock__jahr', jahr));
    return block;
  }

  const pfeilSvg = () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'kl-eintrag__pfeil');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M6 9l6 6 6-6'); s.appendChild(p);
    return s;
  };

  // Eine Zeile der Liste. Nur vorhandene Angaben; ohne weitere Details bleibt die Zeile fest (nicht aufklappbar).
  function listenEintrag(t) {
    const li = el('li');
    li.id = terminId(t);
    const { satz, rest } = satzTeilen(t.beschreibung);
    const kategorien = kategorienVon(t);
    const material = materialLinks(t);
    const haupt = el('span', 'kl-eintrag__haupt');
    haupt.appendChild(el('span', 'kl-eintrag__titel', t.titel));
    if (t.referent) haupt.appendChild(el('span', 'kl-eintrag__referent', t.referent));
    if (satz) haupt.appendChild(el('span', 'kl-eintrag__satz', satz));

    const hatDetails = Boolean(rest || kategorien.length || material);
    if (!hatDetails) {
      const zeile = el('div', 'kl-eintrag kl-eintrag--fest');
      zeile.append(datumsBlock(t.datum), haupt);
      li.appendChild(zeile);
      return li;
    }
    const details = el('details', 'kl-eintrag');
    const kopf = el('summary');
    kopf.append(datumsBlock(t.datum), haupt, pfeilSvg());
    details.appendChild(kopf);
    const inhalt = el('div', 'kl-eintrag__details');
    if (rest) inhalt.appendChild(el('p', null, rest));
    if (kategorien.length) inhalt.appendChild(el('p', 'kl-eintrag__themen', 'Themen: ' + kategorien.join(', ')));
    if (material) inhalt.appendChild(material);
    details.appendChild(inhalt);
    li.appendChild(details);
    return li;
  }

  function zuletztEinrichten(abschnitt, t, oeffnen) {
    if (!abschnitt || !t) return;
    const karte = abschnitt.querySelector('.kl-zuletzt');
    const bild = el('div', 'kl-zuletzt__bild');
    const img = el('img');
    img.src = 'bilder/kilab-vortrag.svg'; img.alt = ''; img.width = 360; img.height = 240;
    bild.appendChild(img);
    const kategorien = kategorienVon(t);
    if (kategorien.length) bild.appendChild(el('p', 'kl-zuletzt__themen', kategorien.join(' · ')));
    const text = el('div', 'kl-zuletzt__text');
    text.appendChild(el('p', 'kl-zuletzt__datum', datumLang(t.datum)));
    text.appendChild(el('h3', null, t.titel));
    if (t.referent) text.appendChild(el('p', 'kl-zuletzt__referent', t.referent));
    if (t.beschreibung) text.appendChild(el('p', 'kl-zuletzt__beschreibung', t.beschreibung));
    const link = el('a', 'pfeil-link', 'Vortrag entdecken');
    link.href = '#' + terminId(t);
    link.addEventListener('click', e => { e.preventDefault(); oeffnen(t); });
    text.appendChild(link);
    karte.replaceChildren(bild, text);
    abschnitt.hidden = false;
  }

  function archivEinrichten(ziel, termine) {
    const suche = document.getElementById('kilab-suche');
    const suchbox = document.getElementById('kilab-suchbox');
    const lupe = document.getElementById('kilab-lupe');
    const anzahl = document.getElementById('kilab-anzahl');
    const hinweis = document.getElementById('kilab-filterhinweis');
    const hinweisName = document.getElementById('kilab-filtername');
    const zurueck = document.getElementById('kilab-zuruecksetzen');
    const kacheln = [...document.querySelectorAll('.kl-thema')];
    const ohneBewegung = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let aktiv = null; // gewählte Themenkachel

    function zeigen() {
      const begriff = (suche ? suche.value : '').trim().toLowerCase();
      const gesucht = aktiv ? aktiv.dataset.kategorien.split(',') : null;
      const treffer = termine.filter(t =>
        (!gesucht || kategorienVon(t).some(k => gesucht.includes(k))) &&
        (!begriff || [t.titel, t.beschreibung, t.referent, kategorienVon(t).join(' '), datumText(t.datum)]
          .filter(Boolean).join(' ').toLowerCase().includes(begriff)));
      ziel.replaceChildren(...treffer.map(listenEintrag));
      if (!treffer.length) ziel.replaceChildren(el('li', 'hinweis', 'Keine passenden Termine gefunden.'));
      if (anzahl) anzahl.textContent = treffer.length === 1 ? '1 Termin' : `${treffer.length} Termine`;
      if (hinweis) {
        hinweis.hidden = !aktiv;
        if (aktiv && hinweisName) hinweisName.textContent = 'Gefiltert nach: ' + aktiv.dataset.name;
      }
    }

    function waehlen(kachel) {
      aktiv = aktiv === kachel ? null : kachel;
      kacheln.forEach(k => k.setAttribute('aria-pressed', String(k === aktiv)));
      zeigen();
      const abschnitt = document.getElementById('kilab-liste-abschnitt');
      if (aktiv && abschnitt) abschnitt.scrollIntoView({ behavior: ohneBewegung ? 'auto' : 'smooth', block: 'start' });
    }
    kacheln.forEach(k => k.addEventListener('click', () => waehlen(k)));
    if (zurueck) zurueck.addEventListener('click', () => { if (aktiv) waehlen(aktiv); });

    if (lupe && suchbox) {
      lupe.addEventListener('click', () => {
        const auf = suchbox.hidden;
        suchbox.hidden = !auf;
        lupe.setAttribute('aria-expanded', String(auf));
        if (auf && suche) suche.focus();
      });
    }
    if (suche) suche.addEventListener('input', zeigen);

    // Einen Termin sichtbar machen, aufklappen und hinscrollen (z. B. von "Vortrag entdecken")
    function oeffnen(t) {
      if (aktiv) { aktiv.setAttribute('aria-pressed', 'false'); aktiv = null; }
      if (suche && suche.value) suche.value = '';
      zeigen();
      const li = document.getElementById(terminId(t));
      if (!li) return;
      const details = li.querySelector('details');
      if (details) details.open = true;
      li.scrollIntoView({ behavior: ohneBewegung ? 'auto' : 'smooth', block: 'center' });
      const kopf = li.querySelector('summary');
      if (kopf) kopf.focus({ preventScroll: true });
      li.firstElementChild.classList.remove('kl-markiert'); void li.offsetWidth; li.firstElementChild.classList.add('kl-markiert');
      history.replaceState(null, '', '#' + terminId(t));
    }

    zeigen();
    return oeffnen;
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

  // Zeigt den nächsten ersten Dienstag. Thema und Referent:in nur, wenn eingetragen; die Uhrzeit nur, wenn bestätigt.
  // Nur wenn gar kein Termin berechnet werden konnte (eintrag = null), bleibt der Platzhaltertext stehen.
  function naechsterTerminEinrichten(ziel, eintrag) {
    const mitTermin = ziel.querySelector('[data-feld="mit-termin"]');
    const ohneTermin = ziel.querySelector('[data-feld="ohne-termin"]');
    const knopf = document.getElementById('ics-knopf');
    const hatTermin = !!eintrag;
    if (mitTermin) mitTermin.hidden = !hatTermin;
    if (ohneTermin) ohneTermin.hidden = hatTermin;
    if (knopf) knopf.hidden = true;
    if (!hatTermin) return;

    const datum = eintrag.datum;
    const thema = eintrag.titel || null;
    const [j, m, t] = datum.split('-').map(Number);
    const wochentag = WOCHENTAGE[new Date(Date.UTC(j, m - 1, t)).getUTCDay()];
    const hatZeit = istUhrzeit(eintrag.beginn) && istUhrzeit(eintrag.ende);

    ziel.querySelector('[data-feld="datum"]').textContent = `${wochentag}, ${datumText(datum)}`;
    const zeit = ziel.querySelector('[data-feld="zeit"]');
    if (zeit) { zeit.textContent = hatZeit ? `${eintrag.beginn}–${eintrag.ende} Uhr · online` : 'Online'; }
    ziel.querySelector('[data-feld="thema"]').textContent = thema || 'Thema wird bekannt gegeben';
    const ref = ziel.querySelector('[data-feld="referent"]');
    if (ref) { ref.textContent = eintrag.referent || ''; ref.hidden = !eintrag.referent; }

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
      if (archiv) {
        const oeffnen = archivEinrichten(archiv, termine);
        zuletztEinrichten(document.getElementById('kilab-zuletzt'), termine[0], oeffnen);
        const ziel = termine.find(t => '#' + terminId(t) === decodeURIComponent(location.hash));
        if (ziel) oeffnen(ziel);
      }
    })
    .catch(() => {
      [aktuell, letzte, archiv].filter(Boolean).forEach(z => z.replaceChildren(el('p', 'hinweis', 'Die Inhalte konnten gerade nicht geladen werden.')));
      // Ohne die Datei gibt es kein Thema, der Termin selbst lässt sich trotzdem berechnen
      if (naechster) naechsterTerminEinrichten(naechster, naechsterTermin({}));
      naechsterAufStartseite(naechsterStart, naechsterTermin({}));
    });
})();
