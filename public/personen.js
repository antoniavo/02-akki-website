// Einheitliche Personendarstellung für alle Seiten (Daten aus public/daten/personen.json).
// Foto (rund), Name, Funktion, LinkedIn-Symbol. Alles nur als Text eingefügt, kein Kasten.
// Foto leer: Initialen-Kreis. LinkedIn leer: kein Symbol.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, klasse, text) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }
  function initialenKreis(p) {
    const s = el('span', 'person__foto person__foto--initialen', p.initialen || '');
    s.setAttribute('aria-hidden', 'true');
    return s;
  }
  function linkedinSymbol(p) {
    const a = el('a', 'person__linkedin');
    a.href = p.linkedin;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'LinkedIn-Profil von ' + p.name);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const pfad = document.createElementNS(NS, 'path');
    pfad.setAttribute('d', 'M6.9 9.5H3.8V20h3.1zM5.35 4.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM20.2 20v-5.9c0-3.1-1.7-4.8-4-4.8-1.3 0-2.3.7-2.8 1.5V9.5h-3V20h3.1v-5.5c0-1.4.8-2.4 2-2.4 1.2 0 1.8.9 1.8 2.4V20z');
    svg.appendChild(pfad);
    a.appendChild(svg);
    return a;
  }
  // funktionen: Liste von Zeilen unter dem Namen (Funktion bzw. Einrichtung)
  window.personDarstellung = function (p, funktionen) {
    const k = el('div', 'person');
    let foto;
    if (p.foto) {
      foto = el('img', 'person__foto');
      foto.src = 'bilder/personen/' + p.foto;
      foto.alt = 'Foto von ' + p.name;
      foto.width = 96; foto.height = 96; foto.loading = 'lazy';
      // Datei fehlt: Initialen-Kreis statt kaputtem Bild
      foto.addEventListener('error', () => foto.replaceWith(initialenKreis(p)), { once: true });
    } else {
      foto = initialenKreis(p);
    }
    k.appendChild(foto);
    k.appendChild(el('strong', 'person__name', p.name));
    (funktionen || []).filter(Boolean).forEach(f => k.appendChild(el('span', 'person__funktion', f)));
    if (p.linkedin) k.appendChild(linkedinSymbol(p));
    return k;
  };
  // Mehrere Personen nebeneinander (umbrechend). items: [{ person, funktionen }]
  window.personenReihe = function (items) {
    const reihe = el('div', 'personen');
    items.filter(i => i && i.person).forEach(i => reihe.appendChild(window.personDarstellung(i.person, i.funktionen)));
    return reihe;
  };
})();
