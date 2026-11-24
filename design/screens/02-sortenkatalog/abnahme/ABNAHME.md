# Abnahme 02 – Sortenkatalog / Produktsuche (Apothecary 1.0)

Stand: 24.11.2026 · geprüft gegen `../reference.webp` · Startseite nach dem Login (`/`)

## Screenshots (lokale Demo-Instanz, Demo-Bewertungen von drei Testpersonen)

| Datei | Breakpoint |
|---|---|
| `katalog-desktop-1440.png` | Desktop 1440 × 900, Listenansicht |
| `katalog-desktop-1440-kacheln-filter.png` | Desktop, Kachelansicht mit aktiven Filtern (THC ab 22 %, zwei Wirkungen, verfügbar) |
| `katalog-tablet-768.png` | Tablet 768 × 1024 (@2x) |
| `katalog-mobile-390.jpg` | iPhone 390 × 844 (@3x) |
| `katalog-mobile-390-filter.jpg` | iPhone, Filter-Sheet geöffnet |
| `katalog-mobile-390-menue.jpg` | iPhone, Menü geöffnet |

## Geprüft

| Punkt | Ergebnis |
|---|---|
| Layout bei 1440 / 1024 / 768 / 390 / 375 px, kein horizontaler Scroll | ✅ |
| Suche (verzögert), Hersteller, THC/CBD-Spanne, Terpen, Wirkung, Mindestbewertung, Verfügbarkeit, Merkliste | ✅ im Browser und per API-Test (`CatalogTest`) |
| Filter-Chips entfernen, „Alle zurücksetzen“, Sortierung (5 Optionen aus dem Design), Liste/Kachel | ✅ |
| Filter in der URL: teilbar, Zurück-Taste und „← Alle Sorten“ führen zur gefilterten Liste | ✅ |
| „Weitere Sorten laden“ (24 pro Seite) | ✅ |
| Merkliste: sofortige Anzeige, bei Fehler zurückgenommen, nur für die eigene Person | ✅ |
| Filter-Sheet: Fokus im Sheet, Escape/Tipp daneben schließt, Seite dahinter scrollt nicht mit | ✅ |
| Tastatur & Screenreader: Name ist der Link (ganze Karte klickbar), Herz mit Namen + `aria-pressed`, Trefferzahl als Live-Region, Sterne mit Text, eindeutige IDs | ✅ |
| Touch-Ziele ≥ 44 px, Felder 16 px (kein iOS-Zoom), Safe Areas | ✅ |
| Keine festen Farbwerte, nur Tokens; keine Inline-Skripte/-Styles im Build (CSP) | ✅ |
| Typecheck, 28 Frontend-Tests, 40 API-Tests, Build | ✅ |

## Abweichungen vom Design (bewusst)

- **„Wissen“ und die Glocke fehlen** in der Navigation: Dafür gibt es noch keine Funktion, und nichts soll nur so tun als ob.
  Navigation: Sortenkatalog · Journal (= Meine Bewertungen) · Neuigkeiten · Verwaltung (nur Admins).
  Avatar zeigt Initialen (keine Profilfotos), dahinter Name, E-Mail, Abmelden.
- **Wirkung kommt aus den Bewertungen der Runde.** Der Shop liefert keine Wirkungsangaben, deshalb zeigen Karten und Filter,
  was die Gruppe berichtet. Bezeichnungen aus dem Bewertungsformular: Entspannend, Fokussiert, Schlaffördernd, Kreativ (+ weitere aufklappbar).
- **Sterne von 5** wie im Rest der App (interne Skala 1–10 ÷ 2), Zahl in Klammern = Anzahl geteilter Bewertungen.
- **Sortierung als natives Auswahlfeld** statt eigenem Dropdown: Auf dem iPhone öffnet sich so die gewohnte Auswahl.
- **Merkliste bekommt zusätzlich den Filter „Nur meine Merkliste“**, sonst hätte das Herz keinen Nutzen.
- **Kachelansicht nur ab Tablet** (auf dem Handy gibt es im Design keinen Umschalter).
- THC/CBD-Regler reichen bis zum höchsten Wert im Katalog (aktuell 33 % bzw. 1 %), nicht bis 30/20 %.
- Kopfband nutzt das Foto aus dem Login-Kit (einziges freigegebenes Foto).

## Offene Punkte

1. **Screendesigns für Sorten-Detail, Journal, Neuigkeiten und Verwaltung** – die Seiten übernehmen bisher nur Tokens,
   Kopf und Rahmen. Die Komponenten aus dem Board (z. B. „Auf Merkliste“-Button) sind für die Detailseite vorgesehen.
2. **CBD-Werte im Shop-Abgleich prüfen:** Viele Sorten kommen mit genau 1,0 % an – vermutlich „< 1 %“ aus der Shop-Liste.
3. Produktfotos stammen aus dem Shop (weißer Hintergrund, Cannaleo-Wasserzeichen) – Bildrechte siehe README.
4. Weiterhin: HD-Foto für Login/Kopfband (siehe Abnahme 01).
