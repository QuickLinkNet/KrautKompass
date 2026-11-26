# Prüfung Screen 04 „Journal / Dein Kompass“ (26.11.2026)

Vorlagen: `reference.webp` (Board), `reference-iphone.webp` (iPhone). Passt zum Prompt und zum Stil von Screen 02/03.

## Übernehmen
- Überschrift, Überblick (Anzahl, Ø Sterne, „würdest du wieder nehmen“, häufigste Wirkungen, „Meist per …“), Top 3
- Umschalter Bewertungen / Merkliste mit Anzahl, Suche, Sortierung, Filter (Desktop als Leiste, iPhone als Sheet)
- Bewertungs-Karte: Foto, Name, Sterne, „Probiert am“, Konsumform, Wirkungen, Nebenwirkungen, Notiz (2 Zeilen),
  Sichtbarkeit, „Würde ich wieder nehmen“, „Bearbeiten“
- Merkliste als Produktkarten mit „Jetzt bewerten“; alle Leer-, Lade- und Fehlerzustände
- iPhone: Top 3 als wischbare Reihe, Suche/Filter kleben beim Scrollen, Filter und Sortierung bleiben gespeichert (URL)

## Abweichungen, bewusst nach den echten Daten
- Wirkungen, Nebenwirkungen und Konsumformen: das Vokabular der App (z. B. „Fokussiert“ statt „Fokus“,
  „Joint/Bong/Pfeife“ statt „Rauchen“, „Müdigkeit“ statt „Müde“)
- „Würde ich wieder nehmen“: Alle / Ja / Vielleicht / Nein (die App kennt „Vielleicht“)
- Kopf auf dem iPhone bleibt wie abgenommen (Logo, Initialen, Menü), nicht die zweite Navigationszeile aus Bild 2
- Herz auf der Bewertungs-Karte (Bild 2) entfällt: die Karte gehört zur Bewertung, das Merken passiert auf der Sorte
- Produktfotos haben im Shop weißen Hintergrund (wie auf der Sortenseite gelöst)

## Technik
- Alles aus vorhandenen Daten (`/api/ratings/mine`, Katalog mit `favorites=1`), Überblick wird im Browser berechnet
- Keine neuen Felder, keine Datenbankänderung
