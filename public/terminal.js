// Mitmach-Terminal: die vier Wege zum Mitmachen und der Kontakt, in Terminal-Optik.
// Zwei Einbauarten (beide aus dieser einen Datei):
//   1) Pop-up am Button mit id="mitmachen-knopf" (Startseite: runder Button unten rechts in der blauen Kopffläche; das ist das einzige Pop-up)
//      - Maus: öffnet beim Überfahren, bleibt offen, solange die Maus auf Button oder Terminal ist, schließt ca. 400 ms nach dem Verlassen
//      - Tastatur: öffnet beim Fokus per Tab, Escape schließt und setzt den Fokus zurück auf den Button
//      - Klick, Antippen (auch Handy) und Enter führen direkt zu mitmachen.html; ohne JavaScript ist der Button ein normaler Link
//   2) Fest eingebaut in <div id="mitmach-terminal"></div> (Seite mitmachen.html)
// Adresse und Betreffzeilen kommen aus public/daten/kontakt.json (über kontakt.js). Es wird nichts gesendet oder gespeichert,
// die Links öffnen nur das E-Mail-Programm (mailto). Alle Texte werden als reiner Text eingefügt.
(function () {
  const WEGE = [
    { titel: 'Am KI Lab teilnehmen', text: 'Aktuelle KI-Themen kennenlernen, Fragen stellen, Erfahrungen austauschen.', href: 'treffen.html', extra: { text: 'Newsletter', betreff: 'newsletter' } },
    { titel: 'Ein eigenes Thema vorstellen', text: 'Praxisbericht, Studie oder spannendes Tool? Schlag ein Thema vor.', betreff: 'themenvorschlag' },
    { titel: 'Forschung mitgestalten', text: 'Forschungsfragen diskutieren und Kooperationen anregen.', betreff: 'forschung' },
    { titel: 'Technologie entwickeln', text: 'Projektideen einbringen und an Open-Source-Prototypen mitarbeiten.', betreff: 'opensource', extra: { text: 'GitHub', href: 'https://github.com/akkidgou-opensource' } },
  ];
  const ZU_VERZOEGERUNG = 400; // ms nach dem Verlassen mit der Maus
  const ANIMATION = 200;       // ms Ein- und Ausblenden

  function el(tag, klasse, text) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }
  function link(text, href, klasse) {
    const a = el('a', klasse, text);
    a.href = href;
    if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }
  function befehl(text) {
    const p = el('p', 'terminal__befehl');
    p.appendChild(el('span', null, '$ ')).setAttribute('aria-hidden', 'true');
    // Der Text steht in einem eigenen Feld, damit das Pop-up ihn Zeichen für Zeichen tippen kann
    const feld = el('span', 'terminal__tipp', text);
    feld.dataset.text = text;
    p.appendChild(feld);
    return p;
  }

  // Kurzer Inhalt des Pop-ups: jede Zeile wird nacheinander getippt (auch die Links), Links sind erst danach klickbar.
  // Jede Zeile: <p class="terminal__zeile-neu"> mit Vorsatz ($ oder >) und einem Feld .terminal__tipp (data-text = Text).
  function popupKoerper() {
    const koerper = el('div', 'terminal__koerper terminal__koerper--popup');
    function zeile(praefix, text, a) {
      const p = el('p', 'terminal__zeile-neu' + (praefix === '$' ? ' terminal__befehl' : ''));
      p.appendChild(el('span', 'terminal__praefix', praefix + ' ')).setAttribute('aria-hidden', 'true');
      const feld = el('span', 'terminal__tipp');
      feld.dataset.text = text;
      if (a) { a.appendChild(feld); p.appendChild(a); } else p.appendChild(feld);
      koerper.appendChild(p);
      return { p, feld, a };
    }
    const weg = (text, href, betreff) => {
      const a = link('', href);
      if (betreff) a.dataset.betreff = betreff;
      return zeile('>', text, a);
    };
    zeile('$', 'akki mitmachen');
    weg('KI Lab besuchen', 'treffen.html');
    weg('Thema vorschlagen', 'mitmachen.html', 'themenvorschlag');
    weg('Mitforschen & mitbauen', 'mitmachen.html');
    zeile('$', 'akki kontakt');
    const mail = link('', 'mitmachen.html');
    const mailZeile = zeile('>', 'E-Mail schreiben', mail);
    zeile('$', '');

    // Adresse und Betreffzeile aus kontakt.json (über kontakt.js), noch bevor die Mail-Zeile getippt wird
    if (window.akkiKontakt && window.akkiKontakt.then) {
      window.akkiKontakt.then(k => {
        if (!k || !k.email) return;
        koerper.querySelectorAll('a[data-betreff]').forEach(a => {
          const betreff = (k.betreff || {})[a.dataset.betreff];
          if (betreff) a.href = 'mailto:' + k.email + '?subject=' + encodeURIComponent(betreff);
        });
        mail.href = 'mailto:' + k.email;
        mailZeile.feld.dataset.text = k.email;
        if (mailZeile.feld.textContent) mailZeile.feld.textContent = k.email;
      });
    }
    return koerper;
  }

  // Baut das Terminal. modus: 'popup' oder 'fest'
  function baue(modus, id) {
    const t = el('div', 'terminal ' + (modus === 'popup' ? 'terminal--popup' : 'terminal--fest'));
    if (modus === 'popup') {
      t.id = id;
      t.setAttribute('role', 'dialog');
      t.setAttribute('aria-label', 'Mitmachen');
      t.hidden = true;
    } else {
      t.setAttribute('role', 'group');
      t.setAttribute('aria-label', 'Mitmachen im Überblick');
    }

    const kopf = el('div', 'terminal__kopf');
    const punkte = el('span', 'terminal__punkte');
    punkte.setAttribute('aria-hidden', 'true');
    punkte.append(el('i'), el('i'), el('i'));
    kopf.append(punkte, el('span', 'terminal__titel', 'akki@dgou: ~/mitmachen'));
    if (modus === 'popup') {
      const x = el('button', 'terminal__zu', '×');
      x.type = 'button';
      x.setAttribute('aria-label', 'Schließen');
      kopf.appendChild(x);
    }
    t.appendChild(kopf);

    if (modus === 'popup') { t.appendChild(popupKoerper()); return t; }

    const koerper = el('div', 'terminal__koerper');
    koerper.appendChild(befehl('akki mitmachen --wege'));
    const liste = el('ul', 'terminal__liste');
    WEGE.forEach((w, i) => {
      const li = el('li');
      const a = link(`[${i + 1}] ${w.titel}`, w.href || 'mitmachen.html');
      if (w.betreff) a.dataset.betreff = w.betreff;
      li.appendChild(a);
      if (w.extra) {
        li.appendChild(document.createTextNode(' '));
        const b = link(w.extra.text, w.extra.href || 'mitmachen.html', 'terminal__extra');
        if (w.extra.betreff) b.dataset.betreff = w.extra.betreff;
        li.appendChild(b);
      }
      li.appendChild(el('span', 'terminal__zeile', w.text));
      liste.appendChild(li);
    });
    koerper.appendChild(liste);

    koerper.appendChild(befehl('akki kontakt'));
    const kontakt = el('p', 'terminal__kontakt');
    const mail = el('a');
    mail.dataset.email = '1';
    mail.href = 'mitmachen.html';
    mail.textContent = 'E-Mail schreiben';
    kontakt.appendChild(mail);
    if (modus === 'popup') {
      kontakt.appendChild(document.createTextNode(' · '));
      kontakt.appendChild(link('Alle Infos zum Mitmachen →', 'mitmachen.html'));
    }
    koerper.appendChild(kontakt);
    t.appendChild(koerper);

    // Adresse und Betreffzeilen aus kontakt.json eintragen (sobald geladen)
    if (window.akkiKontakt && window.akkiKontakt.then) {
      window.akkiKontakt.then(k => {
        if (!k || !k.email) return;
        t.querySelectorAll('a[data-betreff]').forEach(a => {
          const betreff = (k.betreff || {})[a.dataset.betreff];
          if (betreff) a.href = 'mailto:' + k.email + '?subject=' + encodeURIComponent(betreff);
        });
        t.querySelectorAll('a[data-email]').forEach(a => { a.textContent = k.email; a.href = 'mailto:' + k.email; });
      });
    }
    return t;
  }

  // ---------- 1) Pop-up am Button ----------
  function popupEinrichten(knopf) {
    const huelle = el('span', 'terminal-wrap');
    knopf.parentNode.insertBefore(huelle, knopf);
    huelle.appendChild(knopf);
    const t = baue('popup', 'mitmachen-terminal');
    huelle.appendChild(t);

    knopf.setAttribute('aria-expanded', 'false');
    knopf.setAttribute('aria-controls', 'mitmachen-terminal');
    knopf.setAttribute('aria-haspopup', 'dialog');

    let offen = false, zuTimer = null, ausTimer = null, fokusRueckgabe = false;

    // Immer im Bildschirm halten: seitlich verschieben, bei Platzmangel unten nach oben aufklappen
    function platzieren() {
      t.classList.remove('terminal--oben');
      t.style.maxHeight = '';
      // Waagerecht: Breite und Lage vorab berechnen (nicht aus dem Pop-up selbst messen, sonst verbreitert es die Seite)
      const vb = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const rand = 16;
      const breite = Math.min(420, vb - 2 * rand);
      const huelleLinks = huelle.getBoundingClientRect().left;
      const ziel = Math.min(Math.max(huelleLinks, rand), vb - rand - breite);
      t.style.width = breite + 'px';
      t.style.left = (ziel - huelleLinks) + 'px';
      const r = t.getBoundingClientRect();
      // Senkrecht: unten, wenn es passt; sonst oben; sonst auf der größeren Seite mit innerem Scrollen
      const kr = knopf.getBoundingClientRect();
      const untenPlatz = vh - kr.bottom - 8 - 12;
      const obenPlatz = kr.top - 8 - 12;
      const MIN = 220; // darunter lohnt sich ein innerlich scrollendes Pop-up unter dem Button nicht mehr
      if (r.height <= untenPlatz) return;                                  // passt unten
      if (untenPlatz >= MIN) { t.style.maxHeight = untenPlatz + 'px'; return; } // unten, mit innerem Scrollen
      if (r.height <= obenPlatz) { t.classList.add('terminal--oben'); return; } // sonst oben
      if (obenPlatz > untenPlatz) { t.classList.add('terminal--oben'); t.style.maxHeight = Math.max(obenPlatz, 160) + 'px'; }
      else t.style.maxHeight = Math.max(untenPlatz, 160) + 'px';
    }
    // ---- Tippen: alle Zeilen nacheinander, 25 ms pro Zeichen, 150 ms Pause zwischen den Zeilen ----
    // Nichts erscheint vor dem Tippen; Links sind klickbar, sobald ihre Zeile fertig ist. Klick ins Fenster zeigt alles sofort.
    const TIPP_MS = 25, ZEILEN_PAUSE = 150;
    const zeilen = Array.from(t.querySelectorAll('.terminal__zeile-neu')).map(p => ({ p, feld: p.querySelector('.terminal__tipp'), a: p.querySelector('a') }));
    const cursor = el('span', 'terminal__cursor');
    cursor.setAttribute('aria-hidden', 'true');
    let tippTimer = null, tippt = false;
    const reduziert = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function zuruecksetzen() {
      zeilen.forEach(z => { z.p.classList.add('terminal__zeile--wartet'); z.feld.textContent = ''; if (z.a) z.a.inert = true; });
    }
    function tippFertig() {
      clearTimeout(tippTimer);
      tippt = false;
      zeilen.forEach(z => { z.p.classList.remove('terminal__zeile--wartet'); z.feld.textContent = z.feld.dataset.text; if (z.a) z.a.inert = false; });
      zeilen[zeilen.length - 1].p.appendChild(cursor);
    }
    function tippStart() {
      if (reduziert()) { tippFertig(); return; }
      tippt = true;
      zuruecksetzen();
      let zi = 0, ci = 0;
      (function schritt() {
        const z = zeilen[zi];
        if (!z) { tippt = false; return; }
        const text = z.feld.dataset.text; // die Adresse aus kontakt.json steht hier, sobald geladen
        if (ci === 0) { z.p.classList.remove('terminal__zeile--wartet'); z.p.appendChild(cursor); }
        if (ci < text.length) { z.feld.textContent = text.slice(0, ++ci); tippTimer = setTimeout(schritt, TIPP_MS); }
        else { if (z.a) z.a.inert = false; zi++; ci = 0; tippTimer = setTimeout(schritt, ZEILEN_PAUSE); }
      })();
    }
    // Ein Klick ins Fenster zeigt sofort den ganzen Text
    t.addEventListener('pointerdown', () => { if (tippt) tippFertig(); });

    function oeffnen() {
      clearTimeout(zuTimer); clearTimeout(ausTimer);
      if (offen) return;
      offen = true;
      t.hidden = false;
      platzieren();
      knopf.setAttribute('aria-expanded', 'true');
      if (reduziert()) { t.classList.add('terminal--sichtbar'); tippStart(); return; }
      // Schritt 1: dünne leuchtende Linie, Schritt 2 (nach ca. 0,15 s): senkrecht aufziehen, Flackern; insgesamt ca. 0,5 s
      t.classList.add('terminal--linie');
      zuruecksetzen();
      void t.offsetWidth; // Startzustand festhalten
      ausTimer = setTimeout(() => {
        t.classList.remove('terminal--linie');
        t.classList.add('terminal--sichtbar');
        ausTimer = setTimeout(tippStart, 400);
      }, 150);
    }
    function schliessen(fokusZumButton) {
      clearTimeout(zuTimer); clearTimeout(ausTimer); clearTimeout(tippTimer);
      if (!offen) return;
      offen = false;
      tippt = false;
      t.classList.remove('terminal--sichtbar', 'terminal--linie');
      knopf.setAttribute('aria-expanded', 'false');
      ausTimer = setTimeout(() => { t.hidden = true; }, ANIMATION);
      if (fokusZumButton) {
        // Der Fokus-Rücksprung auf den Button darf das Terminal nicht gleich wieder öffnen
        fokusRueckgabe = true;
        knopf.focus();
        fokusRueckgabe = false;
      }
    }
    function spaeterSchliessen() {
      clearTimeout(zuTimer);
      zuTimer = setTimeout(() => schliessen(false), ZU_VERZOEGERUNG);
    }

    // Maus (und Stift): Überfahren öffnet, Verlassen schließt mit Verzögerung
    huelle.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') oeffnen(); });
    huelle.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') spaeterSchliessen(); });

    // Tastatur: Fokus per Tab öffnet (nicht beim Mausklick), Escape schließt
    knopf.addEventListener('focus', () => { if (!fokusRueckgabe && knopf.matches(':focus-visible')) oeffnen(); });
    huelle.addEventListener('focusout', e => {
      if (e.relatedTarget && !huelle.contains(e.relatedTarget)) spaeterSchliessen();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && offen) { e.preventDefault(); schliessen(true); } });

    // Klick, Antippen (auch auf dem Handy) und Enter führen direkt zu mitmachen.html; das Pop-up gibt es nur bei Maus-Überfahren und Tastaturfokus.
    t.querySelector('.terminal__zu').addEventListener('click', () => schliessen(true));

    // Tippen oder Klicken außerhalb schließt
    document.addEventListener('pointerdown', e => { if (offen && !huelle.contains(e.target)) schliessen(false); });
  }

  // ---------- 2) Fest eingebaut ----------
  function festEinbauen(platz) {
    platz.replaceChildren(baue('fest'));
  }

  const knopf = document.getElementById('mitmachen-knopf');
  if (knopf) popupEinrichten(knopf);
  const platz = document.getElementById('mitmach-terminal');
  if (platz) festEinbauen(platz);
})();
