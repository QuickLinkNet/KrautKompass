# Abnahme 01 – Login (Apothecary 1.0)

Stand: 24.11.2026 · geprüft gegen `../acceptance-criteria.md` und `../reference.png`

## Screenshots (Demo-Instanz, keine echten Daten)

| Datei | Breakpoint |
|---|---|
| `login-desktop-1440.png` | Desktop 1440 × 900 |
| `login-desktop-1024.png` | Desktop 1024 × 768 (kleinster Split) |
| `login-tablet-768.png` | Tablet 768 × 1024 (@2x) |
| `passwort-vergessen-tablet-768.png` | Tablet, Passwort vergessen |
| `login-mobile-390.jpg` | iPhone 390 × 844 |
| `login-mobile-320.jpg` | kleinstes Handy 320 × 640 |

## Kriterien

| Kriterium | Ergebnis |
|---|---|
| Referenzlayout bei 1440, 1024, 768, 390, 320 px, kein horizontaler Scroll | ✅ `scrollWidth == clientWidth` bei allen Breiten gemessen |
| Lokale Assets, echte HTML-Texte | ✅ Logo/Foto/Favicon/App-Icon direkt aus `design/assets`, alle Texte HTML, Schriften lokal |
| Tastatur, Labels, Fokus, Fehleransage, Kontrast AA | ✅ Login komplett per Tab/Enter; Labels per `for`; Fokus sichtbar; Fehler `role="alert"`, Feldfehler per `aria-describedby`, Fokus springt aufs erste fehlerhafte Feld; Kontraste: Text 14,7 : 1, Sekundärtext 6,7 : 1, Platzhalter 4,6 : 1, Feldrahmen 3,2 : 1 |
| Login, Logout, ungültige Daten, Netzwerkfehler, Ladezustand | ✅ im Browser getestet (leeres Formular, falsches Passwort, simulierter Netzwerkausfall, verzögerte Antwort mit Spinner + `aria-busy`) |
| Keine öffentliche Registrierung, Einladung einmalig/befristet/geprüft | ✅ unverändert serverseitig (bestehende Tests) |
| Bestehende Auth und API erhalten, keine Mock-Auth | ✅ nur Ergänzungen: `/auth/password/forgot`, `/auth/password/reset`, `features`/`legal` im Status |
| Keine Secrets/Zugangsdaten im Git | ✅ `config/local.php`, Datenbank, Logs, Sessions sind ignoriert |
| Build, Typecheck, Tests | ✅ 24 Frontend-Tests, 32 API-Tests, Build ohne CSP-Verstöße |

Zusätzlich: Passwort-Reset end-to-end getestet (Anfrage → Mail im Dev-Log → Link → neues Passwort →
alter Link abgelehnt → Login mit neuem Passwort). iPhone-Details: 16-px-Felder (kein Auto-Zoom),
Safe Areas, `100dvh`, Apple-Touch-Icon, passende `autocomplete`-Werte für den Schlüsselbund.

## Abweichungen von der Referenz (bewusst)

- **Kein Burger-Menü** im Tablet-/Handy-Kopf: die Spezifikation verlangt „keine sinnlose Navigation im Auth-Bereich“.
- **„Angemeldet bleiben“** aus dem Asset-Board fehlt: nicht in der verbindlichen Referenz. Sitzungen halten ohnehin 30 Tage.
- **Feldrahmen etwas dunkler** als `border` aus den Tokens, damit sie WCAG 1.4.11 (3 : 1) erfüllen.

## Offene Punkte

1. ~~**Bildqualität:** Die Fotos sind laut Kit hochskalierte Ausschnitte. Auf Tablets und Retina-Displays
   ist die Blüte sichtbar pixelig. `login-mobile.webp` wird deshalb nicht verwendet (noch unschärfer);
   alle Breakpoints nutzen `login-desktop.webp` mit angepasstem Ausschnitt. → Bitte echtes HD-Foto (≥ 2400 px) nachliefern.~~ Erledigt am 26.11.2026 mit neuen, nativ erzeugten Fotos (`design/marke/`).
2. ~~**Logo-Schrift:** Die SVG-Wortmarke ist eine fette Serif-Nachzeichnung, in der Referenz wirkt sie leichter.
   Verwendet wird unverändert das gelieferte Asset.~~ Erledigt am 26.11.2026, neues Logo.
3. **Mailversand für den Reset** muss auf dem Server konfiguriert werden (`app.url`, `mail.transport`, `mail.from`).
   Ohne Konfiguration erklärt die Seite, dass der Reset nicht eingerichtet ist (keine vorgetäuschte Funktion).
4. **Admin-Reset als Fallback** fehlt noch (wenn kein Mailversand möglich ist).
5. **Impressum/Datenschutz:** werden automatisch verlinkt, sobald `legal.*` gesetzt ist. Ob sie für die
   private Runde nötig sind, bitte rechtlich klären.
6. Bestehende App-Screens (Sorten, Bewertungen, Verwaltung) übernehmen nur die neuen Tokens; ihr
   eigentliches Screendesign folgt laut Absprache separat.
