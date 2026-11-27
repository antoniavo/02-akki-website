// Mitmach-Terminal: die vier Wege zum Mitmachen und der Kontakt, in Terminal-Optik.
// Zwei Einbauarten (beide aus dieser einen Datei):
//   1) Pop-up am Button mit id="mitmachen-knopf" (Startseite)
//      - Maus: öffnet beim Überfahren, bleibt offen, solange die Maus auf Button oder Terminal ist, schließt ca. 400 ms nach dem Verlassen
//      - Tastatur: öffnet beim Fokus per Tab, Escape schließt und setzt den Fokus zurück auf den Button
//      - Touch: Antippen öffnet, erneutes Antippen oder "×" schließt
//      - Klick mit der Maus oder Enter führt weiterhin zu mitmachen.html; ohne JavaScript ist der Button ein normaler Link
//   2) Fest eingebaut in <div id="mitmach-terminal"></div> (Seite mitmachen.html)
// Adresse und Betreffzeilen kommen aus public/daten/kontakt.json (über kontakt.js). Es wird nichts gesendet oder gespeichert,
// die Links öffnen nur das E-Mail-Programm (mailto). Alle Texte werden als reiner Text eingefügt.
(function () {
  const WEGE = [
    { titel: 'Am KI Lab teilnehmen', text: 'Aktuelle KI-Themen kennenlernen, Fragen stellen, Erfahrungen austauschen.', href: 'treffen.html', extra: { text: 'Newsletter', betreff: 'newsletter' } },
    { titel: 'Ein eigenes Thema vorstellen', text: 'Praxisbericht, Studie oder spannendes Tool? Schlagen Sie ein Thema vor.', betreff: 'themenvorschlag' },
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
    p.appendChild(document.createTextNode(text));
    return p;
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
    kopf.append(punkte, el('span', 'terminal__titel', 'akki – mitmachen'));
    if (modus === 'popup') {
      const x = el('button', 'terminal__zu', '×');
      x.type = 'button';
      x.setAttribute('aria-label', 'Schließen');
      kopf.appendChild(x);
    }
    t.appendChild(kopf);

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
    function oeffnen() {
      clearTimeout(zuTimer); clearTimeout(ausTimer);
      if (offen) return;
      offen = true;
      t.hidden = false;
      platzieren();
      void t.offsetWidth; // Startzustand festhalten, damit die Einblendung animiert
      t.classList.add('terminal--sichtbar');
      knopf.setAttribute('aria-expanded', 'true');
    }
    function schliessen(fokusZumButton) {
      clearTimeout(zuTimer);
      if (!offen) return;
      offen = false;
      t.classList.remove('terminal--sichtbar');
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

    // Touch: Antippen öffnet bzw. schließt. Maus-Klick und Enter folgen dem Link zu mitmachen.html.
    knopf.addEventListener('click', e => {
      const touch = e.pointerType === 'touch' || (window.matchMedia('(hover: none)').matches && e.detail !== 0);
      if (!touch) return;
      e.preventDefault();
      if (offen) schliessen(false); else oeffnen();
    });
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
