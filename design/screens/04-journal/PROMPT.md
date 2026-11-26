# Prompt für die Design-KI – Screen 04 „Journal“ (Dein Kompass)

Einen Prompt senden. Anhängen:

1. `design/screens/03-sorte-bewertung/reference-detail.webp` (aktueller Stil, Kopf, Karten)
2. `design/screens/02-sortenkatalog/reference.webp` (Produktkarten, Filter)
3. `design/assets/logo.png`
4. `design/tokens.json`

Bitte das Board als PNG/WebP, mindestens 2000 px breit, dazu ein Bild nur mit den iPhone-Ansichten.

---

## Prompt

Gestalte den nächsten Screen für KrautKompass, eine private Web-App, in der eine kleine eingeladene Runde
medizinische Cannabis-Sorten bewertet. Die angehängten Bilder sind verbindlich: gleiche Designrichtung „Apothecary“,
gleicher Kopf, gleiche Buttons, Chips, Karten, Sterne und Schriften. Farben und Abstände nur aus der angehängten
tokens.json. Logo exakt wie angehängt. Keine neuen Stilelemente, kein Glas, kein Neon, kein Dark Mode.

Der Screen heißt „Journal“ (Navigation) und trägt die Überschrift „Dein Kompass“. Er zeigt nur die eigenen Daten
der angemeldeten Person. Die App wird vor allem auf dem iPhone genutzt, auch als installierte App.

Board wie bei den letzten Screens: Desktop (1440), Tablet (768) und iPhone (390), das iPhone groß und mehrfach
(oben, weitergescrollt, Merkliste, Filter offen), darunter „Komponenten (Auszug)“.

Navigation exakt so: Sortenkatalog · Journal (aktiv) · Neuigkeiten · Verwaltung, rechts ein Kreis mit Initialen.
Auf dem iPhone: Logo, Initialen-Kreis, Menü-Symbol.

Inhalt von oben nach unten:

1. Überschrift „Dein Kompass“, darunter „Deine Bewertungen und deine Merkliste – nur für dich sichtbar.“
2. Überblick in einer ruhigen Leiste oder kleinen Karten, alles aus den eigenen Bewertungen berechnet:
   - „12 Bewertungen“
   - „Ø 4,1 Sterne“
   - „8 würdest du wieder nehmen“
   - „Am häufigsten: Entspannend · Schlaffördernd · Glücklich“ (Chips)
   - „Meist per Vaporizer“
3. „Deine Top 3“: die drei am besten bewerteten Sorten, klein mit Foto, Name und Sternen
4. Umschalter „Bewertungen (12)“ / „Merkliste (5)“
5. Bewertungen:
   - Suchfeld „Sorte suchen …“, Sortierung „Neueste zuerst“ (weitere: „Beste Bewertung“, „Älteste zuerst“)
   - Filter (iPhone als Sheet, Desktop als Leiste): „ab Sterne“, Wirkung, Konsumform, „Würde ich wieder nehmen“,
     Sichtbarkeit („Nur für mich“ / „Mit der Runde geteilt“)
   - Liste von Bewertungs-Karten: Produktfoto (weißer Hintergrund aus dem Shop), Sortenname, Gesamtsterne mit Zahl
     (halbe Sterne möglich, z. B. 4,5), Datum „Probiert am 12.11.2026“, Konsumform, bis zu drei Wirkungs-Chips,
     Nebenwirkungen dezent andersfarbig, Notiz gekürzt auf zwei Zeilen, Kennzeichnung „Nur für dich“ oder
     „Mit der Runde geteilt“, kleines „Würde ich wieder nehmen“ wenn zutreffend.
     Tippen öffnet die Sortenseite, Aktion „Bearbeiten“.
6. Merkliste: gemerkte Sorten als Produktkarten wie im Sortenkatalog (Foto, Name, Hersteller, THC/CBD,
   „Verfügbar“/„Nicht verfügbar“, Herz aktiv), Hauptaktion „Jetzt bewerten“

Zustände in der Komponentenleiste:
- Noch keine Bewertung: „Dein Kompass ist noch leer. Bewerte deine erste Sorte – nach und nach siehst du hier,
  was dir guttut.“ mit Button „Zum Sortenkatalog“
- Leere Merkliste: „Noch nichts gemerkt. Tippe im Katalog auf das Herz.“
- Keine Treffer für die Filter: „Keine Bewertung passt zu deinen Filtern.“ mit „Filter zurücksetzen“
- Ladezustand (Skelett) und Fehler „Journal konnte nicht geladen werden“ mit „Erneut versuchen“

Regeln: Alle Texte deutsch und exakt so geschrieben. Textkontrast mindestens WCAG AA, Touch-Flächen mindestens
44 px, Auswahl nie nur durch Farbe. Keine medizinischen Wirkungsversprechen und keine Empfehlungen. Keine Felder,
Diagramme, Zahlen oder Funktionen dazuerfinden (kein Export, keine Kalender-Heatmap, keine Punkte, kein Warenkorb).

Liefere zusätzlich eine kurze Textbeschreibung: Abstände, Schriftgrößen, Verhalten beim Scrollen und Unterschiede
zwischen iPhone, Tablet und Desktop.
