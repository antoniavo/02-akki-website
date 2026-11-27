# PROJEKTSTAND – AKKI-Website (Übergabe nach Clear)

**Stand:** Fr 27.11.2026, abends · AKKI Hackathon 2026, Use Case 02 · Präsentation: Sa 28.11.2026

> **Für Claude Code nach einem Clear:** Lies zuerst diese Datei, dann `CLAUDE.md` (Regeln der Orga), `inhalte.md` (Inhalte, Designvorgaben, **„Offene Punkte – Gesamtliste“**) und `KONZEPT.md` (Smart Editor). Vor dem Arbeiten `git log` und `git status` ansehen; diese Datei kann hinter dem Repo zurückliegen. Die Historie der einzelnen Änderungen steht in der Git-Historie, hier steht nur der **gültige Stand**.
>
> **Kurzfassung:** Alle Seiten stehen (Blöcke A bis J des `ARBEITSAUFTRAG.md` erledigt, Block C bewusst anders gelöst). **Block K (Smart Editor) ist teilweise fertig (Schritt 1 und 2, siehe Abschnitt 6)**; offen: KI-Entwurf, der Push zu GitHub (macht das Team) und die Vercel-Veröffentlichung. Alles Folgende ist lokal committet; ob schon gepusht ist, zeigt `git status` („ahead of origin“).

---

## 1. Worum es geht

Website des **Arbeitskreises Künstliche Intelligenz (AKKI)** der **AG Digitalisierung der DGOU**.
Leitidee **„The Living Website“**: Die Seite pflegt sich mithilfe von KI weitgehend selbst. Der **Smart Editor** erzeugt Entwürfe (Publikation per DOI, KI-Lab-Termin, Newsletter), eine Ärztin oder ein Arzt gibt frei, danach erscheint der Inhalt auf der Website.

**Team:** Anna Klempert, Antonia von Helden (Website und Inhalte), drittes Teammitglied · Ansprechpartner vor Ort: David Baur (AG-Leitung).

---

## 2. Arbeitsregeln (wichtig!)

- **Einziger Arbeitsordner:** `C:\Users\claud\Documents\GitHub\02-akki-website` (mit GitHub verknüpft). Der alte Ordner `Desktop\02-akki-website-main` (bzw. `ALT-nicht-benutzen`) wird **nicht** mehr verwendet.
- **GitHub:** Fork in Antonias Account `antoniavo/02-akki-website` (öffentlich). Vorlage der Orga: `akkidgou-opensource/02-akki-website`.
- **Speichern (Commit) macht Claude Code selbst und ohne Rückfrage, Hochladen (Push) nur das Team** in GitHub Desktop („Push origin“), weil GitHub eine Anmeldung verlangt.
- **`inhalte.md` bearbeitet nur Claude Code.** Das Team liefert Texte per Prompt.
- **Alles in `public/` ist öffentlich**, ebenso das GitHub-Repo. Keine internen Inhalte dort ablegen (Promotionsprojekte, Teams-Links, Schlüssel).
- **API-Schlüssel** nur in `.env` (steht in `.gitignore`), nie im Chat, nie auf GitHub.
- **Nichts erfinden.** Unbestätigte Angaben weglassen oder in `inhalte.md` als offen führen; keine sichtbaren „Text folgt“-Platzhalter. Medizinische Inhalte nicht eigenmächtig ändern (`CLAUDE.md`).
- **Schreibregel:** kurze Texte, pro Abschnitt höchstens 2 Sätze oder Stichpunkte. Die **Startseite hat bewusst fast keinen Text** (keine Slogans, keine Begrüßung).
- Pflichthinweis der Orga bleibt sichtbar (Kopf und Footer jeder Seite): „Prototyp – nur Testdaten. Kein Ersatz für ärztliche Beurteilung.“

**Stolpersteine (Windows):**

- **Git** ist nicht im PATH. Es liegt in GitHub Desktop: `%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`. `git push` geht dort nicht (Anmeldung).
- **Server starten** (immer im richtigen Ordner): `node --env-file-if-exists=.env server.js`, Adresse `http://localhost:3000`. Läuft er nicht, „gehen die Seiten nicht“. Port belegt? `Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`. Der Vorschau-Knopf der App kann die alte Kopie im Desktop-Ordner starten; Vorschau über `.claude/launch.json` (`akki-website`) startet den richtigen Ordner.
- **Seiten per Doppelklick öffnen** zeigt Daten (Kontakt, Organigramm, Termine, Publikationen) nicht. Immer über `http://localhost:3000` ansehen.
- Nach Änderungen im Browser **Strg+F5** (alter Zwischenspeicher).
- `style.css` hat Windows-Zeilenenden (CRLF), andere Dateien LF; beim Ersetzen von Text zeilenweise arbeiten.

---

## 3. Technik

Node.js, keine Zusatzpakete, kein Build. `server.js` liefert `public/` aus (nur lokal; auf Vercel liegt `public/` statisch).

| Teil | Datei / Ort |
|---|---|
| Seiten | `public/index.html`, `wer-wir-sind.html`, `projekte.html`, `publikationen.html`, `treffen.html` (KI Lab), `mitmachen.html`, `impressum.html`, `datenschutz.html` |
| Design | `public/style.css`: Farben, Abstände (8/16/24/40/64), Komponenten; Schriften Archivo und Manrope lokal in `public/fonts` (keine Verbindung zu Dritten) |
| Gemeinsame Teile | `public/layout.js`: **Navigation und Footer stehen nur hier** (Menüpunkte in `SEITEN`). Jede Seite hat nur die Platzhalter `<div id="seitenkopf" class="kopf-fix">` (mit Pflichthinweis) und `<div id="seitenfuss">` |
| Skripte | `kontakt.js` (Adresse und Betreffzeilen aus `kontakt.json`, `data-kontakt-email`, `data-kontakt-betreff`), `beitraege.js` (KI-Lab-Karten, Archiv, nächster bestätigter Termin, .ics), `startseite.js` (Hackathon-Karte, neue Publikationen, Drehtempo des Buttons), `terminal.js` (Mitmach-Terminal), `logo/logo-animiert.js` (lebendes Logo) |
| Daten | `public/daten/`: `beitraege.json` (KI-Lab-Termine, Kategorien, `bestaetigt`), `projekte.json`, `publikationen.json` (56 Einträge), `personen.json`, `organisation.json` (Wer wir sind), `usecases.json` (Hackathon, **7 Use Cases**), `kontakt.json` (`akki@dgou.de`, Betreffzeilen) |
| Quelldaten | `daten/publikationen-ag.md` (Teamliste, Quelle der Publikationen), `daten/hackathon-website` und `daten/QUELLEN.md` (Referenz der Orga-Seite) |
| Logos | `public/logo/`: `logo-animiert.js`, `logo-nav.svg`, `logo-nav-hell.svg` (Footer), `logo-hell.svg` (Browser-Icon), `logo-dunkel.svg`, `logo-vorschau.html` |
| Smart Editor | `redaktion/redaktion.html`, **nur lokal** über `server.js` (`http://localhost:3000/redaktion`), nicht öffentlich; Schnittstellen `/api/quelle`, `/api/publikation-speichern`, `/api/termin-speichern` |
| Hosting | Vercel, `vercel.json` (Ausgabeordner `public`, kein Build). Suchmaschinen vorerst gesperrt (`noindex`, Header und Meta) |

Alle Texte aus den Daten werden als reiner Text eingefügt; leere Felder (`null`) werden nicht angezeigt. Datensätze haben `quelle`, `stand`, `status` (`bestaetigt` | `entwurf`).

---

## 4. Gültige Entscheidungen (Design und Aufbau)

**Farben** (Tokens in `style.css`): `--blau #00508A` (Überschriften, Links) · `--petrol #008F83` (Linien, Hover, aktive Navigation) · `--petrol-text #007A70` (Buttons mit weißer Schrift, 5,2:1) · `--mint #78CBB9` · `--mint-hell #E6F5F1` (sparsam) · `--navy #2C4F6B` (**weiches Schieferblau**, nur Kopffläche, Footer, Terminal; früher `#002B45`) · Logo-Mint `#8FDCCB` · `--text #2B3A45` · `--text-2 #4A5560`. Alle Texte mindestens 4,5:1. `ARBEITSAUFTRAG.md` nennt teils noch alte Werte, es gilt dieser Stand.

**Navigation:** nur die Menüpunkte (Start · Wer wir sind · Projekte · Publikationen · KI Lab · Mitmachen & Kontakt), kein Logo, keine DGOU-Links. Bis 760 px in einer Zeile, darunter beschrifteter Knopf „☰ Menü“.

**Startseite** (Block C **nicht** wie im Auftrag hell umgesetzt; Team will den dunklen Kopf mit dem lebenden Logo, helle Fassung wurde verworfen):
1. Blaue Kopffläche über die ganze Breite: lebendes Logo groß (ca. 70 % der Inhaltsbreite, max. 900 px, Handy bis 600 px: 90 %; Kopffläche wächst mit; der ganze Kopfbereich ist auf ca. 70 % der Bildschirmhöhe begrenzt: zuerst weniger Leerraum über dem Logo, erst dann wird das Logo kleiner, damit die Einstiegskarten beim Aufrufen oben sichtbar sind). Punkte `#8FDCCB`, Lichtimpuls = Kette aus 5 Punkten (Weiß bis Mint), die überquerte Punkte aufleuchten lässt; bei „Bewegung reduzieren“ keine Impulse. Untertitel „Arbeitskreis Künstliche Intelligenz“ / „AG Digitalisierung · DGOU“ als **HTML-Text** zentriert unter dem Logo (`data-untertitel="aus"` am Canvas), „AG Digitalisierung“ und „DGOU“ sind Links (Mint, Hover weiß, neuer Tab). Die `h1` ist nur für Screenreader sichtbar.
2. **Runder Mitmachen-Button** rechts in der Zeile unter dem Logo (116 px, Handy 96 px, `#007F75`, innen drehender Textring „MITMACHEN · MITDENKEN · MITBAUEN ·“, Pfeil, Hover `#008F83` + Skalierung, Mint-Puls; bei „Bewegung reduzieren“ still). Daran hängt das **Mitmach-Terminal** (`terminal.js`) als Pop-up: Maus (Überfahren, bleibt offen, schließt 400 ms nach dem Verlassen), Tastatur (öffnet bei Tab, Escape schließt und setzt den Fokus zurück), Touch (Antippen öffnet/schließt, „×“); Klick/Enter führt zu `mitmachen.html`; ohne JavaScript normaler Link. Es gibt nur dieses eine Pop-up. 
3. Drei klickbare Einstiege (KI Lab, Forschung, Publikationen; „Mitwirken“ entfällt, der runde Button führt dorthin), gleichmäßig auf die volle Breite verteilt; die Unterzeilen sind automatisch: „Nächster Termin: Di, 1. Dez.“ (nächster erster Dienstag), „3 Projekte · 7 Hackathon-Use-Cases“ (aus `projekte.json`, `usecases.json`), „56 Publikationen · neu: <Titel der neuesten, gekürzt>“ (aus `publikationen.json`); der feste Text in `index.html` ist nur der Ersatz ohne JavaScript, die den Kopf überlappen; flache Kacheln (ca. 90 px): Icon links, Titel und Unterzeile daneben, Pfeil rechts; Handy untereinander.
4. Hackathon-Karte (aus `usecases.json`: Titel, Termin, Ort, Website-Button, **sieben** Use Cases als Chips).
5. „Aus dem KI Lab“: 3 jüngste Termine mit Datumsblock. 6. „Neue Publikationen“: 3 neueste.

**Footer** (alle Seiten, `layout.js`): zwei kompakte Zeilen (Handy gestapelt), 14/13 px. Zeile 1: Wortmarke + „Arbeitskreis Künstliche Intelligenz der AG Digitalisierung der DGOU“ (zwei Links), rechts „KI Lab · Projekte · Publikationen · Kontakt · GitHub“. Zeile 2: „Partner: AK Medien und digitale Systeme · akki@dgou.de · Impressum · Datenschutz“ und Pflichthinweis. Links `#E6F5F1`, Unterstreichung nur bei Hover/Fokus.

**Karten:** **Keine Kategorie-Schilder** auf Veranstaltungs- und Projektkarten (Kategorien und Themen bleiben in den Daten für die Filter). Referent:in nur als eigene gedämpfte Zeile unter dem Titel, nur wenn eingetragen/bestätigt. Status-Schilder (Laufend, Publiziert) bleiben.

**Seiten im Einzelnen:**
- **Wer wir sind** (aus `organisation.json`, `personen.json`), Reihenfolge: Kopf mit einem Satz (kein Selbstverständnis-Absatz mehr), Meilensteine (Zeitleiste mit dezenter Animation, `zeitleiste.js`: Lichtimpuls läuft in ca. 3 s über die Linie, Kreise leuchten auf und bleiben petrolfarben gefüllt, letzter Kreis pulsiert sanft; höchstens dreimal im Abstand von 12 s; bei „Bewegung reduzieren“ nur gefüllte Kreise), Leitung und Ansprechpersonen inkl. Leitung der AG (Stand-/Quellenzeilen klein, 13 px, grau), Unsere Ziele als vier Kacheln mit Icon, Einordnung in der DGOU (Organigramm; AKKI-Box mit Schild „Sie sind hier“, Schwerpunkten und Leitung, beide Kind-Boxen gleich hoch), Satzung (ein Satz + Link).
- **Projekte** (Reihenfolge): Forschungsprojekte (Filterleiste Thema/Status ausgeblendet, technisch vorhanden: `hidden` am Filterbereich entfernen), Thematische Schwerpunkte (drei flache Kacheln, eine Ansprechperson einmal darunter aus `schwerpunkteAnsprechpersonen`), Hackathon (`#hackathon`) mit 7 Use Cases (Nr. 7 „Lokale KI zur Gutachtenerstellung“, Kennzeichnung „Freie Themenwahl“), danach Wissenstransfer, Kasten „Forschungsidee einbringen?“.
- **Publikationen** (aus `publikationen.json`, 56 Einträge der Teamliste, Titel und Autor:innen unverändert): rein chronologisch, nach Jahr gruppiert (neueste zuerst), keine Sonderstellung der AKKI-Publikationen, Suche, Jahresfilter, Themenfilter (**KI zuerst**), „Zitation kopieren“, DOI-Link (53 von 56 per Crossref, nur bei eindeutiger Übereinstimmung von Titel, Jahr und Erstautor). Kennzeichen „AKKI-Publikation“ / „AG-Publikation“ nur als dezenter Text. Themen und Kennzeichen automatisch nach Stichworten vergeben (Stichprobe nötig).
- **KI Lab:** Rhythmus **jeden ersten Dienstag im Monat** (Team, 27.11.2026). „Das nächste KI Lab“ (KI-Lab-Seite, Zeile auf der Startseite, Newsletter-Reiter im Smart Editor) wird **automatisch** als nächster erster Dienstag berechnet (heute zählt mit, danach springt es auf den nächsten Monat). Thema und Referent:in nur, wenn in `beitraege.json` für genau diesen Tag ein Eintrag mit Titel steht, sonst „Thema wird bekannt gegeben“. **Uhrzeit nur, wenn bestätigt** (Eintrag `beginn`/`ende` oder `regeltermin` in `beitraege.json`, aktuell leer, also keine Uhrzeit; `.ics` dann ganztägig). Seite radikal vereinfacht, alles hell, vier Teile (`treffen.html`, Styles `kilab.css`): (1) weißer kompakter Kopf „DGOU KI LAB · SEIT JANUAR 2026“, „KI kennenlernen. Erfahrungen teilen.“, Online · Jeden ersten Dienstag im Monat · Kostenlos; (2) Termin-Ticket (Datumsblock #2C4F6B, „Nächstes KI Lab · Dienstag, online“, Thema/Referent:in oder „Das Thema steht noch aus. Haben Sie eine Idee?“ als Link, ein Button „In den Kalender“); (3) ruhige Liste „Bisherige Vorträge“, eine Zeile pro Vortrag, neueste zuerst (Datum in Monospace/Petrol, Titel fett blau, „· Referent:in“ grau, Pfeil), feine Trennlinien, keine Kästen, keine Hervorhebung; die ganze Zeile ist ein Knopf (Tastatur), die Beschreibung klappt sanft auf, nur eine Zeile gleichzeitig offen, auf dem Handy steht das Datum über dem Titel; (4) Abschlusszeile „Bühne frei für Ihre KI-Idee.“ mit Button und Link „Informiert bleiben“. Entfernt: Zuletzt-Block, Themenkacheln/Filter, Suche, „Wie läuft ein KI Lab ab?“, Illustrationen (die SVGs in `public/bilder/` liegen ungenutzt, die Daten sind unverändert). Texte: „seit Januar 2026“, „in der Regel einmal im Monat, abends“, „online über Microsoft Teams“, „Kostenlos“ (kein fester Rhythmus, kein 20/20/20-Ablauf, kein „offen für alle“). Teams-Link **nie** öffentlich.
- **Mitmachen & Kontakt** (stark vereinfacht): Kopf „Mitmachen“ / „Wie möchten Sie dabei sein?“, vier kompakte Karten (ganze Karte ist der Link, Handy 2×2): KI Lab besuchen → `treffen.html`, Thema vorstellen und Mitforschen → mailto (Betreffzeilen aus `kontakt.json`: `themenvorschlag`, `forschung`), Mitbauen → GitHub; darunter „Oder schreiben Sie uns: <Adresse aus `kontakt.json`>“ und „Newsletter abonnieren“; ein Satz zur AG Digitalisierung; FAQ mit 2 Fragen. Entfernt: Einleitung, Buttons, Terminal-Block (das Terminal hängt nur noch am runden Button der Startseite), Betreff-Auswahl. **Kein Formular**, nur mailto-Links.
- **Impressum / Datenschutz:** Betreiberin DGOU, inhaltlich verantwortlich Prof. Dr. Benedikt Braun und Dr. David Baur; VR 3956 (Widerspruch zur Satzung: VR 3953, offen); keine Cookies, kein Tracking, keine externen Verbindungen, keine Formulare; **Entwurf-Banner bleibt bis zur DGOU-Freigabe**.

**Kontakt:** zentrale Adresse `akki@dgou.de` aus `kontakt.json` (bei der DGOU noch einzurichten, bis dahin nicht zustellbar). Newsletter nur per mailto.

**Qualität (zuletzt geprüft, 27.11.2026):** 8 Seiten bei 380 bis 1600 px ohne seitliches Überlaufen, Kontrast ≥ 4,5:1, eine `h1`, keine Platzhalter, Konsole ohne Fehler, auch statisch ohne `server.js`, Links erreichbar (zwei DOI-Links zu SAGE und MDPI melden bei Skript-Abfragen „403“, Bot-Schutz der Verlage).

---

## 5. Inhalte und Quellen

Alle Texte und Fakten stehen in **`inhalte.md`**. Quellen: AG-Präsentation Halbjahrestreffen 08.06.2026, DGOU-Gremienberichte, Hackathon-Website, Publikationsliste der AG Digitalisierung (`daten/publikationen-ag.md`), Recherche des Teams.

**KI-Lab-Archiv 2026** (`beitraege.json`): 07.01. n8n · 04.02. Microsoft Copilot: Features und DSGVO · 04.03. KI-Strategie · 07.04. Claude: Von Chatbot zu Cowork · 12.05. Claude Code · 07.07. Conus · 18.08. ChatGPT Work vs. Claude Cowork · 15.09. Gemini (Referentin offen, weggelassen) · 03.11. Vom Arzt zum Softwareentwickler (Philipp Michel). Juni und Oktober ohne Titel (ausgeblendet).

**Hackathon:** 27.–28.11.2026, BG Klinikum Unfallkrankenhaus Berlin (Kesselhaus), sieben Use Cases, Website `https://akki-hackathon-2026.vercel.app/`.

---

## 6. Nächste Schritte

1. **Push** (Team, GitHub Desktop → „Push origin“). Erst danach sieht Vercel die neuen Stände.
2. **Block K: Smart Editor** (`ARBEITSAUFTRAG.md` Abschnitt K, `KONZEPT.md`). **Fertig und geprüft (27.11.):** Import per DOI (Crossref) oder PubMed-ID mit Dublettenprüfung gegen `publikationen.json`; Eintrag im aktuellen Format (`jahr`, `nr`, `themen`, `kennzeichen`, Autor:innen als „Nachname Initialen“); Freigabe („Freigegeben von“) schreibt in `publikationen.json` (Eintrag wird als Text eingefügt, Git-Verlauf bleibt klein). Reiter Veranstaltung speichert KI-Lab-Termine in `beitraege.json` (`beginn`, `ende`, `kategorien`, `bestaetigt`); ein Monatsplatzhalter ohne Titel wird ersetzt, gleicher Tag fragt vor dem Ersetzen. Schreibende Schnittstellen nur lokal und nur von der Editor-Seite. Newsletter-Reiter ohne „ersten Dienstag“ und ohne „offen für alle“. Ohne API-Schlüssel zeigt der Kopf „Demonstration ohne KI-Anbindung“. **Noch offen:** KI-Entwurf mit Evidence Check (braucht API-Schlüssel in `.env` und Teamfreigabe der Regeln aus `KONZEPT.md`, Abschnitt 4; der Knopf ist bis dahin gesperrt, die „Prüfnotizen“ werden nicht gespeichert).
3. **Vercel-Veröffentlichung** (Antonia): vercel.com → mit GitHub anmelden → Projekt `02-akki-website` importieren → Framework „Other“, kein Build, Output `public` → Deploy. Live-URL notieren.
4. **Abgabe:** `ergebnis.md` und kurze Beschreibung in `README.md` (siehe `GITHUB_ANLEITUNG.md`, Schritt 5).
5. **Pitch** (15 Min.): Problem → Lösung → Live-Demo (Smart Editor: DOI oder KI-Lab-Einladung → Entwurf → Freigabe → erscheint auf der Seite) → Ausblick. Plan B: Bildschirmaufnahme der Demo.

---

## 7. Offene Punkte (Details in `inhalte.md` → „Offene Punkte – Gesamtliste“)

- **Publikationen:** 3 Einträge ohne DOI-Link, weil die DOI bei Crossref nicht zu Titel, Jahr und Erstautor der Liste passt: Youssef Y 2024 „Joint and functional examinations …“ (10.1055/a-1957-5763; Crossref führt den deutschen Titel „Orthopädisch-unfallchirurgische Funktionsuntersuchung in der Online-Videosprechstunde …“), Tjardes T 2020 (10.1007/s00104-019-01091-9; Crossref nennt als Erstautor „AG Digitalisierung der DGOU“), Osterhoff G 2020 (10.1007/s00113-019-0676-y; Crossref nennt „Arbeitsgruppe Digitalisierung …“). Team kann die Links bei Bedarf bestätigen. Bei 11 Einträgen führt Crossref als Online-Datum das Vorjahr, das Heftjahr der Liste stimmt. Die Liste hat jetzt 56 Einträge (Stand 27.11.2026), die früher entfernten drei (Knee 2026, Obere Extremität 2025, „Neue Führung“) sind wieder dabei. Die Website schreibt nur „56 Publikationen“, nicht „peer-reviewed“.
- Leitung des AKKI (Baur, Osterhoff) und Schreibweisen bestätigen; Leitungen der Arbeitskreise; gibt es AK Weißbuch, AK S3-Leitlinie und Kompetenzbereiche noch (auf der Website nur der AK Medien und digitale Systeme)?
- KI Lab: Uhrzeit (nicht bestätigt, wird nicht angezeigt), Teilnahmebedingungen („offen für alle“?), Start Januar 2026 (vom Team festgelegt), Themen Juni/Oktober; Referentin 15.09. (Anna Klempert oder Anna Völker?)
- `akki@dgou.de` bei der DGOU einrichten lassen.
- Rechtliches: Vereinsregisternummer (VR 3956 oder 3953), Speicherdauer E-Mail-Anfragen, Rechtsgrundlage, Aufsichtsbehörde, Logfile-Speicherdauer und Auftragsverarbeitung bei Vercel; Freigabe von Impressum und Datenschutz durch die DGOU.
- Entwürfe zur Teamfreigabe (`status: "entwurf"`): Kopfsatz, Ziele, Meilensteine, Leitungsangaben, Projekttexte, Use-Case-Kurzbeschreibungen, KI-Lab-Titel und -Beschreibungen, Mitmachen-Texte und FAQ.
- Fotos nur mit Einverständnis (bis dahin Initialen-Kreise, keine Bildplätze); Logo-Freigabe durch die AG; API-Schlüssel für die KI-Funktionen.

---

## 8. Ausblick für den Pitch (nicht bis morgen bauen)

Echter Newsletter-Versand über DGOU-Verteiler (Double-Opt-in) · Mediathek mit KI-Lab-Aufzeichnungen · AKKI AI Radar (automatisierte Literatursuche, Idee aus dem KI Lab zu n8n) · KI-Tool-Kompass · Plattform für alle Arbeitskreise der AG Digitalisierung mit gemeinsamem Designsystem und eigener Akzentfarbe je AK · Englische Version · eigene Domain unter der DGOU.
