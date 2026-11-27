// Menü auf dem Handy auf- und zuklappen (für alle Seiten gleich)
(function () {
  const knopf = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!knopf || !links) return;
  knopf.addEventListener('click', () => {
    const offen = links.classList.toggle('offen');
    knopf.setAttribute('aria-expanded', offen);
    knopf.setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen');
  });
})();
