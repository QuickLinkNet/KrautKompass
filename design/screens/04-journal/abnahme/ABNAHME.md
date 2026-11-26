# Abnahme Screen 04 „Journal / Dein Kompass“ (26.11.2026)

Gebaut nach `../reference.webp` und `../reference-iphone.webp`, Abweichungen siehe `../PRUEFUNG.md`.
Lokale Probedaten: 5 Bewertungen, 3 gemerkte Sorten (Testkonto „CT“).

| Bild | Inhalt |
|---|---|
| `uebersicht.png` | iPhone oben, Filter-Sheet, Desktop |
| `journal-mobile-390.jpg` | iPhone, ganze Seite |
| `journal-mobile-390-filter.jpg` | Filter-Sheet mit zwei aktiven Filtern |
| `journal-mobile-390-merkliste.jpg` | Merkliste |
| `journal-tablet-768.jpg` | Tablet |
| `journal-desktop-1440.png`, `…-filtermenue.png` | Desktop, Filtermenü „Wirkung“ offen |

## Funktion (geprüft im Browser)
- Überblick, Top 3 (am Handy wischbar), Umschalter Bewertungen/Merkliste mit Anzahl
- Suche, Sortierung (Neueste, Beste, Älteste), Filter: ab Sterne, Wirkung, Konsumform, „Würde ich wieder nehmen“,
  Sichtbarkeit. Alles steht in der URL und bleibt beim Neuladen und mit der Zurück-Taste erhalten.
- Handy: Suche und Filter kleben unter der Kopfzeile, Filter im Sheet mit „Anzeigen (n)“
- „Bearbeiten“ öffnet direkt das Bewerten auf der Sortenseite
- Merkliste: Herz entfernt die Sorte sofort (bei Fehler kommt sie zurück)
- Leer, keine Treffer (setzt Filter und Suche zurück), Laden, Fehler mit „Erneut versuchen“
- Kein seitliches Scrollen bei 390 px; 46 Frontend- und 47 API-Tests grün

## Nicht geprüft
Echtes iPhone. Die Top-3-Reihe hat keine Punkte unter den Karten (die nächste Karte schaut an).
