// Dezente Animation der Meilenstein-Zeitleiste ("Wer wir sind"), im Stil des lebenden Logos.
// Sobald die Zeitleiste ins Bild kommt, läuft ein kleiner Lichtimpuls (weißer Punkt mit kurzer Spur aus Mint-Punkten) in ca. 3 s
// über die Linie. Erreicht er einen Meilenstein-Kreis, leuchtet dieser kurz auf und bleibt danach petrolfarben gefüllt.
// Am letzten Meilenstein bleibt ein sanft pulsierender Ring stehen. Der Impuls wiederholt sich höchstens alle 12 s und nur zweimal
// (insgesamt dreimal), nicht dauerhaft. Bei "Bewegung reduzieren" gibt es keine Animation: alle Kreise sind direkt gefüllt.
// Reines JavaScript und CSS (Stile: style.css, Abschnitt "Zeitleiste"), keine Bibliotheken.
window.zeitleisteAnimieren = function (liste) {
  const punkte = [...liste.querySelectorAll('.zeitleiste__punkt')];
  if (punkte.length < 2) { punkte.forEach(p => p.classList.add('zeitleiste__punkt--gefuellt')); return; }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    punkte.forEach(p => p.classList.add('zeitleiste__punkt--gefuellt'));
    punkte[punkte.length - 1].classList.add('zeitleiste__punkt--ende');
    return;
  }

  const DAUER = 3000, ABSTAND = 12000, MAX_LAEUFE = 3;
  const impuls = document.createElement('span');
  impuls.className = 'zeitleiste__impuls';
  impuls.setAttribute('aria-hidden', 'true');
  // Kopf (weiß) und drei Spurpunkte (Mint, kleiner und blasser), kein durchgehender Schweif
  [['kopf', 0], ['spur', 1], ['spur', 2], ['spur', 3]].forEach(([art, n]) => {
    const punkt = document.createElement('span');
    punkt.className = 'zeitleiste__impuls-' + art;
    punkt.style.setProperty('--n', n);
    impuls.appendChild(punkt);
  });
  liste.appendChild(impuls);

  const px = (stil, name) => parseFloat(stil.getPropertyValue(name)) || 0;
  const zahl = (e, pseudo) => {
    const s = getComputedStyle(e, pseudo);
    return {
      left: px(s, 'left'), top: px(s, 'top'),
      breite: px(s, 'width') + px(s, 'border-left-width') + px(s, 'border-right-width'),
      hoehe: px(s, 'height') + px(s, 'border-top-width') + px(s, 'border-bottom-width'),
    };
  };

  // Wege neu messen (die Anordnung ändert sich je nach Bildschirmbreite: waagerecht oder, auf schmalen Bildschirmen, senkrecht)
  function messen() {
    const mitte = punkte.map(p => {
      const k = zahl(p, '::after');
      return { x: p.offsetLeft + k.left + k.breite / 2, y: p.offsetTop + k.top + k.hoehe / 2 };
    });
    const waagerecht = Math.abs(punkte[0].offsetTop - punkte[punkte.length - 1].offsetTop) < 4;
    const erste = mitte[0], letzte = mitte[mitte.length - 1];
    if (waagerecht) {
      const l = zahl(punkte[0], '::before');
      const linieY = punkte[0].offsetTop + l.top + l.hoehe / 2;
      return { waagerecht, start: { x: erste.x, y: linieY }, ende: { x: letzte.x, y: linieY }, mitte };
    }
    return { waagerecht, start: erste, ende: { x: erste.x, y: letzte.y }, mitte };
  }

  let laeufe = 0, laeuft = false, sichtbar = false, wartet = false, timer = null;

  function aufleuchten(p) {
    p.classList.add('zeitleiste__punkt--gefuellt');
    p.classList.remove('zeitleiste__punkt--leuchtet');
    void p.offsetWidth; // Animation neu starten, auch bei Wiederholungen
    p.classList.add('zeitleiste__punkt--leuchtet');
  }

  function lauf() {
    laeuft = true; wartet = false; laeufe += 1;
    const m = messen();
    impuls.style.setProperty('--drehung', m.waagerecht ? '0deg' : '90deg');
    impuls.style.opacity = '1';
    const t0 = performance.now();
    let naechster = 0;
    function schritt(jetzt) {
      const t = Math.min(1, (jetzt - t0) / DAUER);
      const p = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // sanft anlaufen und abbremsen
      const x = m.start.x + (m.ende.x - m.start.x) * p;
      const y = m.start.y + (m.ende.y - m.start.y) * p;
      impuls.style.transform = `translate(${x}px, ${y}px) rotate(var(--drehung))`;
      // Kreise, die der Kopf erreicht hat, leuchten auf
      while (naechster < punkte.length) {
        const c = m.mitte[naechster];
        const erreicht = m.waagerecht ? x >= c.x - 1 : y >= c.y - 1;
        if (!erreicht) break;
        aufleuchten(punkte[naechster]);
        if (naechster === punkte.length - 1) punkte[naechster].classList.add('zeitleiste__punkt--ende');
        naechster += 1;
      }
      if (t < 1) { requestAnimationFrame(schritt); return; }
      impuls.style.opacity = '0';
      laeuft = false;
      if (laeufe < MAX_LAEUFE) timer = setTimeout(weiter, ABSTAND);
    }
    requestAnimationFrame(schritt);
  }

  // Nächster Lauf nur, wenn die Zeitleiste gerade zu sehen ist; sonst wird er nachgeholt, sobald sie wieder im Bild ist
  function weiter() {
    if (laeuft || laeufe >= MAX_LAEUFE) return;
    if (sichtbar && !document.hidden) lauf(); else wartet = true;
  }

  const beobachter = new IntersectionObserver(eintraege => {
    sichtbar = eintraege[0].isIntersecting;
    if (sichtbar && !laeuft && (laeufe === 0 || wartet)) weiter();
  }, { threshold: 0.5 });
  beobachter.observe(liste);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && wartet) weiter(); });
};
