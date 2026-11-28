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
