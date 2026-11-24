# Designsystem KrautKompass – „Apothecary“ (Version 1.0)

**Verbindliche Quelle ist das Design-Kit in [`design/`](../design):**

| Datei | Bedeutung |
|---|---|
| `design/tokens.json` | Rohwerte (Farben, Schriften, Abstände, Radien, Breakpoints) – maßgeblich |
| `design/screens/01-login/reference.png` | verbindliche visuelle Referenz für den Login |
| `design/screens/01-login/design-spec.md`, `acceptance-criteria.md` | Spezifikation und Abnahme |
| `design/design-system.md`, `design/IMPLEMENTIERUNG.md` | Leitlinien der Design-KI |
| `design/assets/` | Logos (SVG/PNG), Favicon, App-Icon, Hintergrundfotos (WebP) |
| `design/asset-board.png` | ergänzend, **nicht** maßgeblich fürs Layout |

Weitere Screens werden vom Design separat geliefert und nicht eigenständig gestaltet.

## Leitidee

Helles Creme, Waldgrün, ruhige botanische Fotografie – wie eine moderne Apotheke.
Keine Glas- oder Neon-Effekte, keine Kiffer-Klischees, keine Wirkungsversprechen (§ 10 HWG).

## Tokens im Code

`src/styles/tokens.css` hat zwei Ebenen:

1. **`--token-*`**: Rohwerte 1:1 aus `design/tokens.json`. Der Test `src/styles/tokens.test.ts`
   schlägt fehl, sobald CSS und JSON auseinanderlaufen. Neue Kit-Version → JSON ersetzen → Test zeigt, was anzupassen ist.
2. **Semantische Tokens** – nur diese verwenden Komponenten:

| Token | Quelle | Verwendung |
|---|---|---|
| `--color-primary` / `-hover` | primary / text | Primärbutton, Links, Fokus |
| `--color-on-primary` | background | Text auf Waldgrün |
| `--color-background`, `--color-surface` | background (Creme) | Seite, Felder, Karten |
| `--color-surface-alt` | surface (Pergament) | weiche Flächen, Hover, Info |
| `--color-border` / `-strong` | border / textMuted | Linien, Rahmen, Sekundärbutton |
| `--color-text` / `-muted` | text / textMuted | Text (beide AA auf Creme) |
| `--color-danger` (+ `-soft`) | error | Fehler |
| `--color-success` (+ `-soft`) | primary | Bestätigungen |
| `--color-secondary`, `--color-accent`, `--color-gold` | Salbei, Oliv, Gold | **nur dekorativ** (Kontrast < AA) |
| `--color-on-dark`, `--color-scrim*` | aus background/text gemischt | Text und Verlauf auf Fotos |

Abgeleitete Töne entstehen per `color-mix()` aus Tokens – in Komponenten stehen **keine festen Farbwerte**.

## Typografie

- **Playfair Display** (Überschriften, Claim) und **Inter** (UI, Fließtext) als variable Webfonts,
  lokal über `@fontsource-variable/*` ausgeliefert (keine externen Requests). Der Browser lädt nur das
  benötigte Schriftsystem (Latin ≈ 87 KB für beide).
- Formularfelder immer 16 px (`--text-body`) – kleiner zoomt iOS Safari beim Antippen.

## Form & Raum

- 4-px-Raster (`--space-1` … `--space-8` = 4 … 64 px)
- Bedienelemente mindestens 48 px hoch (`--control-height`), Radius 8 px; Karten 16 px
- Formulare max. 440 px breit (`--form-max-width`)
- Fokus: 2 px Outline in Waldgrün bzw. Ring um Felder, immer sichtbar per Tastatur
- Bewegung 150–220 ms, bei `prefers-reduced-motion` aus

## Komponenten (Atomic Design)

| Ebene | Bausteine |
|---|---|
| Atome | `Icon` (lokale Linien-Icons, `filled`), `Logo` (SVG aus dem Kit), `Button` + `ButtonLink` (`icon`, `iconEnd`), `IconButton` (44 px, Pflicht-Label), `Input` (mit Icon/Bedienelement), `Choice` (Checkbox/Radio), `Divider`, `Badge` (Status + `metric`/`effect`/`plain` für Kennzahlen, Wirkungen, Terpene), `RatingStars`, `Card`, `Spinner` |
| Moleküle | `FormField` (Label, Hinweis, Fehler, `aria-describedby`), `PasswordField` (Schloss + Augen-Umschalter), `Alert` (Fehler/Erfolg/Info, `subtle`), `SearchField` (verzögert), `RangeField` (Doppel-Regler + Zahlenfelder), `FilterChip`, `Sheet` (Bottom-Sheet auf `<dialog>`) |
| Organismen | `AppHeader`, `AuthHero`, `CatalogHero`, `CatalogFilters`, `CatalogToolbar`, `ProductCard` (Liste/Kachel), `LoginForm`, `RegisterForm`, `SetupForm`, `ForgotPasswordForm`, `ResetPasswordForm` … |
| Templates | `AuthLayout` (Split/gestapelt, ohne Navigation), `AppLayout` + `PageContainer` |

Neue Icons kommen in `src/components/atoms/Icon/icons.tsx`, keine Icon-Bibliothek.

## Auth-Screens (umgesetzt)

- **Desktop ≥ 1024 px**: Split 52 : 48. Links Foto mit CSS-Verlauf, weißes Logo, Claim
  „Bewerten. Verstehen. Entdecken.“, Goldlinie, Unterzeile; das Foto bleibt beim Scrollen stehen.
  Rechts Creme, Formular zentriert.
- **Tablet / Handy**: Kopf mit Logo (keine Navigation), Bildband 200–240 px mit Claim, Formular als Karte
  mit gerundeten Ecken darüber. Safe Areas (iPhone-Notch/Home-Indicator) berücksichtigt.
- Login, Registrierung, Einrichtung, Passwort vergessen, neues Passwort nutzen dasselbe Template.
- Rechtstexte (Impressum/Datenschutz) erscheinen automatisch, sobald `legal.*` konfiguriert ist.

Abnahme-Screenshots: `design/screens/01-login/abnahme/`.

## Sortenkatalog (umgesetzt)

Referenz: `design/screens/02-sortenkatalog/reference.webp`, Abnahme im Unterordner `abnahme/`.

- **Desktop ≥ 1024 px**: Kopf mit Navigation (Sortenkatalog, Journal, Neuigkeiten, Verwaltung) und Konto-Menü,
  grünes Kopfband mit Foto, Filter-Seitenleiste (klebt beim Scrollen), Trefferzahl, Sortierung, Listen-/Kachelansicht,
  aktive Filter als Chips. Karte: Bild, Name (Playfair), Hersteller, THC/CBD, Terpene, Wirkungen, Sterne, Merken, „Details ansehen“.
- **Tablet**: Burger-Menü, Filter als Sheet, Pfeil im Kreis statt Button.
- **Handy**: Suche über der Liste, „Filter (n)“ + Sortierung, kompakte Karte, Wirkungen über die volle Breite.
- Bewertungen erscheinen wie überall in der App als Sterne von 5 (interne Skala 1–10 ÷ 2).
- Breiter Inhalt: `--content-width-wide` (1360 px).
