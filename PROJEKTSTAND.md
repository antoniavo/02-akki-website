# PROJEKTSTAND – AKKI-Website (Übergabe nach Clear)

**Stand:** Sa 28.11.2026, Vormittag · AKKI Hackathon 2026, Use Case 02 · Präsentation: heute (Sa 28.11.2026)

> **Für Claude Code nach einem Clear:** Lies zuerst diese Datei, dann `CLAUDE.md` (Regeln der Orga), `PRODUCT.md` (Produktbeschreibung), `inhalte.md` (Inhalte, Designvorgaben, **„Offene Punkte – Gesamtliste“**) und `KONZEPT.md` (Smart Editor). Vor dem Arbeiten `git branch --show-current`, `git log` und `git status` ansehen; diese Datei kann hinter dem Repo zurückliegen. Die Historie der einzelnen Änderungen steht in der Git-Historie, hier steht nur der **gültige Stand**.
>
> **Kurzfassung:** Alle Seiten stehen und sind online (Vercel, siehe Abschnitt 10). Smart Editor (DOI-Import, Termine) am 28.11. durchgetestet und funktioniert. **Zwei Branches:** `main` = Produktion (Vercel), `design-test` = Design-Experimente (Feinschliff, Stil-Vorschau); die Branches NICHT einfach zusammenführen (Abschnitt 10). **Offen:** Push von `main` (macht das Team), Entscheidung über den Design-Stil, Titel der ersten KI-Lab-Vorträge ab 03.12.2025, Text für Use Case 7.

---

## 1. Worum es geht

Website des **Arbeitskreises Künstliche Intelligenz (AKKI)** der **AG Digitalisierung der DGOU**.
Leitidee **„The Living Website“**: Die Seite pflegt sich mithilfe von KI weitgehend selbst. Der **Smart Editor** erzeugt Entwürfe (Publikation per DOI, KI-Lab-Termin, Newsletter), eine Ärztin oder ein Arzt gibt frei, danach erscheint der Inhalt auf der Website.

**Team:** Anna Klempert, Antonia von Helden (Website und Inhalte), drittes Teammitglied · Ansprechpartner vor Ort: David Baur (AG-Leitung).

---

## 2. Arbeitsregeln (wichtig!)

- **Einziger Arbeitsordner:** `C:\Users\claud\Documents\GitHub\02-akki-website` (mit GitHub verknüpft). Der alte Ordner `Desktop\02-akki-website-main` (bzw. `ALT-nicht-benutzen`) wird **nicht** mehr verwendet.
- **GitHub:** Fork in Antonias Account `antoniavo/02-akki-website` (öffentlich). Vorlage der Orga: `akkidgou-opensource/02-akki-website`.
- **Speichern (Commit) macht Claude Code selbst und ohne Rückfrage, Hochladen (Push) nur das Team** in GitHub Desktop („Push origin“), weil GitHub eine Anmeldung verlangt. Das Team pusht manchmal selbst Commits aus GitHub Desktop („Update …“).
- **`inhalte.md` bearbeitet nur Claude Code.** Das Team liefert Texte per Prompt.
- **Alles in `public/` ist öffentlich**, ebenso das GitHub-Repo. Keine internen Inhalte dort ablegen (Promotionsprojekte, Teams-Links, Schlüssel).
- **API-Schlüssel** nur in `.env` (steht in `.gitignore`), nie im Chat, nie auf GitHub. Auch keine Environment Variables auf Vercel.
- **Nichts erfinden.** Unbestätigte Angaben weglassen oder in `inhalte.md` als offen führen; keine sichtbaren „Text folgt“-Platzhalter. Medizinische Inhalte nicht eigenmächtig ändern (`CLAUDE.md`).
- **Anrede: Sie-Form** auf der ganzen Website (Team-Entscheidung 28.11.2026; ein Versuch mit „du“ wurde am selben Tag zurückgenommen). Wörtliche Quelltexte in dritter Person („Sie sprechen“ bei Use Case 4 = die Patientinnen und Patienten) bleiben unverändert.
- **Schreibregel:** kurze Texte, pro Abschnitt höchstens 2 Sätze oder Stichpunkte. Die **Startseite hat bewusst fast keinen Text** (keine Slogans, keine Begrüßung).
- **Palette D und Logo bleiben unverändert** (Blau #00508A, Petrol #008F83, Mint #78CBB9, Mint hell #E6F5F1, Schieferblau #2C4F6B; Schriften Archivo und Manrope).
- Pflichthinweis der Orga bleibt sichtbar (Kopf und Footer jeder Seite): „Prototyp – nur Testdaten. Kein Ersatz für ärztliche Beurteilung.“
- **Fotos von Personen nur mit Einverständnis.** Fotos liegen in `public/bilder/personen/`, die Dateien nicht löschen.

**Stolpersteine (Windows):**

- **Git** ist nicht im PATH. Es liegt in GitHub Desktop: `%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`. `git push` geht dort nicht (Anmeldung).
- **Server starten** (immer im richtigen Ordner): `node --env-file-if-exists=.env server.js`, Adresse `http://localhost:3000`. Der Server zeigt immer den Stand des gerade ausgewählten Branches. Port belegt? `Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`. Vorschau über `.claude/launch.json` (`akki-website`) startet den richtigen Ordner (bei belegtem Port weicht sie auf 3001 aus).
- **Seiten per Doppelklick öffnen** zeigt Daten (Kontakt, Termine, Publikationen) nicht. Immer über `http://localhost:3000` ansehen.
- Nach Änderungen im Browser **Strg+F5** (alter Zwischenspeicher).
- `style.css` hat Windows-Zeilenenden (CRLF), andere Dateien LF; beim Ersetzen von Text zeilenweise arbeiten. Bei Merges zwischen den Branches gibt es oft Konflikte am Dateiende von `style.css` (beide Seiten hängen dort an): beide Teile behalten.
- In PowerShell-Befehlen mit Anführungszeichen im Text lieber Edit/Write-Werkzeuge benutzen (Skript-Blöcke brechen sonst).

---

## 3. Technik

Node.js, keine Zusatzpakete, kein Build. `server.js` liefert `public/` aus (nur lokal; auf Vercel liegt `public/` statisch).

| Teil | Datei / Ort |
|---|---|
| Seiten | `public/index.html`, `wer-wir-sind.html`, `projekte.html`, `publikationen.html`, `treffen.html` (KI Lab), `mitmachen.html`, `impressum.html`, `datenschutz.html` |
| Design | `public/style.css`: Farben, Abstände (8/16/24/40/64), Komponenten; Schriften Archivo und Manrope lokal in `public/fonts` (keine Verbindung zu Dritten) |
| Gemeinsame Teile | `public/layout.js`: **Navigation (kleine Buttons) und Footer stehen nur hier** (Menüpunkte in `SEITEN`). Jede Seite hat nur die Platzhalter `<div id="seitenkopf" class="kopf-fix">` (mit Pflichthinweis) und `<div id="seitenfuss">`; die Startseite zusätzlich `<div id="hauptnav">` im blauen Kopf |
| Skripte | `kontakt.js` (Adresse und Betreffzeilen aus `kontakt.json`), `beitraege.js` (KI-Lab-Liste, Termin-Ticket, „Danach“-Zeile, nächster erster Dienstag, .ics, Startseiten-Karten), `startseite.js` (Hackathon-Karte, neue Publikationen, Drehtempo des Buttons), `hackathon-hinweis.js` (Zeile „Nächster AKKI Hackathon …“, Rückblick ab Stichtag), `personen.js` (einheitliche Personendarstellung, nur auf „Wer wir sind“ verwendet), `terminal.js` (Mitmach-Terminal), `zeitleiste.js`, `logo/logo-animiert.js` (lebendes Logo). Weitere Styles: `kilab.css` (nur KI-Lab-Seite) |
| Daten | `public/daten/`: `beitraege.json` (KI-Lab-Termine, Kategorien, `bestaetigt`), `projekte.json`, `publikationen.json` (56 Einträge), `personen.json` (je Person `foto` = Dateiname in `bilder/personen/`, `linkedin` = URL, leer = nicht anzeigen), `organisation.json`, `usecases.json` (Hackathon inkl. `folgeveranstaltung`, `rueckblickAb`, 7 Use Cases), `kontakt.json` (`akki@dgou.de`, Betreffzeilen inkl. `hackathon2027`) |
| Quelldaten | `daten/publikationen-ag.md` (Teamliste), `daten/hackathon-website` und `daten/QUELLEN.md` (Referenz der Orga-Seite) |
| Logos | `public/logo/`; `public/bilder/logo-dgou-ak-ki-web.png` (DGOU-Logo auf „Wer wir sind“; weitere Datei `logo-dgou-ag-digitalisierung-ak-ki.png` liegt ungenutzt) |
| Smart Editor | `redaktion/redaktion.html`, **nur lokal** über `server.js` (`http://localhost:3000/redaktion`), nicht öffentlich; Schnittstellen `/api/quelle`, `/api/publikation-speichern`, `/api/termin-speichern` |
| Bearbeitungsbereich | `public/admin/index.html` + `config.yml` (Sveltia CMS 5.0.3 von unpkg, `noindex`); `/admin` schützt `server.js` per Passwort (Abschnitt 9) |
| Hosting | Vercel, Projekt `akki-website` (Abschnitt 10). Suchmaschinen vorerst gesperrt (`noindex`, Header und Meta) |

Alle Texte aus den Daten werden als reiner Text eingefügt; leere Felder (`null`) werden nicht angezeigt. Datensätze haben `quelle`, `stand`, `status` (`bestaetigt` | `entwurf`).

---

## 4. Gültige Entscheidungen (Design und Aufbau, Stand `main`)

**Farben** (Tokens in `style.css`): `--blau #00508A` · `--petrol #008F83` · `--petrol-text #007A70` (Buttons mit weißer Schrift, 5,2:1) · `--mint #78CBB9` · `--mint-hell #E6F5F1` · `--navy #2C4F6B` · Logo-Mint `#8FDCCB` · `--text #2B3A45` · `--text-2 #4A5560`. Texte mindestens 4,5:1 (Ausnahmen siehe Abschnitt 7). `ARBEITSAUFTRAG.md` nennt teils noch alte Werte, es gilt dieser Stand.

**Navigation:** Start · Wer wir sind · Projekte · Publikationen · KI Lab als kleine Buttons unter Logo und Untertitel (Startseite: im lebenden Logo-Kopf; andere Seiten: blaues Band). „Mitmachen & Kontakt“ steht nicht in der Navigation (Zugang über den runden Button und Footer „Kontakt“).

**Startseite:**
1. Blaue Kopffläche mit lebendem Logo, sanfter Verlauf in den hellen Grund (#F4F7F9).
2. **Runder Mitmachen-Button** mit dem **Mitmach-Terminal** als Pop-up (`terminal.js`, nur das Pop-up; die feste Fassung auf `mitmachen.html` ist unverändert): Öffnen in zwei Schritten (Mint-Linie, dann Aufziehen mit Flackern, ca. 0,5 s), Fensterkopf mit drei Punkten und „akki@dgou: ~/mitmachen“, Hintergrund #1E3A50, Scanlines. Inhalt: `$ akki mitmachen` / `> KI Lab besuchen` (treffen.html) / `> Thema vorschlagen` (mailto, Betreff `themenvorschlag`) / `> Mitforschen & mitbauen` (mitmachen.html) / `$ akki kontakt` / `> <E-Mail aus kontakt.json>` / `$` mit Cursor. **Alle Zeilen werden nacheinander getippt** (25 ms pro Zeichen, 150 ms Pause), Links sind klickbar, sobald ihre Zeile fertig ist; Klick ins Fenster zeigt alles sofort; bei „Bewegung reduzieren“ sofort alles. Öffnen per Maus-Überfahren und Tastaturfokus; Klick/Enter auf den Button führt zu `mitmachen.html`.
3. **Hackathon-Karte „Aktuell“** (#3E6686) mit sieben Use-Case-Chips und unten der Zeile „Nächster AKKI Hackathon: 2027 in Planung · Interesse? Schreiben Sie uns“ (mailto, Betreff „Hackathon 2027“, Texte in `usecases.json` → `folgeveranstaltung`, Betreff in `kontakt.json`). **Ab 29.11.2026** (`rueckblickAb`) zeigt die Karte „Rückblick: 27.–28.11.2026“ und die Zeile deutlicher. Die Zeile steht auch auf der Projekte-Seite unter dem Hackathon-Text (dort in Petrol).
4. „Aus dem KI Lab“: Zeile „Nächstes KI Lab …“ (mit „Danach: …“, siehe KI Lab) und die 3 jüngsten Termine; „Neue Publikationen“: 3 neueste.

**Footer** (alle Seiten, `layout.js`): zwei kompakte Zeilen, Links `#E6F5F1`, Pflichthinweis.

**Karten:** keine Kategorie-Schilder; **Namen von Referent:innen werden bei vergangenen Vorträgen nirgends angezeigt**; Status-Schilder (Laufend, Publiziert) bleiben.

**Personen (einheitlich, `personen.js`, nur auf „Wer wir sind“):** rundes Foto 140 px (`object-fit: cover`, `object-position: center 20 %`), Name fett, Funktion klein grau, LinkedIn-Symbol (rund, Petrol) nur bei vorhandenem Link; ohne Foto Initialen-Kreis (#E6F5F1, Schrift #00508A) in gleicher Größe; ohne Kasten, Hover leicht größer. Alt-Text „Foto von [Name]“, LinkedIn-`aria-label` „LinkedIn-Profil von [Name]“, Link mit `target="_blank" rel="noopener"`. **Jede Person mit Foto höchstens einmal, und zwar nur im Abschnitt „Team“ der Seite „Wer wir sind“. Überall sonst (Projektkarten, Schwerpunkte, Impressum) nur der Name als Text.** Fotos vorhanden: Osterhoff, Youssef, Braun, Breitwieser, Baur. Ohne Foto: Lindhorst, Gruener (stehen nur als Text). Es gibt noch keine LinkedIn-Links (Felder leer, Team trägt nach).

**Seiten im Einzelnen:**
- **Wer wir sind:** Kopf, Meilensteine (Zeitleiste mit Animation; Meilenstein „Dezember 2025 – Start des DGOU KI Lab“), **Team** (Osterhoff, Baur, Youssef, Braun, Breitwieser; Funktionen aus `personen.json`, Stand/Quelle darunter), Unsere Ziele (4 Kacheln), **nur das DGOU-Logo** (260 px, zentriert; der frühere Abschnitt „Einordnung in der DGOU“/Organigramm ist entfernt, die Daten stehen weiter in `organisation.json`), Satzung.
- **Projekte:** Forschungsprojekte (drei Karten mit „Ansprechpersonen: <Namen>“ als Textzeile), Thematische Schwerpunkte (Ansprechperson als Textzeile), Hackathon mit Hinweiszeile und **Use Cases**: 1–6 im 3er-Raster als Wendekarten (Rückseite „Projektidee“, **keine Repository-Links mehr**, Feld `repo` bleibt unsichtbar in den Daten), **Use Case 7 als breite Karte** über die volle Breite mit Schild „Freie Themenwahl“ (kein Text zur Projektidee, dreht sich nicht); Karten nur so hoch wie ihr Inhalt; Handy: alle untereinander. Danach Wissenstransfer, Kasten „Forschungsidee einbringen?“.
- **Publikationen:** 56 Einträge, chronologisch nach Jahr, Suche, Jahres- und Themenfilter, „Zitation kopieren“. **Der Titel ist ein Link** (DOI, sonst PubMed; 53 von 56 mit Link) und zusätzlich der „DOI“-Link.
- **KI Lab:** Rhythmus **jeden ersten Dienstag im Monat**, „seit Dezember 2025“ (erste Vorträge ab 03.12.2025). Das Ticket „Nächstes KI Lab“ zeigt den nächsten ersten Dienstag (heute 01.12.2026, Thema steht noch aus) und darunter **„Danach: <Datum> · online · <Titel>“** für den nächsten späteren Termin mit Titel in `beitraege.json` (so sind im Editor angelegte Termine sichtbar, Zeile 1,1 rem, fett). Liste „Bisherige Vorträge“ zeigt nur Termine vor heute. Uhrzeit nur, wenn bestätigt (aktuell nicht).
- **Mitmachen & Kontakt:** vier Karten, „Oder schreiben Sie uns: <Adresse>“, „Newsletter abonnieren“ (nur mailto, kein Formular), FAQ mit 2 Fragen.
- **Impressum / Datenschutz:** Betreiberin DGOU; keine Cookies, kein Tracking, keine externen Verbindungen; **Entwurf-Banner bleibt bis zur DGOU-Freigabe**.

**Kontakt:** zentrale Adresse `akki@dgou.de` (bei der DGOU noch einzurichten). Newsletter nur per mailto.

**Qualität (27./28.11.2026):** 8 Seiten bei 380 bis 1600 px ohne seitliches Überlaufen, eine `h1`, keine Platzhalter, Konsole ohne Fehler.

---

## 5. Inhalte und Quellen

Alle Texte und Fakten stehen in **`inhalte.md`**. Quellen: AG-Präsentation Halbjahrestreffen 08.06.2026, DGOU-Gremienberichte, Hackathon-Website, Publikationsliste der AG Digitalisierung (`daten/publikationen-ag.md`), Recherche des Teams.

**KI-Lab-Archiv** (`beitraege.json`): **erste Vorträge ab 03.12.2025 (Titel fehlen noch)** · 07.01.2026 n8n · 04.02. Microsoft Copilot: Features und DSGVO · 04.03. KI-Strategie · 07.04. Claude: Von Chatbot zu Cowork · 12.05. Claude Code · 07.07. Conus · 18.08. ChatGPT Work vs. Claude Cowork · 15.09. Gemini · 03.11. Vom Arzt zum Softwareentwickler. Juni und Oktober ohne Titel (ausgeblendet).

**Hackathon:** 27.–28.11.2026, BG Klinikum Unfallkrankenhaus Berlin (Kesselhaus), sieben Use Cases, Website `https://akki-hackathon-2026.vercel.app/`. Nächster Hackathon: 2027 in Planung (ohne Datum).

---

## 6. Nächste Schritte

1. **Push von `main`** (Team, GitHub Desktop → Branch `main` wählen → „Push origin“). Vercel baut danach automatisch neu (Production). `main` ist lokal mehrere Commits vor GitHub (u. a. Danach-Zeile, KI-Lab-Start Dezember 2025).
2. **Design-Stil entscheiden** (Abschnitt 10): Feinschliff aus `design-test` nach `main` übernehmen? Demo-Modus („Tron/Videospiel/Retro“) für die Live-Demo?
3. **Smart Editor** am 28.11. getestet (DOI-Import, Dublettenprüfung, Freigabe, Termin-Speichern; Ergebnis erscheint auf der Seite). **Noch offen:** KI-Entwurf mit Evidence Check (braucht API-Schlüssel in `.env` und Teamfreigabe der Regeln aus `KONZEPT.md`, Abschnitt 4; Knopf gesperrt, Kopf zeigt „Demonstration ohne KI-Anbindung“).
4. **Abgabe:** `ergebnis.md` und kurze Beschreibung in `README.md` (siehe `GITHUB_ANLEITUNG.md`, Schritt 5).
5. **Pitch** (15 Min.): Problem → Lösung → Live-Demo (Smart Editor auf `main`: DOI oder KI-Lab-Termin → Freigabe → Commit/Push → erscheint online) → Ausblick. Plan B: Bildschirmaufnahme.

---

## 7. Offene Punkte (Details in `inhalte.md` → „Offene Punkte – Gesamtliste“)

- **Testdaten im Branch `design-test`:** In `beitraege.json` steht dort ein Test-Termin „Wie bekomme ich mehr GTA in mein Leben?“ (05.01.2027). Vor jeder Übernahme nach `main` entfernen oder bewusst entscheiden.
- **KI Lab:** Titel der ersten Vorträge ab 03.12.2025; Uhrzeit (nicht bestätigt, wird nicht angezeigt); Teilnahmebedingungen („offen für alle“?); Themen Juni/Oktober; Referentin 15.09. (Anna Klempert oder Anna Völker?).
- **Personen:** Lindhorst (Vorname fehlt, Initiale „L“) und Gruener ohne Foto; keine LinkedIn-Links eingetragen; Titel und Schreibweisen bestätigen; Leitung des AKKI (Baur, Osterhoff) bestätigen; Leitungen der Arbeitskreise.
- **Use Case 7** „Lokale KI zur Gutachtenerstellung“: Projektidee fehlt (Repo `10-eigenes-projekt` ist nur eine leere Vorlage); danach `idee` in `usecases.json` eintragen.
- **Publikationen:** 3 Einträge ohne DOI-Link (Youssef 2024 „Joint and functional examinations …“, Tjardes 2020, Osterhoff 2020; Crossref-Angaben passen nicht zur Liste). Team kann Links bestätigen.
- **Kontrast:** Auf der Startseite meldet der Design-Prüfer im Kopfverlauf 1,1:1/1,2:1 (vermutlich falscher Alarm, helle Schrift steht nur auf dem dunklen Teil des Verlaufs, nicht nachgemessen). Das „Aktuell“-Etikett über der Hackathon-Überschrift bleibt (Text darf nicht gestrichen werden). Mint #78CBB9 auf dem Blau der Karte hat nur 3,2:1; mit #B8EDDF wären es 4,7:1 (in `design-test` umgesetzt, auf `main` nicht).
- **Datenschutz bei Vorträgen:** Der Name der Referent:in vom 03.11. steht noch im Feld `referent` in `beitraege.json` (wird nirgends angezeigt, im Quelltext lesbar). Entscheidung des Teams.
- `akki@dgou.de` bei der DGOU einrichten lassen.
- Rechtliches: Vereinsregisternummer (VR 3956 oder 3953), Speicherdauer E-Mail-Anfragen, Rechtsgrundlage, Aufsichtsbehörde, Logfile-Speicherdauer und Auftragsverarbeitung bei Vercel; Freigabe von Impressum und Datenschutz durch die DGOU.
- Entwürfe zur Teamfreigabe (`status: "entwurf"`): Kopfsatz, Ziele, Meilensteine, Leitungsangaben, Projekttexte, Use-Case-Kurzbeschreibungen, KI-Lab-Titel und -Beschreibungen, Mitmachen-Texte und FAQ.
- Logo-Freigabe durch die AG; API-Schlüssel für die KI-Funktionen.

---

## 8. Ausblick für den Pitch (nicht bis morgen bauen)

Echter Newsletter-Versand über DGOU-Verteiler (Double-Opt-in); **Wunsch des Teams (28.11.2026):** Wer auf „Anmelden“ bzw. „Newsletter abonnieren“ klickt, wird direkt in den monatlichen Newsletter aufgenommen (heute nur ein mailto-Link; dafür braucht es später einen Newsletter-Dienst der DGOU mit Anmeldung, Bestätigungs-E-Mail und angepasster Datenschutzerklärung) · Mediathek mit KI-Lab-Aufzeichnungen · AKKI AI Radar (automatisierte Literatursuche, Idee aus dem KI Lab zu n8n) · KI-Tool-Kompass · Plattform für alle Arbeitskreise der AG Digitalisierung mit gemeinsamem Designsystem und eigener Akzentfarbe je AK · Englische Version · eigene Domain unter der DGOU · Spaß-Modus mit umschaltbaren Stilen (Tron, Videospiel, Retro 98) für die Live-Demo.

---

## 9. Bearbeitungsbereich /admin (Sveltia CMS)

Texte, Termine, Projekte, Publikationen, Personen, Kontakt und Hackathon lassen sich in Eingabemasken mit deutschen Beschriftungen bearbeiten. Die Masken ändern direkt die JSON-Dateien in `public/daten/` (alle sieben Dateien, siehe `public/admin/config.yml`; die Felder zu `folgeveranstaltung` und `hackathon2027` sind enthalten). **Das Speichern über Sveltia selbst wurde noch nicht getestet** (die Ordnerauswahl braucht ein Systemfenster); der Passwortschutz und das Laden der Oberfläche sind geprüft.

**Einmal einrichten:** In der Datei `.env` (nur auf dem Rechner, nie auf GitHub) zwei Zeilen eintragen: `ADMIN_USER=` und `ADMIN_PASSWORT=` mit selbst gewählten Werten (Vorlage: `.env.example`). Ohne diese Zeilen ist `/admin` gesperrt (403). Danach den Server neu starten.

**Benutzen:** `http://localhost:3000/admin/` im **Chrome oder Edge** öffnen, Anmeldung, „Mit lokalem Repository arbeiten“, Projektordner `02-akki-website` auswählen, Bereich wählen, ändern, „Speichern“; Website mit Strg+F5 neu laden. Veröffentlichen: Commit und „Push origin“. **Fotos:** Datei in `public/bilder/personen/`, in der Maske „Personen“ im Feld „Foto“ nur den Dateinamen eintragen.

**Wichtig:**
- Der Passwortschutz gilt nur für `server.js` (lokal). Auf Vercel ist `/admin` eine statische Seite ohne Passwort; geschützt ist dann nur das Speichern (GitHub-Anmeldung mit Schreibrecht auf `antoniavo/02-akki-website`).
- Sveltia schreibt die JSON-Dateien beim Speichern neu und lässt leere Felder weg (statt `null`).
- Leitung und Ansprechpersonen werden über die **Kennung** (z. B. `osterhoff`) aus der Personenliste verknüpft: Kennungen nicht ändern.

---

## 10. Branches, Vercel, Design-Werkzeuge

**Branches:**
- **`main`** = Produktion. Vercel baut jeden Push von `main` als Production.
- **`design-test`** = Experimente (Preview-Deployments bei Vercel, nicht die Hauptadresse). Enthält zusätzlich zu `main`: (a) **Design-Feinschliff** in `style.css`/`kilab.css` (ruhigerer Buchstabenabstand, Zeilenlänge, Kontrast, Schrift ≥ 13 px, größere Klickflächen, Kartenstil mit kurzem Petrol-Akzent statt Farbbalken); (b) die **Stil-Vorschau** `public/stile/` (`umschalter.js`, `stil-d.css` bis `stil-j.css`, in `layout.js` per Zeile am Ende geladen): Leiste unten links (lokal immer, online nur mit `?stil=`) mit Aktuell · Hackathon · Kontrast · Tron · Roboter · Schrill · Retro 98 (Klick-Zähler nur im Tab, `sessionStorage`) · Videospiel (GTA-Look, Geld-Zähler); (c) den Test-Termin im KI Lab (Abschnitt 7).
- **Nicht blind `design-test` nach `main` mergen** (Demo-Stile, Test-Termin). Wenn gewünscht: nur den Feinschliff-Block in `style.css` übernehmen oder `layout.js` ohne die Zeile für die Stile.
- Änderungen an Inhalten/Funktion zuerst auf `main` machen, dann `main` in `design-test` mergen (bisher so gehandhabt).

**Vercel:** Team „AKKI“ (`akki-7149`), Projekt `akki-website`, **Hauptadresse https://akki-website-cyan.vercel.app**, Repo `antoniavo/02-akki-website` verbunden, Production-Branch `main`, Ausgabeordner `public`, Framework „Other“. Die Vercel-Kommandozeile ist installiert (`vercel` global, angemeldet als `antoniavo`). Nichts mit `vercel` von Hand hochladen, die Veröffentlichung läuft über GitHub. Keine Environment Variables. Ob dort etwas hinterlegt ist, lässt sich nur in der Vercel-Oberfläche prüfen (Settings → Environment Variables, sollte leer sein).

**Impeccable (Design-Skill):** installiert (`.claude/skills/`, `.claude/agents/`, `.claude/settings.local.json` stehen in `.gitignore`, nicht im Repo); `PRODUCT.md` per `/impeccable init` geschrieben. Die Installation hat Hooks eingetragen, die nach UI-Änderungen automatisch Design-Prüfungen laufen lassen (abschaltbar mit `/impeccable hooks off`). Prüfung per `.claude\skills\impeccable\scripts\impeccable.cmd detect --no-advisory http://localhost:3000/<seite>.html`.

**Stilfrage (Team):** „A Klar / B Weich / C Eckig“ wurden als zu ähnlich verworfen; interessant: Hackathon-Optik (dunkel, wie die Hackathon-Website), Tron, Roboter, Schrill, Retro 98, Videospiel. Meine Empfehlung: Hauptseite hell und seriös lassen, Spaß-Stile höchstens als umschaltbarer Demo-Modus.
