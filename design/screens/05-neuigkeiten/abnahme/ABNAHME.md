# Abnahme Screen 05 „Neuigkeiten“ + Mehrfach-Bewertungen (26.11.2026)

Vorlagen: `../reference.webp` (Bild 1, maßgeblich), `../reference-2.webp`. Lokale Testdaten: „Kathrin Test“ und „Carsten Test“.

## Neuigkeiten
- Grünes Kopfband mit Foto (wie Katalog), „Neu im Katalog“ als wischbare Reihe (zuletzt im Shop erschienen,
  „Neu“ = in den letzten 30 Tagen), „Alle im Katalog ansehen“ öffnet den Katalog nach „Neueste“
- „Aus der Runde“: nur mit der Runde geteilte Bewertungen (schon in der API), nach Tagen gruppiert
  („Heute“, „Gestern“, „Montag, 23.11.“), Hinweis „aktualisiert“ bei geänderten Bewertungen
- Filter: Person (Alle · Mitglieder · Du) und „♥ Meine Merkliste“, kombinierbar, stehen in der URL
- „Ältere laden“ lädt je 20 weitere; Leer-, Personen-, Merkliste-, Lade- und Fehlerzustand
- Bewusst nicht übernommen: Filter-Sheet mit Sternen/Wirkung aus Bild 2, Blatt-Deko (kein Asset)

## Mehrfach-Bewertungen
- Pro Sorte beliebig viele eigene Bewertungen (Tagebuch); Durchschnitt zählt alle Bewertungen
- Sortenseite: „Deine Bewertungen (n)“ mit „Bearbeiten“ je Eintrag, „Neue Bewertung“ oben, im Kopf und unten
- Journal: jede Bewertung einzeln, Top 3 zeigen jede Sorte nur einmal, „Bearbeiten“ öffnet genau diese Bewertung
- Datenbank-Migration 000008 (bestehende Bewertungen bleiben), API: POST /products/{id}/ratings,
  PUT/DELETE /ratings/{id}; fremde Bewertungen sind weder änder- noch löschbar (Test)

## Geprüft
390, 768, 1440 px im Browser; 50 Frontend- und 49 API-Tests grün. Nicht geprüft: echtes iPhone.
