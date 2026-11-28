// Hinweis auf den nächsten AKKI Hackathon (Texte und Datum stehen in daten/usecases.json, Betreff in daten/kontakt.json).
// Ab dem Datum "rueckblickAb" wird der Hinweis deutlicher; die Startseite zeigt dann "Rückblick: <Zeitraum>".
// Alle Texte werden als reiner Text eingefügt.
(function () {
  function berlinHeute() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }
  function istRueckblick(h) {
    return Boolean(h && h.rueckblickAb && berlinHeute() >= h.rueckblickAb);
  }
  window.hackathonRueckblick = istRueckblick;
  // Zeitraum, nach dem Stichtag mit Vorsatz (z. B. "Rückblick: 27.–28.11.2026")
  window.hackathonZeitraum = function (h) {
    if (!h || !h.zeitraum) return '';
    return (istRueckblick(h) && h.rueckblickPraefix ? h.rueckblickPraefix : '') + h.zeitraum;
  };
  // Füllt das Zielelement mit der Zeile zum nächsten Hackathon; ohne Angaben in den Daten bleibt es leer und ausgeblendet
  window.hackathonHinweis = function (ziel, h) {
    const f = h && h.folgeveranstaltung;
    if (!ziel || !f || !f.text) { if (ziel) ziel.hidden = true; return; }
    ziel.classList.toggle('hackathon-hinweis--deutlich', istRueckblick(h));
    ziel.replaceChildren(document.createTextNode(f.text));
    if (f.linkText) {
      ziel.appendChild(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.textContent = f.linkText;
      a.href = 'mitmachen.html';
      ziel.appendChild(a);
      // Adresse und Betreff aus kontakt.json
      if (window.akkiKontakt && window.akkiKontakt.then) {
        window.akkiKontakt.then(k => {
          if (!k || !k.email) return;
          const betreff = (k.betreff || {})[f.betreffSchluessel];
          a.href = 'mailto:' + k.email + (betreff ? '?subject=' + encodeURIComponent(betreff) : '');
        });
      }
    }
    ziel.hidden = false;
  };
})();
