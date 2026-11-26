# Abnahme 03 – Sorte & Bewertung (Apothecary 1.0)

Stand: 25.11.2026 · geprüft gegen `../reference-*.webp` · Abweichungen mit Grund in `../PRUEFUNG.md`

## Screenshots (getrennte Demo-Kopie, erfundene Testpersonen, echte Sorten)

| Datei | Inhalt |
|---|---|
| `detail-desktop-1440.png`, `detail-tablet-768.jpg` | Sortenseite mit eigener Bewertung, komplett |
| `detail-mobile-390.jpg`, `detail-mobile-390-komplett.jpg` | iPhone, erster Blick und ganze Seite (im Gesamtbild liegt der feste Button mitten im Bild) |
| `detail-mobile-390-fehler.jpg` | Sorte konnte nicht geladen werden |
| `bewerten-mobile-390-leer.jpg` | Speichern ohne Gesamtbewertung |
| `bewerten-mobile-390-ausgefuellt.jpg`, `-unten.jpg` | Formular oben und unten |
| `bewerten-mobile-390-fehler.jpg`, `-gespeichert.jpg` | Speichern fehlgeschlagen / gespeichert |
| `bewerten-mobile-390-verwerfen.jpg`, `-loeschen.jpg` | Rückfragen |
| `bewerten-tablet-768.jpg`, `bewerten-desktop-1440.png` | Dialog |

## Geprüft

| Punkt | Ergebnis |
|---|---|
| Kein horizontaler Scroll bei 320 / 375 / 390 / 768 / 1024 / 1440 px, keine doppelten IDs | ✅ |
| Handy quer (844 × 390): Formular bedienbar, Fuß scrollt mit | ✅ |
| Halbe Sterne: Tippen und Wischen setzen den Wert, senkrechtes Scrollen über die Sterne ändert nichts | ✅ Touch-Simulation |
| Sterne per Tastatur und Screenreader (echtes `range`-Feld mit „4,5 von 5 Sternen“) | ✅ Aufbau geprüft, VoiceOver nicht |
| Anlegen, Ändern (vorausgefüllt), Löschen mit Rückfrage | ✅ |
| Ohne Gesamtbewertung: neutraler Hinweis, rot erst beim Speichern, Fokus auf die Sterne | ✅ |
| Speichern fehlgeschlagen: Eingaben bleiben, „Erneut versuchen“ klappt | ✅ |
| X, Escape und Zurück-Geste: ohne Änderung zu, mit Änderung Rückfrage, nichts geht verloren | ✅ |
| „Das berichtet die Runde“ zählt nur geteilte Bewertungen, auch die eigene private nicht | ✅ API-Test |
| Blütenqualität und „wieder nehmen“: speichern, leeren, ungültige Werte abgelehnt | ✅ API-Test |
| Bestehende Datenbank wird automatisch erweitert (Migration 000007) | ✅ an einer Kopie der lokalen Datenbank |
| Keine festen Farbwerte außerhalb der Tokens, keine Konsolenfehler | ✅ |
| Typecheck, 37 Frontend-Tests, 43 API-Tests, Build | ✅ |

## Nicht geprüft

- Echtes iPhone (Safari, VoiceOver, Datumsauswahl, Tastatur über dem Formular)
- Live-Server

## Auch geändert

- **Kopfzeile** nach der Vorlage: hellgrüner Initialen-Kreis auf allen Breiten, Tablet-Navigation in zweiter Zeile, Zahnrad für Verwaltung, kräftigere Schrift. Menüs schließen per Klick daneben und Escape. Die älteren Screenshots hier zeigen noch den alten Kopf.
- **Sterne im Katalog sind jetzt grün statt gold**, wie in beiden Design-Vorlagen auf den Karten.
- Wirkungs-Chips haben Häkchen und 44 px Höhe. Die alten Bausteine ScoreInput, StatBar und RatingForm sind ersetzt.
- Journal, Neuigkeiten und Verwaltung sind unverändert und warten auf ihr Design.

## Offen

0. ~~Logo und Kopffoto~~ – erledigt am 26.11.2026, siehe `design/marke/abnahme/ABNAHME.md`.
1. **CBD:** Der Shop schreibt bei vielen Sorten „< 1,0 %“, die App zeigt „1,0 %“.
2. **Beschreibung:** Fehlt im Shop die Herkunft, steht dort „wird in produziert“ – kommt so aus dem Shop.
3. Preis ohne Einheit: Aus den Shop-Daten geht nicht hervor, ob pro Gramm. Deshalb „Preis laut Shop“.
