# PROJEKTSTAND – AKKI-Website (Übergabe nach Clear)

**Stand:** Fr 27.11.2026, ca. 15:00 Uhr · AKKI Hackathon 2026, Use Case 02 · Präsentation: Sa 28.11.2026

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

---

## 3. Technik

| Teil | Datei / Ort |
|---|---|
| Seiten | `public/index.html`, `wer-wir-sind.html`, `projekte.html`, `publikationen.html`, `treffen.html` (KI Lab), `mitmachen.html`, `impressum.html`, `datenschutz.html` |
| Design | `public/style.css` (alle Farben und Schriften als Variablen), Schriften lokal in `public/fonts` |
| Daten | `public/daten/beitraege.json` (Aktuelles und KI-Lab-Termine, zentrale Quelle), `organisation.json` (Organigramm), `kontakt.json` (zentrale E-Mail-Adresse) |
| Logo | `public/logo/logo-animiert.js` (lebendes Logo), `logo-hell.svg`, `logo-dunkel.svg`, `logo-vorschau.html` |
| Smart Editor | `redaktion/redaktion.html`, **nur lokal** über `server.js` (`http://localhost:3000/redaktion`), nicht öffentlich |
| Server lokal | `node server.js` (mit KI später: `node --env-file=.env server.js`) |
| Hosting | Vercel, `vercel.json` (Ausgabeordner `public`, kein Build). Suchmaschinen vorerst gesperrt (`noindex`) |

---

## 4. Getroffene Entscheidungen

**Logo:** „Lebendes Logo“ – Schriftzug AKKI aus geraden, feinen Punktbahnen (5 versetzte Bahnen pro Strich, keine überlagerten Punkte), stilles Gerüst, Lichtimpulse mit Schweif laufen die Striche entlang, unter der Maus leuchten Knoten auf und starten neue Impulse. Darunter klein: „Arbeitskreis Künstliche Intelligenz“ / „AG Digitalisierung · DGOU“. Bei „Bewegung reduzieren“ steht es still.

**Farbpalette D** (zentral in `style.css`):

| Rolle | Farbe |
|---|---|
| Hauptfarbe (Überschriften, Links, Buttons) | `#00508A` |
| Akzent (Linien, Hover, Kachel-Oberkanten; nicht für kleinen Text) | `#008F83` |
| Mint (nur Flächen und Logo) | `#78CBB9` |
| Helle Kacheln | `#E6F5F1` |
| Hintergrund | `#FFFFFF` |
| Dunkle Flächen | `#002B45` |
| Logo | Punkte `#78CBB9`, Impulse `#FFFFFF`, Hintergrund `#002B45` |

**Neue Designentscheidung (14:41): weniger Dunkelblau.** Das Team empfindet die großen dunkelblauen Flächen als zu schwer („das Dunkelblau frisst alles“). Ziel: **helle, luftige Seite**. Dunkelblau nur noch gezielt (siehe Abschnitt 7, Schritt 1).

**Seitenstruktur:** Start · Wer wir sind · Projekte · Publikationen · KI Lab · Mitmachen/Kontakt · Fußzeile mit Impressum und Datenschutz. Zugehörigkeit sichtbar: „DGOU › AG Digitalisierung › AKKI“ mit Links zu dgou.de und digitalisierung-dgou.de. Partner-Arbeitskreis: AK Medien und digitale Systeme.

**Rechtliches:** DGOU darf als Betreiberin genannt werden (bestätigt). Inhaltlich verantwortlich (§ 18 Abs. 2 MStV): Prof. Dr. Benedikt Braun und Dr. David Baur, c/o DGOU. Datenschutzbeauftragter: DGOU, datenschutz@dgou.de. Vercel als Hoster freigegeben. Kein Link zur EU-Streitschlichtungsplattform (eingestellt).

**Kontakt:** zentrale Adresse `akki@dgou.de` (bei der DGOU noch zu beantragen, bis dahin nicht zustellbar). Newsletter-Anmeldung nur per mailto, keine Formulare und keine Datenspeicherung auf der Website.

---

## 5. Was fertig ist (laut GitHub, Stand ca. 15:05)

- Startseite überarbeitet: Headline, Buttons „KI Lab entdecken“ / „Mitmachen“, Schwerpunkte mit Icons, Aktuelles, „Aus dem KI Lab“, Mitmachen-Kasten; Termine aus `beitraege.json`
- Unterseiten angelegt, Organigramm aus `organisation.json`, Partner-AK mit Ansprechpartnern (PD Dr. Lindhorst, doc. Dr. Stephan Gruener)
- Farbpalette D inkl. lebendem Logo und SVG-Logos
- Impressum und Datenschutz mit DGOU-Angaben, Vercel und Datenschutzbeauftragtem
- Schriften lokal, Suchmaschinensperre, Vercel-Konfiguration
- Smart Editor (lokal) mit Reitern Publikation (DOI über Crossref), Veranstaltung, Newsletter; noch ohne KI

---

## 6. Inhalte und Quellen

Alle Texte und Fakten stehen in **`inhalte.md`**. Wichtigste Quellen: AG-Präsentation Halbjahrestreffen 08.06.2026, DGOU-Gremienberichte 2025/2026, Hackathon-Website, Recherche des Teams.

**KI-Lab-Archiv 2026** (in `beitraege.json`): 07.01. n8n · 04.02. Microsoft Copilot · 04.03. KI-Strategie in der Medizin · 07.04. Claude – von Chatbot zu Cowork · 12.05. Claude Code · 07.07. Conus – klinische LLMs · 18.08. ChatGPT Work vs. Claude Cowork · 15.09. Gemini – ein Praxisbericht · 03.11. Vom Arzt zum Softwareentwickler (Philipp Michel). Format: erster Dienstag im Monat, 18–19 Uhr, online über Teams, kostenlos, offen für alle. Teams-Link **nie** öffentlich.

**Projekte:** Schwerpunkte Leitliniensupport, KI-Zugang in O&U, Clinical Decision Support; Projekte Wunddokumentation (laufend), Arztbriefe (publiziert, PubMed 41436785), Sprachmodelle bei Kreuzbandruptur (publiziert, PubMed 41253635); Transfer: KI Lab, Hackathon, Open Source (github.com/akkidgou-opensource). PubMed-Links vor Veröffentlichung prüfen. Promotionsprojekte **nicht** ins Repo.

---

## 7. Nächste Schritte (Reihenfolge)

1. **Design aufhellen** (Teamwunsch „weniger Dunkelblau“):
   ```
   Hell die Website auf, das Dunkelblau wirkt zu schwer. Navigation weiß mit dunkelblauer Schrift und feiner Linie unten. Startseiten-Kopf auf hellem Hintergrund (#FFFFFF bzw. sehr helles Mint #F3FAF8), Headline in #00508A, Text in #4A5560. Das lebende Logo bleibt, sitzt aber in einer kleineren, abgerundeten dunklen Kachel (#002B45) rechts neben der Headline statt über die ganze Breite. Seitenköpfe der Unterseiten hell mit dunkelblauer Überschrift und Untertitel. Dunkelblau nur noch für Logo-Kachel, Buttons und Fußzeile. Headline kürzer: "Künstliche Intelligenz trifft medizinische Expertise." Kontraste prüfen, dann speichern und hochladen.
   ```
2. **Projektseite** überarbeiten (Prompt aus dem Chat, 14:39), falls noch nicht geschehen
3. **KI-Lab-Seite** fertigstellen: nächster Termin automatisch, .ics-Download, Archiv mit Suche und Kategorie-Filter, „Thema vorschlagen“
4. **Vercel-Veröffentlichung** (Antonia): vercel.com → mit GitHub anmelden → Projekt `02-akki-website` importieren → Framework „Other“, kein Build, Output `public` → Deploy. Live-URL notieren.
5. **Smart Editor mit KI**, sobald ein API-Schlüssel vorliegt (Regeln für KI-Entwürfe in `KONZEPT.md` Abschnitt 4 vorher vom Team freigeben lassen). Evidence Check: Studientyp, Anwendungsbereich, externe Validierung, klinische Einsatzreife, Limitationen.
6. **Block 7 Prüfung:** tote Links, Seitentitel, Handy-Ansicht (380 px), Kontraste, Rechtschreibung
7. **Fotos vom Team** (mit Einverständnis) als Ersatz für „Foto folgt“
8. **Abgabe:** `ergebnis.md` und kurze Beschreibung in `README.md` (siehe `GITHUB_ANLEITUNG.md`, Schritt 5)
9. **Pitch** (15 Min.): Problem → Lösung → Live-Demo (Smart Editor: DOI oder KI-Lab-Einladung → Entwurf → Freigabe → erscheint auf der Seite) → Ausblick. Plan B: Bildschirmaufnahme der Demo.

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
