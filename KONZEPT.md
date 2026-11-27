# AKKI – The Living Website · Unser Zusatzkonzept

Diese Datei ergänzt die Vorgaben der Organisator:innen (`README.md`, `CLAUDE.md`, `SPICKZETTEL.md`). Sie ersetzt sie **nicht**. Die Regeln in `CLAUDE.md` gelten weiter, ebenso die Technik: `public/` mit HTML, CSS, JavaScript und ein kleiner `server.js`, ohne Build-Schritt.

---

## 1. Unsere Idee in einem Satz

Neben der Website bauen wir einen kleinen **Redaktionsassistenten**: Man gibt die DOI einer Publikation ein, die KI schreibt einen Beitragsentwurf, eine Ärztin oder ein Arzt prüft und gibt ihn frei, und erst dann erscheint er auf der Website.

So bleibt die Seite nach dem Hackathon aktuell, ohne dass jemand viel Zeit in die Pflege stecken muss.

---

## 2. Reihenfolge

1. **Pflichtprogramm laut `SPICKZETTEL.md`, Blöcke 1–7.** Das hat Vorrang. Ohne fertige Website gibt es nichts vorzuführen.
2. **Danach unser Zusatz** (Abschnitt 4), wenn noch Zeit bleibt, am besten parallel durch eine zweite Person.
3. **Block 8** (Demo und Pitch) mit dem Redaktionsassistenten als Höhepunkt.

---

## 3. Unsere Festlegungen für die Website

**Seiten:** Start · Über den AKKI · Publikationen · Treffen/KI-Lab · Kontakt · Impressum · Datenschutz

**Farben (unser Logo-Favorit):**

| Name | Wert | Einsatz |
|---|---|---|
| Dunkelblau | `#102D46` | Kopfzeile, Überschriften, Text |
| Petrol | `#16877D` | Links, Buttons |
| Mint | `#70D6CA` | Akzente; nicht als Textfarbe auf hellem Grund (zu wenig Kontrast) |
| Off-White | `#F4F7FA` | Hintergrund |

**Logo:** „AKKI“ · darunter „Arbeitskreis Künstliche Intelligenz“ · darunter klein „AG Digitalisierung · DGOU“. Das Logo ist unabhängig vom Namen „The Living Website“.

**Logos von UKB und Helliwood sowie das Kesselhaus-Foto** nur mit Zustimmung verwenden (siehe `daten/QUELLEN.md`).

---

## 4. Der Redaktionsassistent

### Grundidee: Die Redaktion läuft nur auf dem Laptop

- Die **öffentliche Website bleibt statisch**: reine HTML-Dateien, ohne KI und ohne Schlüssel. Sie kann deshalb überall gehostet werden.
- Der **Redaktionsassistent** läuft nur lokal über `server.js` auf dem Laptop der Redaktion. Dort liegt auch der API-Schlüssel in `.env`.
- **Freigeben** heißt: Der Beitrag wird in die Publikationsliste übernommen. Danach wird der Stand zu GitHub hochgeladen und ist auf der Website sichtbar.

Vorteile: kein Login-System nötig, der Schlüssel liegt nie auf einem Server, und jede Freigabe ist auf GitHub nachvollziehbar.

### Ablauf

```
/redaktion.html (nur lokal)
   │  DOI eingeben
   ▼
server.js  →  Crossref: https://api.crossref.org/works/{DOI}   (Titel, Autoren, Journal, Jahr, ggf. Abstract)
   │
   ▼
server.js  →  Claude: Beitragsentwurf nach festem Schema
   │
   ▼
Entwurf wird angezeigt → Ärztin/Arzt liest, korrigiert im Textfeld, klickt „Freigeben“
   │
   ▼
Beitrag wird in public/daten/publikationen.json gespeichert
   │
   ▼
Hochladen zu GitHub → Website zeigt den neuen Beitrag
```

### Felder eines Beitrags

`titel` · `originaltitel` · `autoren` · `journal` · `jahr` · `doi` · `studientyp` · `kurzfassung` · `ergebnisse` · `einordnung` · `grenzen` · `freigegeben_von` · `datum`

Jeder Beitrag zeigt sichtbar: **„KI-unterstützt erstellt, ärztlich geprüft“**.

### Regeln für den KI-Entwurf (Vorschlag – das Team muss sie freigeben)

Laut `CLAUDE.md` legt das Team medizinische Inhalte und Systemprompts fest, nicht die KI. Dies ist unser **Vorschlag**, den wir im Team prüfen und dann wortgetreu übernehmen lassen:

1. Nur die gelieferten Crossref-Daten und das Abstract verwenden. Keine Zahlen oder Ergebnisse erfinden.
2. Fehlt das Abstract, das ausdrücklich schreiben und die Ergebnis-Felder leer lassen.
3. Studientyp, Stichprobengröße (falls genannt) und Grenzen der Studie benennen. Keine Werbesprache.
4. Keine individuellen Behandlungsempfehlungen.
5. Sprache Deutsch, für ärztliches Fachpublikum, sachlich.
6. Ausgabe als JSON mit genau den Feldern oben.

### Prompts für Claude Code

**Schritt A – DOI-Abfrage**
```
Lies KONZEPT.md, Abschnitt 4. Ergänze server.js um einen Endpunkt /api/doi, der zu einer DOI die Daten von Crossref holt und Titel, Autoren, Journal, Jahr und, falls vorhanden, das Abstract zurückgibt. Baue eine Seite public/redaktion.html mit einem DOI-Feld und einer Anzeige der Daten. Teste mit einer echten DOI.
```

**Schritt B – KI-Entwurf**
```
Ergänze einen Endpunkt /api/entwurf, der mit den Crossref-Daten über die Anthropic-API einen Beitragsentwurf erzeugt. Verwende als Systemprompt wortgetreu die Regeln aus KONZEPT.md, Abschnitt 4 „Regeln für den KI-Entwurf“. Zeige den Entwurf in redaktion.html in bearbeitbaren Feldern an. Schlüssel und Modell kommen aus .env.
```

**Schritt C – Freigabe und Anzeige**
```
Füge in redaktion.html ein Feld „Freigegeben von“ und einen Button „Freigeben“ hinzu. Beim Klick wird der Beitrag in public/daten/publikationen.json gespeichert. Die Seite „Publikationen“ liest diese Datei und zeigt alle Beiträge mit dem Hinweis „KI-unterstützt erstellt, ärztlich geprüft“. redaktion.html und die /api-Endpunkte dürfen auf der veröffentlichten Seite nicht erreichbar sein.
```

---

## 5. Live-Demo (ca. 2 Minuten)

1. Öffentliche Website zeigen.
2. Lokal `redaktion.html` öffnen, eine DOI eingeben.
3. Entwurf erscheint, kurz ärztlich korrigieren, freigeben.
4. Hochladen, und der Beitrag ist auf der Publikationsseite.

**Plan B:** eine vorher aufgezeichnete Bildschirmaufnahme desselben Ablaufs.
