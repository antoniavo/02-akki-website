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
    <div class="nav__marke">
      <a class="nav__brand" href="index.html"><img src="logo/logo-nav.svg" alt="AKKI – zur Startseite" width="99" height="40"></a>
      <p class="nav__zusatz"><a href="https://www.digitalisierung-dgou.de/" target="_blank" rel="noopener">AG Digitalisierung</a> · <a href="https://dgou.de/" target="_blank" rel="noopener">DGOU</a></p>
    </div>
    <button class="nav__toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Menü öffnen"><span aria-hidden="true">☰</span></button>
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

  // ---------- Fußzeile ----------
  const fuss = document.getElementById('seitenfuss');
  if (fuss) {
    // Die Hauptlinks stammen aus derselben Liste SEITEN wie die Navigation (Start, KI Lab, Projekte, Publikationen)
    const fussLinks = ['index.html', 'treffen.html', 'projekte.html', 'publikationen.html']
      .map(d => `<li><a href="${d}"${istAktuell(d)}>${SEITEN.find(s => s[0] === d)[1]}</a></li>`).join('');
    fuss.outerHTML = `
<footer class="footer">
  <div class="container footer__innen">
    <div class="footer__spalte footer__spalte--marke">
      <a class="footer__marke" href="index.html"><img src="logo/logo-nav-hell.svg" alt="AKKI – zur Startseite" width="99" height="40"></a>
      <p>Arbeitskreis Künstliche Intelligenz · AG Digitalisierung · DGOU</p>
      <p class="footer__pfad"><a href="https://dgou.de/" target="_blank" rel="noopener">DGOU</a> › <a href="https://www.digitalisierung-dgou.de/" target="_blank" rel="noopener">AG Digitalisierung</a> › <a href="index.html">AKKI</a></p>
    </div>
    <nav class="footer__spalte" aria-label="Seiten">
      <p class="footer__titel">Seiten</p>
      <ul>${fussLinks}</ul>
    </nav>
    <div class="footer__spalte">
      <p class="footer__titel">Kontakt und Links</p>
      <ul>
        <li><a data-kontakt-email></a></li>
        <li><a href="https://github.com/akkidgou-opensource" target="_blank" rel="noopener">GitHub</a></li>
        <li><a href="https://dgou.de/" target="_blank" rel="noopener">DGOU</a></li>
        <li><a href="https://www.digitalisierung-dgou.de/" target="_blank" rel="noopener">AG Digitalisierung</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer__unten">
    <p>Partner: AK Medien und digitale Systeme</p>
    <ul>
      <li><a href="impressum.html"${istAktuell('impressum.html')}>Impressum</a></li>
      <li><a href="datenschutz.html"${istAktuell('datenschutz.html')}>Datenschutz</a></li>
    </ul>
    <p class="footer__hinweis">Prototyp – nur Testdaten. Kein Ersatz für ärztliche Beurteilung.</p>
  </div>
</footer>`;
  }
})();
