# Designkonzept KrautKompass

## Idee

**„Apotheken-Klarheit trifft Tasting-Notizbuch.“**
KrautKompass ist die ruhige, hochwertige Ergänzung zum Kraut-Kurier-Shop: gleiche visuelle DNA
(weiß, Navy, Türkis, Jost), aber persönlicher – ein Notizbuch, in dem man Sorten wie Wein
verkostet und festhält. Der **Kompass** gibt Orientierung im Sortiment; er ist das einzige
wiederkehrende Bildmotiv (Kompassrose, Peilung, Ringe).

Bewusst **nicht**: Kiffer-Klischees (Neon, Rasta, Blätter überall), Werbesprache, Kaufaufforderungen.
Das passt zum medizinischen Kontext und zum Werbeverbot (§ 10 HWG).

## Prinzipien

1. **Ruhe vor Effekt** – viel Weißraum, wenige Farben, Inhalt (Sorte, Bewertung) steht im Vordergrund.
2. **Daten in Türkis** – alles Messbare (THC, Sterne, Wirkungs-Chips aktiv) nutzt den Akzent.
   So lernt das Auge: Türkis = Information.
3. **Navy handelt** – Primäraktionen, Navigation, Links.
4. **Grün ist Marke** – Kraut-Grün nur im Logo und in winzigen Akzenten, nie für UI-Zustände
   (sonst Verwechslung mit „Erfolg“).
5. **Mobil zuerst** – Bewerten passiert abends auf dem Sofa am Handy: große Touch-Ziele (≥ 44 px),
   Formulare einspaltig.
6. **Barrierearm** – Kontraste WCAG AA, sichtbarer Fokus (Türkis-Ring), `prefers-reduced-motion`.

## Farben

| Token | Wert | Verwendung |
|---|---|---|
| `--color-primary` | `#425C81` | Buttons, aktive Navigation, Links |
| `--color-primary-dark` | `#28374D` | Hover, Überschriften auf hellen Flächen |
| `--color-ink` | `#1B2638` | dunkle Markenflächen (Login-Panel) |
| `--color-accent` | `#2ACAB6` | Daten: Sterne, THC-Balken, aktive Chips, Fokus |
| `--color-brand-green` | `#7CB342` | nur Logo / Markenakzente |
| `--color-text` | `#1A1A1A` | Fließtext |
| `--color-text-muted` | `#737373` | Sekundärtext, Labels |
| `--color-border` | `#E4E7EC` | Linien, Rahmen |
| `--color-background` | `#F5F5F5` | Seitenhintergrund |
| `--color-surface` | `#FFFFFF` | Karten, Formulare |
| `--color-footer` | `#B2B3AD` | Footer (wie Shop) |
| Status | `--color-danger` `#F04438`, `--color-success` `#12B76A` | Fehler / Bestätigungen |

Auf `--color-ink` gilt: Text `#FFFFFF` bzw. `rgb(255 255 255 / 72%)`, Linien in Türkis mit niedriger Deckkraft.

## Typografie

Schrift **Jost** (wie der Shop), lokal ausgeliefert. Großbuchstaben mit Laufweite nur für
Navigation und kleine Labels („SORTEN“, „THC“).

| Stufe | Token | Größe / Gewicht |
|---|---|---|
| Display | `--text-display` | 40 px (mobil 30 px) / 500 |
| H1 | `--text-h1` | 28–32 px / 500 |
| H2 | `--text-h2` | 20 px / 500 |
| Body | `--text-body` | 16 px / 400, Zeilenhöhe 1.5 |
| Small | `--text-small` | 14 px |
| Micro | `--text-micro` | 12 px, Labels / Overlines (uppercase, 0.08em) |

## Form & Raum

- 8-px-Raster (`--space-1` … `--space-8`), Inhaltsbreite max. 1180 px
- Radien: 8 px Bedienelemente, 14 px Karten/Panels, Pill für Chips & Badges
- Schatten sparsam: Karten flach mit Rahmen, nur schwebende Elemente (Menü, Hover) mit Schatten
- Bewegung: 150–200 ms `ease-out`, nur Opazität/Transform; bei `prefers-reduced-motion` aus

## Motiv: Kompass

- **Wortmarke**: „Kraut“ in Grün, Kompassnadel als Trenner, „Kompass“ in Grau (hell: Weiß)
- **Kompassrose** als feine Linienzeichnung (Ringe, Peilstriche, Nadel) – groß und dezent auf
  dunklen Markenflächen, nie als Deko auf Inhaltsseiten
- **Bewertung**: halbe Sterne in Türkis (Skala 1–10 intern)

## Ton

Du-Form, kurz, freundlich, sachlich. Beschreiben statt anpreisen.
„Wie war's?“ statt „Jetzt bewerten und profitieren!“. Fehlermeldungen sagen, was zu tun ist.

## Screens (Reihenfolge)

1. **Login / Registrierung / Einrichtung** – Split-Layout: links Markenpanel (Ink + Kompassrose),
   rechts Formular. Mobil: kompakter Markenkopf über dem Formular. ✅ umgesetzt
2. Sortenübersicht – Kacheln im Shop-Stil, Filterleiste, Gruppenbewertung sichtbar
3. Sortendetail + Bewertungsformular – Bild groß, Fakten, Terpene, Bewertung als „Verkostungsnotiz“
4. Meine Bewertungen / Neues aus der Runde – Tagebuch-Liste
5. Verwaltung – funktional, gleiche Bausteine

Alle Werte liegen als CSS-Variablen in `src/styles/tokens.css`. Neue Screens verwenden nur Tokens,
keine festen Farbwerte.
