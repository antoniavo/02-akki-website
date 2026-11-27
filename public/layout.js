// Gemeinsame Seitenteile: Navigation und Fußzeile stehen NUR HIER (eine Komponente für alle Seiten).
// Jede Seite enthält nur zwei Platzhalter:
//   <div id="seitenkopf" class="kopf-fix"> mit dem Pflicht-Hinweis (steht fest im HTML, auch ohne JavaScript sichtbar)
//   <div id="seitenfuss"></div>
// Menüpunkte ändern: Liste SEITEN unten. Der aktive Punkt wird automatisch aus dem Dateinamen erkannt.
(function () {
  const SEITEN = [
    ['index.html', 'Start'],
    ['wer-wir-sind.html', 'Wer wir sind'],
    ['projekte.html', 'Projekte'],
    ['publikationen.html', 'Publikationen'],
    ['treffen.html', 'KI Lab'],
    ['mitmachen.html', 'Mitmachen &amp; Kontakt'],
  ];
  const aktuell = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const istAktuell = datei => (datei === aktuell ? ' aria-current="page"' : '');

  // ---------- Kopf: Navigation ----------
  const kopf = document.getElementById('seitenkopf');
  if (kopf) {
    const links = SEITEN.map(([datei, name]) => `<li><a href="${datei}"${istAktuell(datei)}>${name}</a></li>`).join('');
    kopf.insertAdjacentHTML('beforeend', `
<nav class="nav" aria-label="Hauptnavigation">
  <div class="container nav__innen">
    <button class="nav__toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Menü öffnen"><span aria-hidden="true">☰</span><span class="nav__toggle-text">Menü</span></button>
    <ul class="nav__links" id="nav-links">${links}</ul>
  </div>
</nav>`);
    // Skip-Link für Tastaturbedienung, Ziel ist <main id="inhalt">
    kopf.insertAdjacentHTML('beforebegin', '<a class="skip-link" href="#inhalt">Zum Inhalt springen</a>');

    const knopf = document.getElementById('nav-toggle');
    const liste = document.getElementById('nav-links');
    function menue(offen) {
      liste.classList.toggle('nav__links--offen', offen);
      knopf.setAttribute('aria-expanded', String(offen));
      knopf.setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen');
    }
    knopf.addEventListener('click', () => menue(!liste.classList.contains('nav__links--offen')));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && liste.classList.contains('nav__links--offen')) { menue(false); knopf.focus(); } });
  }
  const haupt = document.querySelector('main');
  if (haupt && !haupt.id) { haupt.id = 'inhalt'; haupt.setAttribute('tabindex', '-1'); }

  // ---------- Fußzeile: zwei kompakte Zeilen ----------
  const fuss = document.getElementById('seitenfuss');
  if (fuss) {
    const extern = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
    const intern = (datei, text) => `<a href="${datei}"${istAktuell(datei)}>${text}</a>`;
    const trenner = ' <span class="footer__trenner" aria-hidden="true">·</span> ';
    const verbinde = teile => teile.join(trenner);
    // Zeile 1 rechts: KI Lab · Projekte · Publikationen · Kontakt · GitHub (Namen aus der Liste SEITEN der Navigation)
    const seitenName = datei => SEITEN.find(s => s[0] === datei)[1];
    const navLinks = verbinde([
      intern('treffen.html', seitenName('treffen.html')),
      intern('projekte.html', seitenName('projekte.html')),
      intern('publikationen.html', seitenName('publikationen.html')),
      intern('mitmachen.html', 'Kontakt'),
      extern('https://github.com/akkidgou-opensource', 'GitHub'),
    ]);
    fuss.outerHTML = `
<footer class="footer">
  <div class="container">
    <div class="footer__zeile footer__zeile--1">
      <p class="footer__ueber"><a class="footer__marke" href="index.html"><img src="logo/logo-nav-hell.svg" alt="AKKI – zur Startseite" width="55" height="22"></a><span>Arbeitskreis Künstliche Intelligenz der ${extern('https://www.digitalisierung-dgou.de/', 'AG Digitalisierung')} der ${extern('https://dgou.de/', 'DGOU')}</span></p>
      <nav class="footer__nav" aria-label="Weitere Seiten">${navLinks}</nav>
    </div>
    <div class="footer__zeile footer__zeile--2">
      <p>Partner: AK Medien und digitale Systeme${trenner}<a data-kontakt-email></a>${trenner}${intern('impressum.html', 'Impressum')}${trenner}${intern('datenschutz.html', 'Datenschutz')}</p>
      <p class="footer__hinweis">Prototyp – nur Testdaten. Kein Ersatz für ärztliche Beurteilung.</p>
    </div>
  </div>
</footer>`;
  }
})();
