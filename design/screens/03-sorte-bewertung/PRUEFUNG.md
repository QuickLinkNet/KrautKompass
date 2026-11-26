# Prüfung der Lieferung 03 – Sorte & Bewertung

Stand: 25.11.2026 · geprüft gegen `PROMPT.md`, tokens.json und die vorhandenen Daten.
**Ergebnis: baubar, kein Korrektur-Prompt nötig.** Noch nicht gebaut.

Referenzen: `reference-detail.webp`, `reference-detail-iphone.webp`, `reference-bewerten.webp`, `reference-bewerten-iphone.webp`.
Die Bilder sind rund 1450 px breit statt der gewünschten 2000 px, alle Texte sind aber lesbar. Die Textbeschreibung
(Abstände, Schriftgrößen) liegt nicht vor; dafür gelten tokens.json und die Komponenten aus Screen 02.

## Was beim Bauen anders wird

| Im Bild | Umsetzung | Grund |
|---|---|---|
| „Jetzt bewerten“ auch bei vorhandener Bewertung | Dann heißt der feste Button „Bewertung ändern“ | Zwei Buttons für dasselbe |
| „Weitere Bewertung erfassen“ | entfällt | Erfunden; je Person und Sorte gibt es eine Bewertung |
| „Bewertung löschen“ auf der Bestätigung | unten im Formular beim Ändern | So war es beauftragt; nach dem Speichern wäre es ein Fehlklick-Risiko |
| Roter Hinweis schon beim leeren Formular | neutraler Hinweis, rot erst nach dem Versuch zu speichern | Kein Fehler, bevor jemand etwas getan hat |
| Grauer Button mit weißer Schrift | lesbarer deaktivierter Zustand | Kontrast 1,5 : 1 statt 4,5 : 1 |
| Mittelgrüne Chips und Buttons | `primary` mit weißer Schrift | Farbton fehlt in den Tokens; Weiß auf `secondary` hätte nur 3,6 : 1 |
| Sterne 4,3 und 4,7 beide als vier volle | anteilig gefüllt | Bild widerspricht der Zahl |
| „Inhalation“, „Müde“ | „Vaporizer“ usw., „Müdigkeit“ | Vorhandene Auswahlwerte |
| 8 von 12 Wirkungen | alle 12 | Im Bild abgeschnitten |
| Kleine Detailsterne | halbe Sterne antippen oder wischen, 44 px hoch | Halbe Sterne wären im Bild nicht treffbar |
| iPhone ohne Menü | Kreis wie im Bild, daneben das Menü | Sonst keine Navigation |
| Sichtbarkeit: mal Radios, mal Segmente | zwei Segmente mit Schloss- und Gruppensymbol | Besser treffbar, Auswahl nicht nur über Farbe |
| „Verwerfen“ grün als Hauptbutton | „Weiter bearbeiten“ ist hervorgehoben | Schützt vor Datenverlust |
| Cannabisblatt-Zeichnung auf der Bestätigung | entfällt | Nicht als Asset geliefert |
| Geschlossene Gruppen im Desktop-Dialog | gleicher Inhalt wie iPhone, Dialog scrollt | Im Bild fehlen Konsumform, Datum, Notizen |
| Preis „–“ | echter Preis, leere Zeilen entfallen | Preis liegt für alle 118 Sorten vor |

## Dafür im Backend nötig

- Zwei neue Felder: Blütenqualität (1–10, freiwillig) und „wieder nehmen“ (ja / vielleicht / nein, freiwillig)
- Auswertung „Das berichtet die Runde“: Wirkungen mit Anzahl und Durchschnitte, nur aus **geteilten** Bewertungen

## Datenlage (118 aktive Sorten)

Foto, Preis, Strain, Beschreibung: 118 · Herkunft: 101 · Dominanz: 65
