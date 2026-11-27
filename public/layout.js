// Gemeinsame Seitenteile: Navigation (kleine Buttons unter dem Logo) und Fußzeile stehen NUR HIER (eine Komponente für alle Seiten).
// Jede Seite enthält nur zwei Platzhalter:
//   <div id="seitenkopf" class="kopf-fix"> mit dem Pflicht-Hinweis (steht fest im HTML, auch ohne JavaScript sichtbar)
//   <div id="seitenfuss"></div>
// Nur die Startseite hat zusätzlich <div id="hauptnav"></div> im blauen Kopf (unter dem Untertitel); die anderen Seiten bekommen das Band automatisch.
// Menüpunkte ändern: Liste SEITEN unten. Der aktive Punkt wird automatisch aus dem Dateinamen erkannt.
// Die Seite Mitmachen & Kontakt steht bewusst nicht in der Button-Navigation: Sie erreicht man über den runden Mitmachen-Button
// (Startseite) und über den Link "Kontakt" im Footer.
(function () {
  const SEITEN = [
    ['index.html', 'Start'],
    ['wer-wir-sind.html', 'Wer wir sind'],
    ['projekte.html', 'Projekte'],
    ['publikationen.html', 'Publikationen'],
    ['treffen.html', 'KI Lab'],
  ];
  const aktuell = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const istAktuell = datei => (datei === aktuell ? ' aria-current="page"' : '');

  // ---------- Kopf: Navigation als kleine Buttons unter dem Logo mit Untertitel ----------
  // Startseite: Die Buttons stehen im Platzhalter <div id="hauptnav"> direkt unter dem lebenden Logo und dem Untertitel.
  // Alle anderen Seiten: Ein kompaktes blaues Band mit Logo, Untertitel und denselben Buttons wird unter den Pflicht-Hinweis gesetzt.
  const kopf = document.getElementById('seitenkopf');
  if (kopf) {
    const links = SEITEN.map(([datei, name]) => `<li><a class="hauptnav__knopf" href="${datei}"${istAktuell(datei)}>${name}</a></li>`).join('');
    const navHtml = `<nav class="hauptnav" aria-label="Hauptnavigation"><ul>${links}</ul></nav>`;
    const platz = document.getElementById('hauptnav');
    if (platz) {
      platz.outerHTML = navHtml;
    } else {
      const extern = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}<span class="sr-only"> (öffnet in neuem Tab)</span></a>`;
      kopf.insertAdjacentHTML('afterend', `
<div class="kopfband">
  <div class="container kopfband__innen">
    <div class="kopfband__marke">
      <a class="kopfband__logo" href="index.html"><img src="logo/logo-nav-hell.svg" alt="AKKI – zur Startseite" width="69" height="28"></a>
      <p class="kopfband__untertitel"><span>Arbeitskreis Künstliche Intelligenz</span><span class="kopfband__untertitel-2">${extern('https://www.digitalisierung-dgou.de/', 'AG Digitalisierung')} · ${extern('https://dgou.de/', 'DGOU')}</span></p>
    </div>
    ${navHtml}
  </div>
</div>`);
    }
    // Skip-Link für Tastaturbedienung, Ziel ist <main id="inhalt">
    kopf.insertAdjacentHTML('beforebegin', '<a class="skip-link" href="#inhalt">Zum Inhalt springen</a>');
  }  const haupt = document.querySelector('main');
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
