# Abnahme: Logo und Kopffotos (26.11.2026)

Quellen: `../logo-original.webp`, `../katalog-original.webp`, `../login-original.webp` (Design-KI, Auftrag in `../PROMPT.md`).

## Was eingebaut ist
- **Logo** als SVG nachgezogen (952 : 201) in Grün und Weiß, dazu Blatt allein, Favicon (SVG + PNG 512) und
  App-Icon 512 (vollflächig grün, damit iOS keine schwarzen Ecken zeigt). Größen im Kopf: 28 / 34 / 48 px.
- **Sortenkatalog:** Querformat-Foto, Blüte rechts, läuft ins Grün aus. Ausschnitt je Breite angepasst.
- **Login:** Desktop Hochformat, Tablet und Handy Querformat derselben Aufnahme (`<picture>`).
- Fotos als WebP: 142 KB (hoch) und 179 KB (quer). Die alten, hochskalierten Dateien sind ersetzt.

## Geprüft (Edge, exakte Viewports, Text für die Messung ausgeblendet)
Kontrast der hellen Schrift auf dem Foto, schlechteste 5 % der Pixel hinter dem Text:

| Breite | Login Claim | Login Unterzeile | Katalog Überschrift | Katalog Text |
|---|---|---|---|---|
| 320 | 10,7 : 1 | 5,9 : 1 | 4,9 : 1 (große Schrift, Ziel 3 : 1) | – |
| 390 | 13,9 : 1 | 6,4 : 1 | 11,7 : 1 | – |
| 768 | 14,4 : 1 | 10,2 : 1 | 11,7 : 1 | 8,4 : 1 |
| 1024 | 6,8 : 1 | 9,8 : 1 | 11,7 : 1 | 8,4 : 1 |
| 1440 | 7,2 : 1 | 10,2 : 1 | 11,7 : 1 | 8,4 : 1 |
| 1920 | 8,0 : 1 | 10,1 : 1 | 11,7 : 1 | 8,4 : 1 |

Auf dem Handy-Login wurde der Verlauf links verstärkt (vorher Unterzeile 4,3 : 1). Einzelne helle Harzpunkte
liegen unter großen Buchstaben, die Fläche bleibt über AA. Kein horizontales Scrollen von 320 bis 1920 px.
Typecheck, 37 Frontend-Tests, 43 API-Tests und Build laufen.

## Bilder
`logo.png`, `login-390.jpg`, `login-768.jpg`, `login-1440.png`, `katalog-320.jpg`, `katalog-390.jpg`,
`katalog-768.jpg`, `katalog-1440.png`, `katalog-1920.png` (lokales Testkonto, daher „CT“ im Kreis).

## Nicht geprüft
Echtes iPhone und Retina-Schärfe auf dem Gerät. Das Hochformat hat 1024 px Breite: Auf Desktop-Retina ist es
minimal weicher als die Schrift, das Bokeh fängt das ab.
