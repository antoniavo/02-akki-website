# PROJEKTSTAND – AKKI-Website (Übergabe nach Clear)

**Stand:** Fr 27.11.2026, nach **Block A** des Arbeitsauftrags · AKKI Hackathon 2026, Use Case 02 · Präsentation: Sa 28.11.2026

> **Arbeitsauftrag (maßgeblich für Inhalte und Design):** `ARBEITSAUFTRAG.md` wird blockweise abgearbeitet (Reihenfolge Abschnitt 0.4: A, B, C, D, E, F, G, H, I, J, K). Bei Widersprüchen gelten die Teamentscheidungen aus Abschnitt 0.5 dort.
> **Erledigt: Block A** (Design). **Nächster Block: B** (Datenstruktur: `projekte.json`, `publikationen.json`, `personen.json`, `usecases.json`; `beitraege.json` und `organisation.json` bestehen schon).
> **Abweichung von A1:** Buttons und Text-Akzente nutzen `--petrol-text` `#007A70` statt `#008F83`, weil Weiß auf `#008F83` nur 4,0:1 erreicht (Soll 4,5:1, A6). `#008F83` bleibt für Linien, Rahmen, Hover und die Unterstreichung der aktiven Navigation.

> **Neue Sitzung:** Vor dem Arbeiten `git log` ansehen und die Liste in Abschnitt 7 gegen den echten Stand prüfen. Diese Datei kann hinter dem Repo zurückliegen.

> **Für Claude Code nach einem Clear:** Lies zuerst diese Datei, dann `CLAUDE.md` (Regeln der Orga), `inhalte.md` (alle Inhalte und Designvorgaben) und `KONZEPT.md` (Smart Editor). Diese Datei fasst zusammen, was entschieden, gebaut und offen ist.

---

## 1. Worum es geht

Website des **Arbeitskreises Künstliche Intelligenz (AKKI)** der **AG Digitalisierung der DGOU**.
Leitidee **„The Living Website“**: Die Seite pflegt sich mithilfe von KI weitgehend selbst. Der **Smart Editor** erzeugt Entwürfe (Publikation per DOI, KI-Lab-Termin, Newsletter), eine Ärztin oder ein Arzt gibt frei, danach erscheint der Inhalt auf der Website.

**Team:** Anna Klempert, Antonia von Helden (Website und Inhalte), drittes Teammitglied · Ansprechpartner vor Ort: David Baur (AG-Leitung).

---

## 2. Arbeitsregeln (wichtig!)

- **Einziger Arbeitsordner:** `C:\Users\claud\Documents\GitHub\02-akki-website` (mit GitHub verknüpft).
  Der alte Ordner `Desktop\02-akki-website-main` (bzw. `ALT-nicht-benutzen`) wird **nicht** mehr verwendet.
- **GitHub:** Fork in Antonias Account `antoniavo/02-akki-website` (öffentlich). Vorlage der Orga: `akkidgou-opensource/02-akki-website`.
- **Nach jeder Änderung:** speichern (Commit) und hochladen (Push), entweder durch Claude Code oder in GitHub Desktop.
- **`inhalte.md` bearbeitet nur Claude Code.** Das Team liefert Texte per Prompt (sonst überschreiben sich Fassungen gegenseitig).
- **Alles in `public/` ist öffentlich**, ebenso das GitHub-Repo. Keine internen oder unveröffentlichten Inhalte dort ablegen (z. B. Promotionsprojekte, Teams-Links, Schlüssel).
- **API-Schlüssel** nur in `.env` (steht in `.gitignore`), nie im Chat, nie auf GitHub.
- **Nichts erfinden.** Unbestätigte Angaben weglassen oder intern als offen führen; auf der öffentlichen Seite keine sichtbaren „Text folgt“-Platzhalter mehr.
- **Schreibregel:** kurze, ansprechende Texte, pro Abschnitt höchstens 2 Sätze oder Stichpunkte.
- Pflichthinweis der Orga bleibt während des Hackathons sichtbar: „Prototyp – nur Testdaten. Kein Ersatz für ärztliche Beurteilung.“

**Stolpersteine bei der Arbeit mit Claude Code (Windows):**

- **Git** ist nicht im PATH. Es liegt nur in GitHub Desktop: `%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`.
- **Hochladen (Push) kann Claude Code nicht**, weil GitHub eine Anmeldung verlangt. Es muss in GitHub Desktop auf „Push origin“ geklickt werden. Speichern (Commit) macht Claude Code selbst und ohne Rückfrage.
- **Vorschau-Knopf der App** startet leicht die alte Kopie im Desktop-Ordner. Den Server deshalb im richtigen Ordner selbst starten: `node --env-file-if-exists=.env server.js` (Adresse `http://localhost:3000`).
- **Seiten per Doppelklick öffnen** zeigt Kontaktadresse und Organigramm nicht (Browser lädt Datendateien nicht von der Festplatte). Immer über `http://localhost:3000` ansehen.
- **API-Schlüssel** liegt nur lokal in `.env`. Ohne Schlüssel bleibt im Smart Editor das Feld „Einführung“ zum selbst Schreiben.

---

## 3. Technik

| Teil | Datei / Ort |
|---|---|
| Seiten | `public/index.html`, `wer-wir-sind.html`, `projekte.html`, `publikationen.html`, `treffen.html` (KI Lab), `mitmachen.html`, `impressum.html`, `datenschutz.html` |
| Design | `public/style.css`: alle Farben, Abstände (8/16/24/40/64), Schriften und Komponenten als Variablen und Klassen; Schriften lokal in `public/fonts`. Alte Variablennamen (`--haupt`, `--akzent`, `--kachel` …) bleiben als Alias für den Smart Editor |
| Gemeinsame Seitenteile | `public/layout.js`: **Navigation und Footer stehen nur hier** (Menüpunkte in der Liste `SEITEN`, aktiver Punkt automatisch, Skip-Link, Handy-Menü). Jede Seite hat nur die Platzhalter `<div id="seitenkopf" class="kopf-fix">` (mit dem Pflicht-Hinweis, der auch ohne JavaScript sichtbar bleibt) und `<div id="seitenfuss">` |
| Weitere Skripte | `public/kontakt.js` (zentrale Adresse einsetzen, mailto-Knöpfe), `public/beitraege.js` (Aktuelles, KI-Lab-Termine, Archiv, Suche, Filter, .ics) |
| Daten | `public/daten/beitraege.json` (Aktuelles und KI-Lab-Termine, zentrale Quelle), `organisation.json` (Organigramm), `kontakt.json` (zentrale E-Mail-Adresse) |
| Logo | `public/logo/logo-animiert.js` (lebendes Logo), `logo-nav.svg` (statische Wortmarke in der Navigation), `logo-hell.svg` (Browser-Icon), `logo-dunkel.svg`, `logo-vorschau.html` |
| Smart Editor | `redaktion/redaktion.html`, **nur lokal** über `server.js` (`http://localhost:3000/redaktion`), nicht öffentlich |
| Server lokal | `node server.js` (mit KI später: `node --env-file=.env server.js`) |
| Hosting | Vercel, `vercel.json` (Ausgabeordner `public`, kein Build). Suchmaschinen vorerst gesperrt (`noindex`) |

---

## 4. Getroffene Entscheidungen

**Logo:** „Lebendes Logo“ – Schriftzug AKKI aus geraden, feinen Punktbahnen (5 versetzte Bahnen pro Strich, keine überlagerten Punkte), stilles Gerüst, Lichtimpulse mit Schweif laufen die Striche entlang, unter der Maus leuchten Knoten auf und starten neue Impulse. Darunter klein: „Arbeitskreis Künstliche Intelligenz“ / „AG Digitalisierung · DGOU“. Bei „Bewegung reduzieren“ steht es still.

**Farbpalette D** (zentral in `style.css`, Namen wie in `ARBEITSAUFTRAG.md` A1):

| Token | Wert | Verwendung |
|---|---|---|
| `--blau` | `#00508A` | Überschriften, Links |
| `--petrol` | `#008F83` | Linien, Rahmen, Hover, aktive Navigation (Unterstreichung); nicht als kleine Textfarbe |
| `--petrol-text` | `#007A70` | Buttons (weiße Schrift 5,2:1) und Text-Akzente; Hover `--petrol-dunkel` `#00655D` |
| `--mint` | `#78CBB9` | Logo, kleine Akzente, Badges (mit dunkler Schrift) |
| `--mint-hell` | `#E6F5F1` | sparsam: höchstens ein hervorgehobener Bereich pro Seite |
| `--weiss` / `--hell` | `#FFFFFF` / `#F5F8FA` | Seiten- und Kartenhintergrund / abwechselnde Abschnitte, Seitenköpfe |
| `--navy` | `#002B45` | nur Logo-Kachel und Footer |
| `--text` / `--text-2` | `#2B3A45` / `#4A5560` | Fließtext / Nebentext |
| `--rahmen` | `#DCE5EC` | Kartenrahmen, Trennlinien |

Status-Badges (`.badge--idee`, `--planung`, `--laufend`, `--abgeschlossen`, `--publiziert`) haben eigene Variablen in `style.css`. Alle Texte erreichen mindestens 4,5:1 (zuletzt gemessen: 5,2:1).

**Designentscheidung (Team, 14:41): weniger Dunkelblau, helle luftige Seite.** Umgesetzt in Block A: Navigation und Seitenköpfe der Unterseiten sind hell; Dunkelblau nur noch für Footer und Logo-Kachel. Der Startseiten-Kopf (noch dunkel über die ganze Breite) wird in Block C hell mit Logo-Kachel neu gebaut.

**Seitenstruktur:** Start · Wer wir sind · Projekte · Publikationen · KI Lab · Mitmachen & Kontakt (Dateiname `treffen.html` bzw. `mitmachen.html` bleibt) · Fußzeile mit Impressum und Datenschutz. Zugehörigkeit sichtbar: „DGOU › AG Digitalisierung › AKKI“ mit Links zu dgou.de und digitalisierung-dgou.de. Partner-Arbeitskreis: AK Medien und digitale Systeme.

**Rechtliches:** DGOU darf als Betreiberin genannt werden (bestätigt). Inhaltlich verantwortlich (§ 18 Abs. 2 MStV): Prof. Dr. Benedikt Braun und Dr. David Baur, c/o DGOU. Datenschutzbeauftragter: DGOU, datenschutz@dgou.de. Vercel als Hoster freigegeben. Kein Link zur EU-Streitschlichtungsplattform (eingestellt).

**Kontakt:** zentrale Adresse `akki@dgou.de` (bei der DGOU noch zu beantragen, bis dahin nicht zustellbar). Newsletter-Anmeldung nur per mailto, keine Formulare und keine Datenspeicherung auf der Website.

---

## 5. Was fertig ist

**Block A (Design), lokal gespeichert:**

- Neue Tokens in `style.css` (Palette, Abstände, Radius, Raster 1200 px, Zeilenlänge 70 ch, `clamp()`-Schriftgrößen)
- Helle, sticky Navigation mit Wortmarke (`logo-nav.svg`), Punkte-AKKI in Blau mit mintfarbenem Punkt, daneben „AG Digitalisierung · DGOU“ (verlinkt auf die beiden Seiten); aktiver Punkt Petrol und unterstrichen; Handy-Menü mit Escape-Taste
- Navigation und Footer nur noch in `layout.js`; `menu.js` entfernt
- Seitenköpfe der Unterseiten hell und kompakt
- Wiederverwendbare Komponenten (CSS fertig, Inhalte kommen mit den Blöcken C bis H): Buttons primär/sekundär, Projektkarte mit Status-Badge, Publikationseintrag (Listenzeile), Veranstaltungskarte mit Datumsblock, Personenkarte mit Initialen-Kreis, Linien-Icons
- Barrierefreiheit: sichtbarer Fokus, Skip-Link, `prefers-reduced-motion`, Klickflächen mindestens 24 px
- Fehler behoben: Das Handy-Menü war gelb gestrichelt, weil seine Klasse `offen` mit der alten „[OFFEN]“-Markierung kollidierte (jetzt `nav__links--offen`)

**Davor fertig (laut GitHub):**

- Startseite überarbeitet: Headline, Buttons „KI Lab entdecken“ / „Mitmachen“, Schwerpunkte mit Icons, Aktuelles, „Aus dem KI Lab“, Mitmachen-Kasten; Termine aus `beitraege.json`
- Unterseiten angelegt, Organigramm aus `organisation.json`, Partner-AK mit Ansprechpartnern (PD Dr. Lindhorst, doc. Dr. Stephan Gruener)
- Farbpalette D inkl. lebendem Logo und SVG-Logos
- Impressum und Datenschutz mit DGOU-Angaben, Vercel und Datenschutzbeauftragtem
- Schriften lokal, Suchmaschinensperre, Vercel-Konfiguration
- Smart Editor (lokal) mit Reitern Publikation (DOI über Crossref), Veranstaltung, Newsletter; noch ohne KI
- KI-Lab-Seite (`treffen.html`, Menüpunkt „KI Lab“): Einführung, „Nächster Termin“ automatisch (erster Dienstag im Monat, 18–19 Uhr) mit Kalenderdatei (.ics) und Newsletter-Button, Archiv als Karten (neueste zuerst) mit Suche und Kategorie-Filter, Kasten „Selbst ein Thema vorstellen?“; Daten und Kategorien (KI-Tools, Automatisierung, Strategie, Praxisbericht) in `beitraege.json`; kein Teams-Link auf der Seite; Referentin am 15.09. bleibt weggelassen, bis der Name bestätigt ist

---

## 6. Inhalte und Quellen

Alle Texte und Fakten stehen in **`inhalte.md`**. Wichtigste Quellen: AG-Präsentation Halbjahrestreffen 08.06.2026, DGOU-Gremienberichte 2025/2026, Hackathon-Website, Recherche des Teams.

**KI-Lab-Archiv 2026** (in `beitraege.json`): 07.01. n8n · 04.02. Microsoft Copilot · 04.03. KI-Strategie in der Medizin · 07.04. Claude – von Chatbot zu Cowork · 12.05. Claude Code · 07.07. Conus – klinische LLMs · 18.08. ChatGPT Work vs. Claude Cowork · 15.09. Gemini – ein Praxisbericht · 03.11. Vom Arzt zum Softwareentwickler (Philipp Michel). Format: erster Dienstag im Monat, 18–19 Uhr, online über Teams, kostenlos, offen für alle. Teams-Link **nie** öffentlich.

**Projekte:** Schwerpunkte Leitliniensupport, KI-Zugang in O&U, Clinical Decision Support; Projekte Wunddokumentation (laufend), Arztbriefe (publiziert, PubMed 41436785), Sprachmodelle bei Kreuzbandruptur (publiziert, PubMed 41253635); Transfer: KI Lab, Hackathon, Open Source (github.com/akkidgou-opensource). PubMed-Links vor Veröffentlichung prüfen. Promotionsprojekte **nicht** ins Repo.

---

## 7. Nächste Schritte (Reihenfolge)

1. **`ARBEITSAUFTRAG.md` blockweise abarbeiten** (vor jedem Block `git status`, nach jedem Block speichern und kurz berichten; Push macht das Team):
   - ~~A Seitenübergreifendes Design~~ **erledigt**
   - **B** Datenstruktur · **C** Startseite (hell, Hero mit Logo-Kachel, Headline „Künstliche Intelligenz trifft medizinische Expertise.“) · **D** Wer wir sind · **E** Projekte inkl. Hackathon · **F** Publikationen · **G** KI-Lab-Korrekturen · **H** Mitmachen & Kontakt · **I** Footer, Impressum, Datenschutz · **J** Qualitätskontrolle · **K** Smart Editor
   - Damit sind die früheren Einzelaufträge „Design aufhellen“ und „Projektseite“ ersetzt (Wortlaut steht in der Git-Historie). Die KI-Lab-Seite wird in Block G korrigiert (nur bestätigte Termine, kein fester Rhythmus, „seit Dezember 2025“).
   - Auf der öffentlichen Seite entfernt der Auftrag (0.2) alle „Text folgt“-, „wird bestätigt“- und `[OFFEN]`-Platzhalter. Impressum und Datenschutz bleiben bis zur Freigabe als Entwurf.
2. ~~KI-Lab-Seite fertigstellen~~ **Erledigt** (siehe Abschnitt 5)
3. **Vercel-Veröffentlichung** (Antonia): vercel.com → mit GitHub anmelden → Projekt `02-akki-website` importieren → Framework „Other“, kein Build, Output `public` → Deploy. Live-URL notieren.
4. **Smart Editor mit KI** (= Block K, erst wenn A bis J stehen), sobald ein API-Schlüssel vorliegt (Regeln für KI-Entwürfe in `KONZEPT.md` Abschnitt 4 vorher vom Team freigeben lassen). Evidence Check: Studientyp, Anwendungsbereich, externe Validierung, klinische Einsatzreife, Limitationen.
5. **Qualitätsprüfung** (= Block J): tote Links, Seitentitel, Handy-Ansicht (380 px), Kontraste, Rechtschreibung
6. **Fotos vom Team** (mit Einverständnis); bis dahin keine Bildplätze anzeigen (Auftrag A5)
7. **Abgabe:** `ergebnis.md` und kurze Beschreibung in `README.md` (siehe `GITHUB_ANLEITUNG.md`, Schritt 5)
8. **Pitch** (15 Min.): Problem → Lösung → Live-Demo (Smart Editor: DOI oder KI-Lab-Einladung → Entwurf → Freigabe → erscheint auf der Seite) → Ausblick. Plan B: Bildschirmaufnahme der Demo.

---

## 8. Offene Punkte zur Bestätigung (David, Yasmin, Orga)

- Leitungen der Arbeitskreise; gibt es AK Weißbuch, AK S3-Leitlinie und die Kompetenzbereiche noch?
- Referentin KI Lab 15.09.2026 (Anna Klempert oder Anna Völker?), Start des KI Labs (Dez. 2025 oder Jan. 2026), Ablauf (20/20/20 oder 30/15/45 Minuten), Themen Juni und Oktober
- Titel und Schreibweisen: Braun, Baur, Osterhoff, Lindhorst, Gruener; Einverständnis zur Nennung
- `akki@dgou.de` bei der DGOU einrichten lassen
- Datenschutz: Speicherdauer bei E-Mail-Kontakt, zuständige Aufsichtsbehörde
- API-Schlüssel für die KI-Funktionen
- Logo-Freigabe durch die AG; ob die drei Schwerpunkte so offiziell sind

---

## 9. Ausblick für den Pitch (nicht bis morgen bauen)

Echter Newsletter-Versand über DGOU-Verteiler (Double-Opt-in) · Mediathek mit KI-Lab-Aufzeichnungen · AKKI AI Radar (automatisierte Literatursuche, Idee aus dem KI Lab zu n8n) · KI-Tool-Kompass · Plattform für alle Arbeitskreise der AG Digitalisierung mit gemeinsamem Designsystem und eigener Akzentfarbe je AK · Englische Version · eigene Domain unter der DGOU.
