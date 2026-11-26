# Prompt für die Design-KI – Screen 06 „Verwaltung“

Einen Prompt senden. Anhängen:

1. `design/screens/05-neuigkeiten/reference.webp` (aktueller Stil, Kopfband, Chips, Karten)
2. `design/screens/04-journal/reference.webp` (Karten, Filter, Zustände)
3. `design/assets/logo.png`
4. `design/tokens.json`

Bitte das Board als PNG/WebP, mindestens 2000 px breit, dazu ein Bild nur mit den iPhone-Ansichten.

---

## Prompt

Gestalte den nächsten Screen für KrautKompass, eine private Web-App, in der eine kleine eingeladene Runde
medizinische Cannabis-Sorten bewertet. Die angehängten Bilder sind verbindlich: gleiche Designrichtung „Apothecary“,
gleicher Kopf, gleiche Buttons, Chips, Karten und Schriften. Farben und Abstände nur aus der angehängten tokens.json.
Logo exakt wie angehängt. Keine neuen Stilelemente, kein Glas, kein Neon, kein Dark Mode.

Der Screen heißt „Verwaltung“ und ist nur für Admins sichtbar. Hier lädt man neue Mitglieder ein, verwaltet die Runde
und gleicht den Sortenkatalog mit dem Shop ab. Die Runde ist klein (drei bis zehn Personen). Wichtigstes Gerät ist das
iPhone: Einladen soll dort mit wenigen Tipps gehen.

Board wie bei den letzten Screens: Desktop (1440), Tablet (768) und iPhone (390), das iPhone groß und mehrfach
(Einladungen, neue Einladung erstellt, Mitglieder, Abgleich), darunter „Komponenten (Auszug)“.

Navigation exakt so: Sortenkatalog · Journal · Neuigkeiten · Verwaltung (aktiv), rechts ein Kreis mit Initialen.
Auf dem iPhone: Logo, Initialen-Kreis, Menü-Symbol (keine zweite Navigationszeile).

Inhalt:

1. Überschrift „Verwaltung“, darunter „Einladungen, Mitglieder und Sortenkatalog.“ (schlichter Kopf ohne Foto)
2. Umschalter wie im Journal: „Einladungen“ · „Mitglieder (3)“ · „Sortenkatalog“
3. Einladungen
   - Karte „Neue Einladung“: Feld „Für wen?“ (Platzhalter „z. B. Kathrin“), Auswahl „Mitglied“ / „Admin“,
     Hauptbutton „Einladung erstellen“
   - nach dem Erstellen: hervorgehobene Karte „Einladung für Kathrin ist bereit“ mit dem Link (gekürzt),
     Buttons „Teilen“ (öffnet auf dem iPhone das Teilen-Menü) und „Link kopieren“, Hinweis
     „Gültig bis 10.12.2026 · nur einmal nutzbar“
   - Liste der Einladungen: Für wen, Status als Kennzeichnung („Offen bis 10.12.“, „Eingelöst von Kathrin“,
     „Abgelaufen“, „Widerrufen“), bei offenen Einladungen „Teilen“, „Link kopieren“, „Widerrufen“
4. Mitglieder
   - Liste: Kreis mit Initialen, Name (eigener Eintrag mit „Du“), E-Mail, Rolle als Kennzeichnung („Admin“ /
     „Mitglied“), „Zuletzt aktiv 26.11.2026“, gesperrte Mitglieder dezent mit „Gesperrt“
   - Aktionen je Mitglied über ein kleines Menü „…“: „Zum Admin machen“ / „Admin-Rechte entziehen“,
     „Sperren“ / „Entsperren“ (beim eigenen Eintrag keine Aktionen)
5. Sortenkatalog
   - Karte „Abgleich mit dem Kraut-Kurier-Shop“: „Zuletzt abgeglichen: heute, 09:12 Uhr · 119 Sorten“,
     Hauptbutton „Jetzt abgleichen“, während des Laufs „Abgleich läuft … das kann ein paar Minuten dauern“
   - Verlauf der letzten Abgleiche: Datum und Uhrzeit, „manuell“ / „automatisch“, Status („Erfolgreich“,
     „Fehlgeschlagen“, „Läuft“), Ergebnis in Worten („119 gefunden · 6 neu · 113 aktualisiert · 5 entfernt“),
     bei Fehlern die Meldung dezent in Rot

Zustände in der Komponentenleiste:
- Noch keine Einladung: „Noch niemand eingeladen. Erstelle die erste Einladung.“
- Rückfrage „Einladung widerrufen?“ mit „Abbrechen“ und „Widerrufen“
- Rückfrage „Kathrin sperren? Sie kann sich dann nicht mehr anmelden.“ mit „Abbrechen“ und „Sperren“
- Bestätigung „Link kopiert“ (kurze Meldung)
- Ladezustand (Skelett) und Fehler „Verwaltung konnte nicht geladen werden“ mit „Erneut versuchen“

Regeln: Alle Texte deutsch und exakt so geschrieben. Textkontrast mindestens WCAG AA, Touch-Flächen mindestens
44 px, Auswahl nie nur durch Farbe. Keine Funktionen dazuerfinden: keine Statistiken, keine Diagramme, kein
Löschen von Mitgliedern, keine Rechteverwaltung über Admin/Mitglied hinaus, keine E-Mail-Einladungen, keine Einstellungen.

Liefere zusätzlich eine kurze Textbeschreibung: Abstände, Schriftgrößen, Verhalten beim Scrollen und Unterschiede
zwischen iPhone, Tablet und Desktop.
