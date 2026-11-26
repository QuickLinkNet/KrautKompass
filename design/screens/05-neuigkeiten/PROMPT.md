# Prompt für die Design-KI – Screen 05 „Neuigkeiten“

Einen Prompt senden. Anhängen:

1. `design/screens/04-journal/reference.webp` (aktueller Stil, Karten, Filter)
2. `design/screens/03-sorte-bewertung/reference-detail.webp` (Kopf, Bewertungen der Runde)
3. `design/assets/logo.png`
4. `design/tokens.json`

Bitte das Board als PNG/WebP, mindestens 2000 px breit, dazu ein Bild nur mit den iPhone-Ansichten.

---

## Prompt

Gestalte den nächsten Screen für KrautKompass, eine private Web-App, in der eine kleine eingeladene Runde
medizinische Cannabis-Sorten bewertet. Die angehängten Bilder sind verbindlich: gleiche Designrichtung „Apothecary“,
gleicher Kopf, gleiche Buttons, Chips, Karten, Sterne und Schriften. Farben und Abstände nur aus der angehängten
tokens.json. Logo exakt wie angehängt. Keine neuen Stilelemente, kein Glas, kein Neon, kein Dark Mode.

Der Screen heißt „Neuigkeiten“. Er zeigt, was in der Runde passiert ist: geteilte Bewertungen der Mitglieder und
neue Sorten im Katalog. Die Runde ist klein (drei bis zehn Personen), die App wird vor allem auf dem iPhone genutzt,
auch als installierte App.

Board wie bei den letzten Screens: Desktop (1440), Tablet (768) und iPhone (390), das iPhone groß und mehrfach
(oben, weitergescrollt, gefiltert, leer), darunter „Komponenten (Auszug)“.

Navigation exakt so: Sortenkatalog · Journal · Neuigkeiten (aktiv) · Verwaltung, rechts ein Kreis mit Initialen.
Auf dem iPhone: Logo, Initialen-Kreis, Menü-Symbol (keine zweite Navigationszeile).

Inhalt von oben nach unten:

1. Überschrift „Neuigkeiten“, darunter „Was die Runde zuletzt geteilt hat.“
2. „Neu im Katalog“: eine waagerechte, wischbare Reihe kleiner Sortenkarten (Foto mit weißem Hintergrund aus dem Shop,
   Name, Hersteller, THC/CBD, Kennzeichnung „Neu“). Am Ende der Reihe „Alle im Katalog ansehen →“.
3. „Aus der Runde“: Filter-Chips nach Person: „Alle“ · „Carsten“ · „Kathrin“ · „Du“, daneben ein eigener Chip
   „♥ Meine Merkliste“ (zeigt nur Einträge zu Sorten, die ich mit dem Herz gemerkt habe; kombinierbar mit der Person)
4. Zeitleiste der geteilten Bewertungen, nach Tagen gruppiert („Heute“, „Gestern“, „Montag, 23.11.“):
   - Kreis mit Initialen, Satz „Kathrin hat Platinum Garlic bewertet“ (eigene Einträge: „Du hast … bewertet“), Uhrzeit
   - kleines Produktfoto, Gesamtsterne mit Zahl (halbe Sterne möglich, z. B. 4,5), Konsumform
   - bis zu drei Wirkungs-Chips, Nebenwirkungen dezent andersfarbig, Notiz gekürzt auf drei Zeilen
   - Tippen öffnet die Sortenseite
   - wurde eine Bewertung geändert: kleiner Hinweis „aktualisiert“
5. Unten „Ältere laden“

Zustände in der Komponentenleiste:
- Noch nichts geteilt: „Hier ist es noch ruhig. Teile eine Bewertung mit der Runde – dann erscheint sie hier.“
  mit Button „Zum Sortenkatalog“
- Keine Einträge für die gewählte Person: „Kathrin hat noch nichts geteilt.“
- Keine Einträge zur Merkliste: „Zu deinen gemerkten Sorten hat noch niemand etwas geteilt.“
- Ladezustand (Skelett) und Fehler „Neuigkeiten konnten nicht geladen werden“ mit „Erneut versuchen“

Regeln: Alle Texte deutsch und exakt so geschrieben. Textkontrast mindestens WCAG AA, Touch-Flächen mindestens
44 px, Auswahl nie nur durch Farbe. Keine medizinischen Wirkungsversprechen und keine Empfehlungen. Keine Funktionen
dazuerfinden: keine Likes, keine Kommentare, keine Glocke, keine Benachrichtigungen, kein Chat, keine Follower.

Liefere zusätzlich eine kurze Textbeschreibung: Abstände, Schriftgrößen, Verhalten beim Scrollen und Unterschiede
zwischen iPhone, Tablet und Desktop.
