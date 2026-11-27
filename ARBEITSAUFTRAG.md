# ARBEITSAUFTRAG – Detaillierte Überarbeitung der AKKI-Website

**Stand:** Fr 27.11.2026, 15:10 Uhr · ergänzt `PROJEKTSTAND.md`, `inhalte.md`, `KONZEPT.md`

> **Für Claude Code:** Arbeite diesen Auftrag **blockweise** ab (Reihenfolge in Abschnitt 0.4). Vor jedem Block `git status` prüfen, nach jedem Block speichern (Commit) und dem Team in max. 5 Sätzen berichten, was umgesetzt und getestet ist und was offen bleibt. Hochladen (Push) macht das Team in GitHub Desktop.
> Alle Inhalte, die du hier findest, darfst du verwenden. **Nichts darüber hinaus erfinden.**

---

## 0. Grundregeln für diesen Auftrag

### 0.1 Drei Arten von Informationen
| Art | Kennzeichen hier | Umgang |
|---|---|---|
| **Bestätigt** | ✅ | direkt verwenden |
| **Recherchiert, Quelle bekannt** | 🔎 | verwenden, Quelle in den Daten (`quelle`) mitführen; bei DOIs vorher per Crossref prüfen (0.3) |
| **Redaktioneller Vorschlag** | ✍️ | verwenden, in den Daten `status: "entwurf"` setzen; Team gibt später frei |
| **Ungeklärt** | ❓ | **öffentlich ausblenden**, nur in `inhalte.md` → „Offene Punkte“ führen |

### 0.2 Keine öffentlichen Platzhalter mehr
Entferne auf allen öffentlichen Seiten: „Text folgt“, „Link folgt“, „Foto folgt“, „wird bestätigt“, „wird geprüft“, „vorläufig“, gelbe Prüfhinweise, `[OFFEN]`. Fehlt eine Angabe → Feld/Button/Abschnitt ausblenden. **Ausnahmen, die bleiben müssen:** Pflichthinweis „Prototyp – nur Testdaten. Kein Ersatz für ärztliche Beurteilung.“ sowie Impressum/Datenschutz.

### 0.3 DOI-Prüfung
Jede DOI vor Veröffentlichung über `https://api.crossref.org/works/<DOI>` abrufen (Server-Funktion in `server.js` oder einmalig per Skript). Titel, Autor:innen, Journal und Jahr **aus Crossref übernehmen**, nicht aus diesem Dokument. Löst eine DOI nicht auf → Publikation weglassen und in „Offene Punkte“ eintragen.

### 0.4 Reihenfolge der Blöcke
1. **A** Seitenübergreifendes Design (heller, einheitliche Komponenten)
2. **B** Datenstruktur
3. **C** Startseite
4. **D** Wer wir sind
5. **E** Projekte (inkl. Hackathon)
6. **F** Publikationen
7. **G** KI Lab (Korrekturen)
8. **H** Mitmachen & Kontakt
9. **I** Footer, Impressum, Datenschutz
10. **J** Qualitätskontrolle
11. **K** Smart Editor (erst wenn A–J stehen)

### 0.5 Entscheidungen des Teams haben Vorrang
Wo Recherche-Vorschläge und Teamentscheidungen sich widersprechen, gilt die **Teamentscheidung**:
- **Weniger Dunkelblau** (Team, 14:41): Navigation und Seitenköpfe **hell**. Dunkelblau `#002B45` nur für die Logo-Kachel, den Footer und einzelne Akzente. (Nicht: dunkler Header/Hero über die ganze Breite.)
- **Kontaktadresse `akki@dgou.de`** wird verwendet (Team, 14:00), zentral aus `kontakt.json`. Vor dauerhafter Veröffentlichung von der DGOU bestätigen lassen; Umstellung = eine Zeile.
- **Partner-AK:** Ansprechpartner „PD Dr. Lindhorst, doc. Dr. Stephan Gruener“ – genau so, **ohne** Vornamen bei Lindhorst, „Gruener“ mit „ue“.
- **Inhaltlich verantwortlich:** Prof. Dr. Benedikt Braun und Dr. David Baur (bestätigt).
- **Keine Promotionsprojekte und keine internen Daten** im Repo – das Repo ist öffentlich.

---

## A. Seitenübergreifendes Design

### A1. Farben (Palette D, zentral in `style.css`)
| Token | Wert | Verwendung |
|---|---|---|
| `--blau` | `#00508A` | Überschriften, Links, Primärtext-Akzente |
| `--petrol` | `#008F83` | Primärbutton (weiße Schrift, fett), Linien, Hover, aktive Navigation |
| `--mint` | `#78CBB9` | Logo, kleine Akzente, Badges (dunkle Schrift) |
| `--mint-hell` | `#E6F5F1` | **sparsam**: höchstens ein hervorgehobener Bereich pro Seite |
| `--weiss` | `#FFFFFF` | Seitenhintergrund und **Standard-Kartenhintergrund** |
| `--hell` | `#F5F8FA` | abwechselnde Abschnitte |
| `--navy` | `#002B45` | Logo-Kachel, Footer |
| `--text` | `#2B3A45` | Fließtext |
| `--text-2` | `#4A5560` | Nebentext, Metadaten |
| `--rahmen` | `#DCE5EC` | Kartenrahmen, Trennlinien |

### A2. Navigation (alle Seiten identisch, eine Komponente)
- Weißer Hintergrund, feine Linie unten (`--rahmen`), bleibt beim Scrollen oben (sticky).
- Links: **statische Wortmarke** – kleines Punkte-„AKKI“ in `#00508A` mit mintfarbenem Punkt, daneben klein „AG Digitalisierung · DGOU“; verlinkt auf `index.html`. Neue Datei `public/logo/logo-nav.svg` (kontraststark, ohne Hintergrund).
- Menüpunkte: **Start · Wer wir sind · Projekte · Publikationen · KI Lab · Mitmachen & Kontakt**. Dateiname `treffen.html` bleibt, Bezeichnung überall „KI Lab“.
- Aktiver Punkt: Petrol, unterstrichen, `aria-current="page"`.
- Mobil: Menü-Button, Menü als Liste, Tastatur bedienbar.

### A3. Seitenköpfe der Unterseiten
Heller Kopf (`--hell`), Überschrift in `--blau`, darunter ein Untertitel (siehe jeweiliger Block), kompakte Höhe (kein großer leerer Block).

### A4. Raster, Schrift, Abstände
- Inhaltsbreite max. 1200 px, Fließtext max. ca. 70 Zeichen Zeilenlänge.
- Schriftgrößen mit `clamp()`, Archivo für Überschriften, Manrope für Text (lokal).
- Einheitliche Abstände (z. B. 8/16/24/40/64 px).

### A5. Komponenten (wiederverwendbar)
- **Buttons:** Primär = Petrol gefüllt; Sekundär = weiß mit Petrol-Rahmen. Überall gleich.
- **Kartentypen**, damit nicht alles gleich aussieht:
  - *Projektkarte:* weiß, Rahmen, farbiger Status-Badge, Kategorie oben klein in Großbuchstaben.
  - *Publikationseintrag:* kompakte Listenzeile (kein Kasten): Titel, Autor:innen, Journal · Jahr, Links DOI/PubMed, „Zitation kopieren“.
  - *Veranstaltungskarte:* links Datumsblock (Tag groß, Monat klein, Petrol), rechts Titel, Beschreibung, Kategorie-Tags.
  - *Personenkarte:* Name, Titel, Funktion, Institution; Foto nur wenn freigegeben, sonst Initialen-Kreis.
- **Icons:** einheitliche Linien-Icons (lokal als SVG), keine Emojis.
- **Bilder:** keine Stockfotos, keine Roboter/Gehirne. Solange keine freigegebenen Fotos vorliegen, keine Bildplätze anzeigen.

### A6. Barrierefreiheit
Sichtbarer Fokus-Rahmen, Kontrast mind. 4,5 : 1 für Text, Alt-Texte, logische Überschriften (eine `h1` pro Seite), `prefers-reduced-motion` respektieren.

---

## B. Datenstruktur (eine Quelle pro Inhaltsart)

In `public/daten/`:
| Datei | Inhalt |
|---|---|
| `beitraege.json` | Aktuelles + KI-Lab-Termine (besteht) |
| `projekte.json` | Schwerpunkte, Projekte, Transfer (neu) |
| `publikationen.json` | Publikationen (neu) |
| `personen.json` | Leitung, Ansprechpartner (neu) |
| `organisation.json` | Organigramm (besteht) |
| `kontakt.json` | zentrale Adresse + Betreff-Vorlagen (besteht) |
| `usecases.json` | 9 Hackathon-Use-Cases (neu) |

Jeder Datensatz: `id`, `quelle`, `stand` (Datum), `status` (`bestaetigt` | `entwurf`), dazu die inhaltlichen Felder. Öffentlich angezeigt wird alles mit `bestaetigt` **und** `entwurf` – **nicht** angezeigt werden leere Felder. Seiten laden die Daten per JavaScript; dieselbe Information nie doppelt in HTML pflegen. Die Startseite zieht Aktuelles, KI-Lab-Termine und neueste Publikation aus diesen Dateien.

---

## C. Startseite

### C1. Hero (hell, zweispaltig)
- Hintergrund weiß/`--hell`. Links (ca. 55 %): kleine Zeile „ARBEITSKREIS DER AG DIGITALISIERUNG · DGOU“ (Petrol, Großbuchstaben), Headline, Untertitel, Buttons. Rechts (ca. 45 %): **lebendes Logo in abgerundeter Navy-Kachel** (`#002B45`, max. ca. 440 px breit, Höhe ca. 260 px).
- Mobil: Text oben, Logo-Kachel darunter.
- ✍️ Headline: **„Künstliche Intelligenz trifft medizinische Expertise.“**
- ✍️ Untertitel: „Gemeinsam gestalten wir die Zukunft der Orthopädie und Unfallchirurgie – durch Forschung, Wissen und Innovation.“
- Buttons: **KI Lab entdecken** (primär → `treffen.html`) · **Mitmachen** (sekundär → `mitmachen.html`)

### C2. Willkommen (kurz)
✍️ „Der Arbeitskreis Künstliche Intelligenz (AKKI) der AG Digitalisierung der DGOU beschäftigt sich mit der Anwendung und wissenschaftlichen Bewertung von KI in der Medizin. Wir verbinden klinische Expertise, Forschung und technologische Entwicklung – mit Schwerpunkt Orthopädie und Unfallchirurgie und offen für den interdisziplinären Austausch.“
✍️ Für wen: „Für Ärztinnen und Ärzte, Forschende, Studierende, medizinisches Fachpersonal und alle, die sich mit KI im Gesundheitswesen beschäftigen.“

### C3. Drei Schwerpunkte (weiße Karten mit Icon)
✍️ (redaktionelle Oberbegriffe, keine offizielle Untergliederung)
- **Forschung & Evidenz** – „Wir untersuchen und bewerten KI-Anwendungen wissenschaftlich – mit Blick auf Validität, klinischen Nutzen und Patientensicherheit.“ → Button „Forschungsprojekte“ (`projekte.html`)
- **Wissen & Fortbildung** – „Im DGOU KI Lab stellen wir aktuelle Werkzeuge vor, teilen Praxiserfahrungen und diskutieren neue Entwicklungen.“ → „Zum KI Lab“
- **Innovation & Transfer** – „Von der Projektidee über den Hackathon bis zum Open-Source-Prototyp: Wir entwickeln gemeinsam.“ → „Projekte entdecken“

### C4. Aktuelles (2–3 Karten, aus `beitraege.json`, Typ `news`)
- **Hervorgehoben:** AKKI Hackathon 2026 · 27.–28.11.2026 · BG Klinikum Unfallkrankenhaus Berlin (Kesselhaus) · „Ärzt:innen und technikinteressierte Kolleg:innen entwickeln in zwei Tagen Prototypen zu neun KI-Use-Cases.“ · Link Hackathon-Website ✅
- 🔎 Neue Leitung der AG Digitalisierung (August 2026) · Link zum Fachartikel (siehe F3)
- 🔎 Neueste Publikation (aus `publikationen.json`, automatisch die jüngste)
Das KI Lab **nicht** zusätzlich in „Aktuelles“ wiederholen.

### C5. Aus dem KI Lab
Die drei jüngsten Termine aus `beitraege.json` als Veranstaltungskarten + Link „Zum Archiv“.

### C6. Mitmachen-Band (ein Bereich in `--mint-hell`)
✍️ „Sie interessieren sich für KI in der Medizin? Ob Forschungsprojekt, eigener Praxisbericht, technische Entwicklung oder fachlicher Austausch – wir freuen uns über neue Impulse.“
Buttons: **Kontakt aufnehmen** · **Thema für das KI Lab vorschlagen** · **Newsletter abonnieren** (mailto, wie bisher).

---

## D. Wer wir sind

Untertitel: „Der Arbeitskreis KI in der AG Digitalisierung der DGOU.“

### D1. Selbstverständnis
✍️ „Der AKKI ist Teil der AG Digitalisierung der Deutschen Gesellschaft für Orthopädie und Unfallchirurgie. Er beschäftigt sich mit den Möglichkeiten selbstlernender Systeme in Patientenversorgung und Forschung – in Orthopädie und Unfallchirurgie und darüber hinaus.“

### D2. Ziele (Liste, ✍️ Entwurf zur Teamfreigabe)
- Aktuelle wissenschaftliche Erkenntnisse zu KI in der Medizin vermitteln
- Den fachlichen und interdisziplinären Austausch fördern
- Medizinische KI-Anwendungen wissenschaftlich bewerten
- Forschungsprojekte entwickeln und unterstützen
- Praxisnahe KI-Kompetenz fördern
- Datenschutz, Ethik, Regulierung und Patientensicherheit diskutieren
- Den verantwortungsvollen Transfer in die klinische Praxis unterstützen

### D3. Kurze Zeitleiste (horizontal, mobil vertikal)
- 🔎 **25.10.2018** – Gründung der AG Digitalisierung (Quelle: AG-Präsentation 08.06.2026)
- 🔎 **Januar 2021** – Gründung des Arbeitskreises KI (Quelle: AG-Präsentation 08.06.2026)
- 🔎 **Dezember 2025** – Start des DGOU KI Lab (Quelle: DGOU-Meldung, s. G)
- 🔎 **August 2026** – Leitungswechsel der AG Digitalisierung (Quelle: Fachartikel, s. F3)
- ✅ **November 2026** – Erster AKKI-Hackathon in Berlin
Keine Mitgliederzahlen oder Erfolgsstatistiken.

### D4. Leitung und Ansprechpersonen (Personenkarten aus `personen.json`)
- 🔎 **AKKI-Leitung:** Dr. David Baur, Prof. Dr. Georg Osterhoff (Quelle: AG-Präsentation 08.06.2026). Ältere Angaben (Osterhoff/Tsitsilonis) **nicht** übernehmen.
- 🔎 **KI-Lab-Moderation:** Dr. David Baur, Dr. Yasmin Youssef (Quelle: DGOU-Meldung)
- Keine Fotos, bis freigegeben (Initialen-Kreis). Keine privaten Kontaktdaten.

### D5. AG Digitalisierung – Leitung
🔎 Laut Fachartikel „Neue Führung – next Level Digitalisierung und KI“ (02.10.2026), Übergabe am 06.08.2026:
- Prof. Dr. Benedikt J. Braun (Tübingen) – Vorsitz
- Dr. David Baur – stellvertretender Vorsitz
- Dr. Martin Breitwieser (Salzburg) – Sekretär
Mit Quellenangabe und Datum anzeigen („Stand: Oktober 2026“). Ortsangaben weglassen, wenn nicht eindeutig (für Baur nennen Quellen Freiburg bzw. Leipzig).

### D6. Organigramm (grafisch statt verschachtelter Liste)
Kästchen mit Verbindungslinien (reines HTML/CSS oder SVG):
**DGOU** → **AG Digitalisierung** → **AKKI** (hervorgehoben) und daneben gleichrangig **AK Medien und digitale Systeme** (✅ vom Team bestätigt; „Soziale Medien, Dokumentationssysteme für Klinik und Praxis, rechtlicher, wirtschaftlicher und politischer Rahmen“; Ansprechpartner PD Dr. Lindhorst, doc. Dr. Stephan Gruener).
❓ Weitere Arbeitskreise (Weißbuch, S3-Leitlinie Coxarthrose) und Kompetenzbereiche **nicht anzeigen**, bis die aktuelle Struktur bestätigt ist (Team spricht von drei Arbeitskreisen).

### D7. Rahmen und Satzung
🔎 „Der AKKI ist organisatorisch in die AG Digitalisierung der DGOU eingebunden und orientiert sich an den Zielen der Fachgesellschaft: Förderung von Wissenschaft und Forschung, interdisziplinärer Austausch sowie Aus-, Fort- und Weiterbildung. Die Bildung von Arbeitsgemeinschaften ist in § 2 der Satzung der DGOU vorgesehen.“
Button „Satzung der DGOU ansehen“ → `https://dgou.de/fileadmin/dgou/dgou/Dokumente/Ueber_uns/Satzung_und_Geschaeftsordnung/2026_DGOU_Satzung.pdf` (Link vorher prüfen; wenn er nicht lädt, Button weglassen).

---

## E. Projekte

Untertitel: „Woran wir arbeiten – von der Forschung bis zum Wissenstransfer.“ Daten in `projekte.json`, Filter nach **Thema** und **Status**.

Status-Werte: `Projektidee` · `In Planung` · `Laufend` · `Abgeschlossen` · `Publiziert` (Badge-Farben unterschiedlich, Text gut lesbar).
Themen-Werte: Klinische Dokumentation · Diagnostik · Prognostik · Decision Support · Patienteninformation · Leitlinien · Lehre · Open Source.

### E1. Thematische Schwerpunkte (3 Karten mit Icon)
- 🔎✍️ **KI-basierter Leitliniensupport** – „Wie kann KI helfen, Leitlinien gezielt zu durchsuchen und relevante Empfehlungen quellenbasiert und nachvollziehbar bereitzustellen?“ · Ansprechpartner: Prof. Dr. Georg Osterhoff (Quelle: DGOU-Gremienbericht 2026)
- 🔎✍️ **Erleichterter KI-Zugang in O&U** – „Technische und organisatorische Einstiegshürden abbauen und den praxisnahen Einsatz geeigneter KI-Werkzeuge erleichtern.“ · Ansprechpartner: Prof. Dr. Georg Osterhoff (Gremienbericht 2026)
- 🔎✍️ **Clinical Decision Support** – „Selbstlernende Systeme zur Unterstützung klinischer Entscheidungen in Diagnostik, Prognostik und Therapieplanung – mit wissenschaftlicher Validierung und ärztlicher Entscheidungshoheit.“ (Quelle: digitalisierung-dgou.de/schwerpunkte)

### E2. Forschungsprojekte
- 🔎 **KI-gestützte Wunddokumentation** – „Validierungsstudie zur KI-gestützten Erstellung von Texten für die Wunddokumentation.“ · Thema Klinische Dokumentation · Status **Laufend** · Ansprechpartner: Prof. Dr. Georg Osterhoff, Dr. Yasmin Youssef (Gremienbericht 2026). Keine Ergebnisse behaupten.
- 🔎 **KI-basierte Arztbriefe – Zukunft oder Gefahr?** – „Untersuchung KI-gestützter Lösungen zur Arztbrieferstellung im deutschsprachigen Raum: Funktionen, Einsetzbarkeit, Datensicherheit und Kosten.“ · Thema Klinische Dokumentation · Status **Publiziert** · verknüpft mit Publikation F1.
- 🔎 **Sprachmodelle und Patienteninformation** (Themenfeld) – „Wie genau beantworten KI-Sprachmodelle Patientenfragen zu orthopädischen Erkrankungen?“ · Thema Patienteninformation · Status **Publiziert** · verknüpft mit F2-Arbeiten. Als „Forschung aus dem Umfeld der AG“ kennzeichnen, nicht als offizielles AKKI-Projekt.

### E3. Wissenstransfer und Innovation
- **DGOU KI Lab** → `treffen.html`
- **AKKI Hackathon 2026** → Abschnitt E4
- **Open Source** → `https://github.com/akkidgou-opensource` ✅

### E4. Hackathon 2026 (eigener Bereich, Anker `#hackathon`)
✍️ „Beim ersten KI-Hackathon des AKKI entwickeln Ärztinnen, Ärzte und technikinteressierte Teilnehmende in interdisziplinären Teams Prototypen für Orthopädie und Unfallchirurgie. Programmierkenntnisse sind keine Voraussetzung.“
✅ 27.–28.11.2026 · BG Klinikum Unfallkrankenhaus Berlin, Kesselhaus · Veranstalter: BG Klinikum Unfallkrankenhaus Berlin und Helliwood media & education im fjs e. V. · Website `https://akki-hackathon-2026.vercel.app/`
**Neun Use Cases** (`usecases.json`, Raster mit 3 Spalten, Hinweis „Hackathon-Prototypen – nicht für den klinischen Einsatz“). Kurzbeschreibungen ✍️, Titel ✅:
1. Wund-AI – KI-gestützte strukturierte Wunddokumentation
2. AKKI-Website – Website des Arbeitskreises mit KI-gestützter Redaktion (dieses Projekt)
3. EKG-AI – KI-Unterstützung bei der Aufbereitung von EKG-Befunden
4. Medizinischer Avatar-Übersetzer – digitale Hilfe für mehrsprachige Patientenkommunikation
5. Reanimations-Co-Pilot – digitale Assistenz in Reanimationssituationen
6. Pflege-Zusammenfassung – KI-gestützte Zusammenfassung pflegerischer Dokumentation
7. Entlassungsassistent – Unterstützung bei Entlassungsinformationen
8. Implantat-Check – digitale Unterstützung rund um Implantatinformationen
9. OP-Bericht-Assistent – Entwürfe für die operative Dokumentation
Felder für später (ausgeblendet, solange leer): Team, Repository, Demo, Ergebnis. Zu „AKKI-Website“ das eigene Repo verlinken: `https://github.com/antoniavo/02-akki-website`.

Unten: Kasten „Forschungsidee einbringen?“ → mailto, Betreff „Forschungskooperation“.

---

## F. Publikationen

Untertitel: „Wissenschaftliche Veröffentlichungen des AKKI und ausgewählte Arbeiten aus dem Umfeld der AG Digitalisierung.“
Daten in `publikationen.json`; Darstellung als kompakte Liste (A5), **Suche**, **Jahresfilter**, **Typfilter** (Originalarbeit · Übersicht · Verbandsmitteilung · Bericht), Button **„Zitation kopieren“**. Metadaten per Crossref (0.3). Keine Volltexte hochladen.

### F1. Publikation des AKKI
🔎 **KI-basierte Arztbriefe – Zukunft oder Gefahr?** · Die Orthopädie · DOI `10.1007/s00132-025-04749-x` · PubMed 41436785 · ✍️ Kurzfassung: „Übersicht über KI-gestützte Lösungen zur Arztbrieferstellung im deutschsprachigen Raum hinsichtlich Funktionen, Einsetzbarkeit, Datensicherheit und Kosten.“ · verknüpft mit Projekt „KI-basierte Arztbriefe“.

### F2. Ausgewählte Forschung aus dem Umfeld der AG Digitalisierung
🔎 (nicht als AKKI-Gemeinschaftspublikation bezeichnen)
- *How accurately do large language models answer patient questions on anterior cruciate ligament tears? A comparative study* · The Knee · DOI `10.1016/j.knee.2025.11.002` · PubMed 41253635 · ✍️ „Vergleich mehrerer Sprachmodelle bei Patientenfragen zur vorderen Kreuzbandruptur.“
- *How accurately can ChatGPT 3.5 answer frequently asked questions by patients on glenohumeral osteoarthritis?* · DOI `10.1007/s11678-024-00836-1`
- *Evaluating ChatGPT responses to frequently asked patient questions regarding periprosthetic joint infection after total hip and knee arthroplasty* · DOI `10.1177/20552076241272620` · PubMed 39130521
- *Accuracy of Artificial Intelligence Based Chatbots in Analyzing Orthopedic Pathologies: An Experimental Multi-Observer Analysis* · DOI `10.3390/diagnostics15020221` · PubMed 39857105

### F3. Verbandsmitteilungen und Berichte (eigener Abschnitt)
- 🔎 *Neue Führung – next Level Digitalisierung und KI* · Braun BJ, Back D · Orthopädie und Unfallchirurgie 5/2026 · 02.10.2026 · DOI `10.1007/s41785-026-4929-z`
- 🔎 DGOU-Gremienbericht 2026, Bericht der AG Digitalisierung · `https://dgou.de/fileadmin/dgou/dgou/Dokumente/Ueber_uns/Info-Material/DGOU_Gremienberichte_2026.pdf`
- 🔎 Publikationsübersicht der AG · `https://www.digitalisierung-dgou.de/forschung/publikationen`

Hinweis unter der Liste: „Neue Publikationen werden über den AKKI Smart Editor ergänzt.“

---

## G. KI Lab – Korrekturen an der bestehenden Seite

Die Seite ist gebaut (Archiv, Suche, Filter, .ics). Folgende Angaben sind laut Recherche **nicht gesichert** und müssen angepasst werden:

| Bisher auf der Seite | Ändern zu |
|---|---|
| „Nächster Termin“ automatisch = erster Dienstag | **Nur bestätigte Termine anzeigen** (Feld `bestaetigt: true` in `beitraege.json`). Ohne bestätigten Termin: „Den nächsten Termin kündigen wir hier und im Newsletter an.“ .ics nur für bestätigte Termine. |
| fester Rhythmus „jeden ersten Dienstag, 18–19 Uhr“ | „in der Regel einmal im Monat, abends, online über Microsoft Teams“ |
| „seit Januar 2026“ | 🔎 „seit Dezember 2025“ |
| Ablauf 20/20/20 Minuten | weglassen ❓ |
| „offen für alle“ | ❓ bis zur Bestätigung weglassen; stattdessen „Kostenlos, online“ |

✍️ Einleitung: „Das DGOU KI Lab ist das digitale Fortbildungs- und Austauschformat des AKKI. Seit Dezember 2025 stellen wir aktuelle KI-Anwendungen vor, teilen Praxiserfahrungen und ordnen wissenschaftliche Entwicklungen ein – für Klinik, Praxis, Forschung und Lehre.“
🔎 Moderation: Dr. David Baur, Dr. Yasmin Youssef.

**Archiv – ergänzte Beschreibungen** (Kategorien Mehrfachzuordnung: KI-Tools · Automatisierung · Strategie · Praxisbericht · Datenschutz · Forschung · Klinische KI · Softwareentwicklung):
| Datum | Titel | Beschreibung ✍️ (auf Basis der Ankündigungen) | Kategorien |
|---|---|---|---|
| 07.01.2026 | Automation mit n8n | Automatisierte Literaturrecherche: Workflows für PubMed-Auswertungen und wissenschaftliche Newsletter. | Automatisierung, Forschung |
| 04.02.2026 | Microsoft Copilot: Features und DSGVO | Aktuelle Funktionen und die Frage der DSGVO-Konformität im medizinischen Umfeld. | KI-Tools, Datenschutz |
| 04.03.2026 | KI-Strategie: Was brauchen Klinik und Praxis wirklich? | Organisatorische, technische und strategische Voraussetzungen für den KI-Einsatz. | Strategie |
| 07.04.2026 | Claude: Von Chatbot zu Cowork | KI-Assistenz über den Chat hinaus – für medizinische, wissenschaftliche und administrative Aufgaben. | KI-Tools, Automatisierung |
| 12.05.2026 | Claude Code | KI-gestützte Programmierwerkzeuge in Klinik, Forschung und Lehre: Anwendungsfälle, Chancen, Grenzen. | KI-Tools, Softwareentwicklung |
| 07.07.2026 | Conus: Klinische LLMs im Einsatz | Klinische Anwendungsfälle medizinischer Sprachmodelle, Möglichkeiten und Grenzen. | Klinische KI, KI-Tools |
| 18.08.2026 | ChatGPT Work vs. Claude Cowork | Praxisvergleich zweier KI-Arbeitsumgebungen für den medizinischen und wissenschaftlichen Alltag. | KI-Tools, Automatisierung |
| 15.09.2026 | Gemini: Ein Praxisbericht | Erfahrungsbericht: Statistik, Vergleich von Sprachmodellen, Datenschutz, Live-Demonstration. **Referentin weglassen** ❓ | Praxisbericht, KI-Tools, Forschung |
| 03.11.2026 | Vom Arzt zum Softwareentwickler | Philipp Michel (Orthopäde und Unfallchirurg): Einstieg in die KI, Anwendung im Klinikalltag und Entwicklung der Software CendovaPlan. | Praxisbericht, Softwareentwicklung |

Vergangene/kommende Termine automatisch anhand des Datums trennen; ein abgelaufener Termin wird nie als „nächster Termin“ angezeigt. Keine Teilnehmerzahlen, keine nachträglichen Ergebnisse. Folien/Aufzeichnungen nur nach Freigabe (Felder vorsehen, leer = ausgeblendet). Quellenfeld je Termin füllen (DGOU-Meldung „DGOU KI Lab – neues Format …“, Einladungen, LinkedIn-Ankündigungen).

---

## H. Mitmachen & Kontakt

Untertitel: „KI in der Medizin lebt von unterschiedlichen Perspektiven.“
✍️ Einleitung: „Der AKKI bietet einen Rahmen für wissenschaftlichen Austausch und die gemeinsame Arbeit an neuen Technologien. Wir freuen uns über Ihr Interesse an Forschung, Fortbildung und der Entwicklung digitaler Anwendungen.“

**Vier Karten** (unterschiedliche Icons, je Button → mailto mit Betreff aus `kontakt.json`):
1. **Am KI Lab teilnehmen** – „Aktuelle KI-Themen kennenlernen, Fragen stellen, Erfahrungen austauschen.“ → `treffen.html` + Newsletter
2. **Ein eigenes Thema vorstellen** – „Praxisbericht, Studie oder spannendes Tool? Schlagen Sie ein Thema vor.“ → Betreff „Themenvorschlag KI Lab“
3. **Forschung mitgestalten** – „Forschungsfragen diskutieren und Kooperationen anregen.“ → „Forschungskooperation“
4. **Technologie entwickeln** – „Projektideen einbringen und an Open-Source-Prototypen mitarbeiten.“ → „Open-Source-Projekt“ + GitHub-Link

🔎 **Mitgliedschaft:** „Mitglieder der DGOU, DGOOC und DGU können sich in die AG Digitalisierung einbringen. Bei Interesse an einer Mitarbeit im AKKI nehmen Sie bitte Kontakt mit uns auf.“ (Interesse, Mitgliedschaft und KI-Lab-Teilnahme klar unterscheiden.)

**Kontakt:** Adresse aus `kontakt.json` (`akki@dgou.de`), Betreff-Auswahl: Interesse an Mitarbeit · Themenvorschlag KI Lab · Forschungskooperation · Open-Source-Projekt · Allgemeine Anfrage. **Kein Formular.**

**FAQ** (aufklappbar, `<details>`), ✍️ nur mit bestätigten Infos:
- *Was ist der AKKI?* – Arbeitskreis KI der AG Digitalisierung der DGOU (siehe „Wer wir sind“).
- *Was ist das DGOU KI Lab?* – Digitales Fortbildungs- und Austauschformat, in der Regel monatlich, online.
- *Wie kann ich mich beteiligen?* – Über die vier Wege oben oder per E-Mail.
- *Kann ich eigene Forschungsideen einbringen?* – Ja, schreiben Sie uns.
- *Brauche ich Programmierkenntnisse?* – Nein; beim Hackathon z. B. ausdrücklich nicht erforderlich.
- *Wo finde ich vergangene Vorträge?* – Im Archiv auf der KI-Lab-Seite.

---

## I. Footer, Impressum, Datenschutz

### I1. Footer (alle Seiten identisch, `--navy`)
Spalte 1: Wortmarke AKKI (hell) + „Arbeitskreis Künstliche Intelligenz · AG Digitalisierung · DGOU“ · Spalte 2: Links Start, KI Lab, Projekte, Publikationen · Spalte 3: Kontakt (zentral), GitHub, DGOU, AG Digitalisierung · Zeile unten: Partner: AK Medien und digitale Systeme · Impressum · Datenschutz · Pflichthinweis Prototyp.

### I2. Impressum – Korrektur
- ❓ **Vereinsregisternummer widersprüchlich:** DGOU-Impressum nennt **VR 3956**, die Satzung 2026 **VR 3953**. Bis zur Klärung mit der DGOU-Geschäftsstelle die Angabe aus dem **offiziellen DGOU-Impressum (VR 3956)** beibehalten und den Widerspruch in „Offene Punkte“ eintragen.
- Alles andere bleibt (DGOU als Betreiberin, inhaltlich verantwortlich Braun/Baur, kein OS-Plattform-Link).

### I3. Datenschutz
Quellcode erneut prüfen (externe Verbindungen, Cookies, Tracking, eingebundene Dienste) und die Erklärung nur auf tatsächliche Verarbeitungen stützen. Mailto-Links erwähnen, keine Formulare, keine externen Schriften. ❓ Speicherdauer bei E-Mail-Kontakt und zuständige Aufsichtsbehörde intern klären – bis dahin neutral formulieren („nach Erledigung der Anfrage, soweit keine gesetzlichen Aufbewahrungspflichten bestehen“) statt `[OFFEN]` anzuzeigen.

---

## J. Qualitätskontrolle (nach jedem größeren Block kurz, am Ende vollständig)

- Alle Menüpunkte, Buttons, internen und externen Links funktionieren
- Keine sichtbaren Platzhalter, keine doppelten Inhalte, keine abgelaufenen „nächsten Termine“
- Handy-Ansicht bei 380 px ohne seitliches Scrollen; mobiles Menü
- Tastaturbedienung, sichtbarer Fokus, Kontraste, Alt-Texte, eine `h1` pro Seite
- `prefers-reduced-motion` (Logo steht still)
- Browser-Konsole ohne Fehler; Seiten über `http://localhost:3000` und ohne `server.js` (statisch wie auf Vercel)
- Keine Verbindung zu Google oder anderen Drittanbietern
- Liste aller noch nicht bestätigten Angaben in `inhalte.md` → „Offene Punkte“ aktualisieren

---

## K. Smart Editor (danach)

Läuft nur lokal (`redaktion/`). Ausbau:
1. **DOI- oder PubMed-ID-Import** über Crossref (bzw. PubMed E-Utilities): Titel, Autor:innen, Journal, Datum, DOI, PMID, Abstract falls verfügbar; **Dublettenprüfung** gegen `publikationen.json`.
2. **KI-Entwurf** (nur mit API-Schlüssel in `.env`, nur serverseitig): deutsche Kurzfassung, Fragestellung, Methodik, Relevanz für O&U, Limitationen, Themen; **Evidence Check**: Studientyp, Anwendungsbereich, externe Validierung, klinische Einsatzreife. Fehlendes als „nicht verfügbar“ markieren, nichts erfinden. Systemprompt-Regeln aus `KONZEPT.md` Abschnitt 4 erst nach Teamfreigabe verwenden.
3. **Freigabe:** Entwurf → Prüfung → „Freigegeben von“ → Eintrag in `publikationen.json` bzw. `beitraege.json` → Commit → Push durch das Team.
4. **Ohne API-Schlüssel** zeigt der Editor die Felder zum manuellen Ausfüllen. Eine Demo ohne echte KI ausdrücklich als „Demonstration ohne KI-Anbindung“ kennzeichnen – nie eine Simulation als echte Funktion ausgeben.
5. Keine Patientendaten, keine vertraulichen Forschungsdaten.

---

## L. Offene Fragen an das Team / David

1. AKKI-Leitung bestätigen (Baur, Osterhoff) inkl. Titel
2. Aktuelle Arbeitskreise der AG und deren Leitungen (Team: drei AKs; recherchiert: Medien und digitale Systeme, Weißbuch, S3-Leitlinie)
3. Gründung AKKI Januar 2021 bestätigen
4. `akki@dgou.de` einrichten lassen
5. KI Lab: aktueller Rhythmus, Ablauf, Teilnahmebedingungen, nächster bestätigter Termin, Auftakt Dez. 2025, Termine Juni/Oktober
6. Referentin 15.09.2026 (Anna Klempert oder Anna Völker)
7. Status der Forschungsprojekte (Wunddokumentation)
8. Freigabe von Personen- und Veranstaltungsfotos
9. Vereinsregisternummer VR 3956 oder VR 3953
10. Datenschutz: Speicherdauer E-Mail-Kontakt, zuständige Aufsichtsbehörde
11. Freigabe der redaktionellen Texte (✍️) und der drei Schwerpunkte
12. API-Schlüssel für den Smart Editor
