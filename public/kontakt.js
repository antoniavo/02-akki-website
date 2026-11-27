// Die Kontakt-E-Mail-Adresse steht an genau einer Stelle: public/daten/kontakt.json
// Dieses Skript trägt sie überall ein, wo ein Element data-kontakt-email hat.
// Bei Links (<a>) wird zusätzlich der mailto-Link gesetzt.
window.akkiKontakt = fetch('daten/kontakt.json')
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(kontakt => {
    document.querySelectorAll('[data-kontakt-email]').forEach(el => {
      el.textContent = kontakt.email;
      if (el.tagName === 'A') el.href = 'mailto:' + kontakt.email;
    });
    // Knöpfe, die eine E-Mail mit Betreff öffnen (Text bleibt, nur der Link wird gesetzt)
    document.querySelectorAll('a[data-kontakt-mailto]').forEach(el => {
      el.href = 'mailto:' + kontakt.email + '?subject=' + encodeURIComponent(el.dataset.kontaktMailto);
    });
    return kontakt;
  })
  .catch(() => {
    document.querySelectorAll('[data-kontakt-email]').forEach(el => { el.textContent = 'Adresse folgt'; });
    return { email: '' };
  });
