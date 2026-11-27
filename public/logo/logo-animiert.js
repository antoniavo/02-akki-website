/*
  AKKI – lebendes Logo
  Einbau:
    <canvas data-akki-logo style="width:100%;height:260px;background:#2C4F6B;border-radius:14px"></canvas>
    <script src="logo/logo-animiert.js"></script>
  Optional: data-untertitel="..." und data-zeile2="..." am <canvas> ändern die Texte unter dem Logo.
  data-untertitel="aus": Die beiden Zeilen werden NICHT im Canvas gezeichnet (die Seite setzt sie als HTML-Text darunter).
  In diesem Fall (mit data-auto-hoehe) setzt das Skript am Elternelement des Canvas die Variablen --logo-fs1 und --logo-fs2
  (Schriftgrößen der beiden Zeilen, wachsen mit dem Logo), damit der HTML-Text dieselben Größen wie bisher im Canvas hat.
  Optional: data-auto-hoehe am <canvas>: Das Logo wird ca. 70 % der Breite groß (max. 900 px, auf dem Handy ca. 90 %),
  die Höhe des Canvas ergibt sich daraus (mit Abstand oben und unten), Untertitel wachsen mit (22 px bzw. 15 px bei voller Größe).
  Lichtimpulse: eine kurze Kette aus 5 hellen Punkten (Weiß bis Mint) wandert über die Punktbahnen; überquerte Logo-Punkte leuchten kurz auf.
  Ohne Zusatzprogramme. Bei "Bewegung reduzieren" im Betriebssystem wird nur das stille Logo gezeigt (keine Impulse).
*/
(function () {
  const BASE = '#8FDCCB', ACC = '#FFFFFF', TXT = '#FFFFFF', TXT2 = '#8FDCCB';
  // Impuls-Kette: 5 Punkte, vorn Weiß, hinten Mint (#8FDCCB), Abstand = 10 Schritte auf der Spur
  const BEADS = 5, SPACING = 10;
  const BEAD_COLORS = Array.from({ length: BEADS }, (_, i) => {
    const f = i / (BEADS - 1), a = [255, 255, 255], b = [143, 220, 203];
    return 'rgb(' + a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',') + ')';
  });
  const LETTERS = [
    [[0, 100, 35, 0], [35, 0, 70, 100], [14, 60, 56, 60]],
    [[0, 0, 0, 100], [0, 62, 54, 0], [19, 40, 58, 100]],
    [[0, 0, 0, 100], [0, 62, 54, 0], [19, 40, 58, 100]],
    [[0, 0, 0, 100]]
  ];
  const WIDTHS = [70, 58, 58, 0], GAP = 28;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function start(c) {
    const x = c.getContext('2d');
    const ohneText = String(c.dataset.untertitel || '').toLowerCase() === 'aus';
    const sub1 = (!ohneText && c.dataset.untertitel) || 'Arbeitskreis Künstliche Intelligenz';
    const sub2 = c.dataset.zeile2 || 'AG Digitalisierung · DGOU';
    const auto = c.hasAttribute('data-auto-hoehe');
    let W, H, P = [], E = [], N = [], Q = [], m = { x: -999, y: -999 }, last = 0, grid, MIN, txtY, fs, fs2, SC = 1, topPad = 0;

    function add(px, py) {
      const gx = Math.floor(px / MIN), gy = Math.floor(py / MIN);
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const cell = grid.get((gx + a) + ',' + (gy + b));
        if (cell) for (const i of cell) if ((P[i].x - px) ** 2 + (P[i].y - py) ** 2 < MIN * MIN) return i;
      }
      P.push({ x: px, y: py, g: 0 });
      const k = gx + ',' + gy;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(P.length - 1);
      return P.length - 1;
    }
    function edge(a, b) { if (a !== b) E.push(a < b ? [a, b] : [b, a]); }

    function build() {
      const r = window.devicePixelRatio || 1;
      const tot = WIDTHS.reduce((a, b) => a + b, 0) + GAP * 3;
      W = c.clientWidth;
      let sc;
      if (auto) {
        // Schriftzug ca. 70 % der Breite (Handy bis 600 px: 90 %, dazwischen gleitend), höchstens 900 px
        const anteil = Math.max(0.7, Math.min(0.9, 0.9 - (W - 600) / 400 * 0.2));
        sc = Math.min(W * anteil, 900) / tot;
        fs = Math.max(13, Math.min(22, sc * 6.6));   // Untertitel 1: 22 px bei voller Größe, mindestens 13 px
        fs2 = Math.max(11, fs * 0.68);               // Untertitel 2: 15 px bei voller Größe, mindestens 11 px
        const rand = Math.max(24, Math.min(40, W * 0.035));
        H = Math.round(100 * sc + (ohneText ? fs * 0.9 + rand : fs * 3.4 + 2 * rand));
        c.style.height = H + 'px';
        // Schriftgrößen für den HTML-Text unter dem Logo (nur wenn der Canvas die Zeilen nicht selbst zeichnet)
        if (ohneText && c.parentNode) {
          c.parentNode.style.setProperty('--logo-fs1', fs + 'px');
          c.parentNode.style.setProperty('--logo-fs2', fs2 + 'px');
        }
        topPad = rand;
      } else {
        H = c.clientHeight || 260;
        sc = Math.min((W * 0.8) / tot, (H * 0.58) / 100);
        fs = Math.max(11, Math.min(18, sc * 11));
        fs2 = fs * 0.75;
      }
      SC = sc;
      c.width = W * r; c.height = H * r; x.setTransform(r, 0, 0, r, 0, 0);
      const blockH = 100 * sc + fs * 3.4;
      // ohne Untertitel im Canvas: Abstand oben = topPad, der Platz darunter bleibt für den HTML-Text
      const ox = (W - tot * sc) / 2, oy = (auto && ohneText) ? topPad : (H - blockH) / 2;
      txtY = oy + 100 * sc + fs * 1.9;
      const step = 7 * sc / 1.45, rails = [-2, -1, 0, 1, 2], rg = 5 * sc / 1.45;
      MIN = 5.2 * sc / 1.45;
      P = []; E = []; grid = new Map(); let cx = 0;
      LETTERS.forEach((segs, li) => {
        segs.forEach(([x1, y1, x2, y2]) => {
          const ax = ox + (cx + x1) * sc, ay = oy + y1 * sc, bx = ox + (cx + x2) * sc, by = oy + y2 * sc;
          const len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len, nx = -uy, ny = ux;
          const n = Math.floor(len / step), idx = [];
          rails.forEach((rr, ri) => {
            idx[ri] = [];
            const sh = (ri % 2) * step / 2;
            for (let k = 0; k <= n; k++) {
              const t = Math.min(k * step + sh, len);
              const id = add(ax + ux * t + nx * rr * rg, ay + uy * t + ny * rr * rg);
              if (k > 0) edge(idx[ri][k - 1], id);
              idx[ri].push(id);
            }
          });
          for (let ri = 1; ri < rails.length; ri++) for (let k = 0; k <= n; k++) {
            edge(idx[ri - 1][k], idx[ri][k]);
            if (k + 1 <= n) (ri % 2) ? edge(idx[ri - 1][k + 1], idx[ri][k]) : edge(idx[ri - 1][k], idx[ri][k + 1]);
          }
        });
        cx += WIDTHS[li] + GAP;
      });
      const seen = new Set();
      E = E.filter(([a, b]) => { const k = a + '-' + b; if (seen.has(k)) return false; seen.add(k); return true; });
      N = P.map(() => []);
      E.forEach(([a, b]) => { N[a].push(b); N[b].push(a); });
      Q = [];
      if (!reduce) for (let k = 0; k < 3; k++) spawn(Math.floor(Math.random() * P.length));
    }

    function spawn(a) {
      if (!N[a] || !N[a].length) return;
      Q.push({ a, b: N[a][0], t: 0, tr: [], life: Q.length < 3 ? 1e9 : 200 });
      if (Q.length > 9) Q.splice(3, 1);
    }

    function draw() {
      x.clearRect(0, 0, W, H);
      for (const p of P) {
        const dx = p.x - m.x, dy = p.y - m.y;
        if (dx * dx + dy * dy < 1600) p.g = Math.min(1, p.g + 0.15);
        p.g *= 0.972;
      }
      const lw = Math.max(0.8, SC * 0.3);
      x.lineWidth = lw; x.strokeStyle = BASE; x.globalAlpha = 0.3; x.beginPath();
      for (const [i, j] of E) { x.moveTo(P[i].x, P[i].y); x.lineTo(P[j].x, P[j].y); }
      x.stroke();
      x.strokeStyle = ACC;
      for (const [i, j] of E) {
        const gg = Math.min(P[i].g, P[j].g);
        if (gg > 0.05) { x.globalAlpha = gg * 0.8; x.beginPath(); x.moveTo(P[i].x, P[i].y); x.lineTo(P[j].x, P[j].y); x.stroke(); }
      }
      for (const q of Q) {
        q.life--; q.t += 0.05;
        if (q.t >= 1) {
          P[q.b].g = Math.max(P[q.b].g, 0.8);
          const o = N[q.b].filter(n => n !== q.a); let nb = q.a;
          if (o.length) {
            const dx = P[q.b].x - P[q.a].x, dy = P[q.b].y - P[q.a].y;
            o.sort((u, v) => ((P[v].x - P[q.b].x) * dx + (P[v].y - P[q.b].y) * dy) - ((P[u].x - P[q.b].x) * dx + (P[u].y - P[q.b].y) * dy));
            nb = Math.random() < 0.7 ? o[0] : o[Math.floor(Math.random() * o.length)];
          }
          q.a = q.b; q.b = nb; q.t = 0;
        }
        const A = P[q.a], B = P[q.b];
        q.tr.push([A.x + (B.x - A.x) * q.t, A.y + (B.y - A.y) * q.t]);
        if (q.tr.length > BEADS * SPACING) q.tr.shift();
      }
      Q = Q.filter(q => q.life > 0);
      // Logo-Punkte: etwas heller und kräftiger (Deckkraft mindestens 0,85)
      const pr = MIN * 0.37;
      for (const p of P) {
        x.globalAlpha = 0.85 + p.g * 0.15; x.fillStyle = p.g > 0.2 ? ACC : BASE;
        x.beginPath(); x.arc(p.x, p.y, pr + p.g * pr * 0.4, 0, 6.283); x.fill();
      }
      // Lichtimpuls: kurze Kette aus 5 hellen Punkten (Weiß bis Mint) auf der Spur, kein runder Kopf mit Schweif mehr.
      // Die Logo-Punkte, die ein Kettenglied überquert, leuchten kurz auf.
      const hr = Math.max(2.4, SC * 0.9), nah = (MIN * 0.7) ** 2;
      for (const q of Q) {
        const tr = q.tr, fade = Math.min(1, q.life / 40);
        for (let i = BEADS - 1; i >= 0; i--) {
          const k = tr.length - 1 - i * SPACING;
          if (k < 0) continue;
          const f = i / (BEADS - 1), bx = tr[k][0], by = tr[k][1], rad = hr * (1 - 0.4 * f);
          for (const p of P) {
            const dx = p.x - bx, dy = p.y - by;
            if (dx * dx + dy * dy < nah) p.g = Math.max(p.g, 0.85 - 0.25 * f);
          }
          x.fillStyle = BEAD_COLORS[i];
          x.globalAlpha = 0.22 * fade; x.beginPath(); x.arc(bx, by, rad * 2.1, 0, 6.283); x.fill();   // zarter Schein
          x.globalAlpha = (1 - 0.35 * f) * fade; x.beginPath(); x.arc(bx, by, rad, 0, 6.283); x.fill();
        }
      }
      x.globalAlpha = 1; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      if (!ohneText) {
        x.fillStyle = TXT; x.font = '500 ' + fs + 'px Manrope, system-ui, sans-serif';
        if (x.letterSpacing !== undefined) x.letterSpacing = (fs * 0.08) + 'px';
        x.fillText(sub1, W / 2, txtY);
        x.fillStyle = TXT2; x.font = '400 ' + fs2 + 'px Manrope, system-ui, sans-serif';
        x.fillText(sub2, W / 2, txtY + fs * 1.35);
        if (x.letterSpacing !== undefined) x.letterSpacing = '0px';
      }
      if (!reduce) requestAnimationFrame(draw);
    }

    c.setAttribute('role', 'img');
    if (!c.getAttribute('aria-label')) c.setAttribute('aria-label', 'AKKI – ' + sub1 + ', ' + sub2);
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top;
      const now = performance.now();
      if (!reduce && now - last > 350) {
        let bi = -1, bd = 900;
        P.forEach((p, i) => { const d = (p.x - m.x) ** 2 + (p.y - m.y) ** 2; if (d < bd) { bd = d; bi = i; } });
        if (bi >= 0) { spawn(bi); last = now; }
      }
      if (reduce) draw();
    });
    c.addEventListener('mouseleave', () => { m.x = -999; m.y = -999; if (reduce) draw(); });
    window.addEventListener('resize', () => { build(); if (reduce) draw(); });
    build(); draw();
  }

  function init() { document.querySelectorAll('canvas[data-akki-logo]').forEach(start); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
