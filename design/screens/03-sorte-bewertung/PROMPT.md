# Prompts für die Design-KI – Screen 03 „Sorte & Bewertung“

Beide Prompts im selben Chat nacheinander senden. Beim ersten anhängen:

1. `design/screens/02-sortenkatalog/reference.webp` (Stil, Kopf, Komponenten)
2. `design/screens/01-login/reference.png` (Stil)
3. `design/assets/logo.svg` (oder `logo.png`)
4. `design/tokens.json`

---

## Prompt 1 – Sorten-Detailseite

Gestalte den nächsten Screen für KrautKompass, eine private Web-App, in der eine kleine eingeladene Runde
medizinische Cannabis-Sorten bewertet. Die angehängten Bilder sind verbindlich: gleiche Designrichtung
„Apothecary“, gleicher Kopf, gleiche Buttons, Chips, Karten und Schriften wie im Sortenkatalog. Farben und Abstände
nur aus der angehängten tokens.json. Keine neuen Stilelemente, kein Glas, kein Neon, kein Dark Mode.

Aufbau der Vorschau wie beim Sortenkatalog: ein Board mit Desktop (1440), Tablet (768) und iPhone (390), darunter eine
Leiste „Komponenten (Auszug)“. Wichtigstes Gerät ist das iPhone: Zeige es groß und zweimal, oben und weitergescrollt.

Navigation exakt so: Sortenkatalog (aktiv) · Journal · Neuigkeiten · Verwaltung, rechts ein Kreis mit Initialen.
Keine Glocke, kein „Wissen“.

Inhalt der Seite, von oben nach unten:

1. Link „← Alle Sorten“
2. Produktfoto: Es kommt aus dem Shop und hat einen WEISSEN Hintergrund. Das Layout muss damit edel aussehen.
   Zeige auch, wie eine Sorte ohne Foto aussieht.
3. Name „Platinum Garlic“, darunter Hersteller „GreenLeaf Medical“, Status „Verfügbar“ (Variante: „Nicht verfügbar“)
4. Bewertung der Runde: 4,5 von 5 Sternen, „3 Bewertungen“
5. THC 26,4 % und CBD 0,2 %, gut lesbar hervorgehoben
6. Hauptbutton „Jetzt bewerten“, zweiter Button „Auf Merkliste“ (Variante: „Gemerkt“).
   Auf dem iPhone bleibt „Jetzt bewerten“ unten fest sichtbar.
7. Wenn ich schon bewertet habe: Karte „Deine Bewertung“ mit meinen Sternen, Datum, Kennzeichnung
   „Nur für dich“ oder „Mit der Runde geteilt“ und Button „Bewertung ändern“
8. Terpene als Chips: Myrcen, Caryophyllen, Limonen (nur Namen, keine Prozentwerte, keine Diagramme)
9. „Das berichtet die Runde“: häufigste Wirkungen als Chips mit Anzahl (Entspannend 3, Glücklich 2) und die
   Durchschnitte für Geschmack, Aroma und Wirkung als Sterne
10. Steckbrief: Hersteller, Strain, Genetik, Herkunft, Bestrahlung, Preis
11. Beschreibung, gekürzt mit „Mehr lesen“
12. Link „Im Kraut-Kurier-Shop ansehen ↗“
13. „Bewertungen der Runde“: zwei Beispiele mit Initialen, Name, Datum, Sternen, Konsumform, Wirkungen,
    Nebenwirkungen (dezent andersfarbig) und Notiz

Zeige in der Komponentenleiste zusätzlich: Leerzustand „Noch niemand hat diese Sorte mit der Runde geteilt.“,
Ladezustand (Skelett) und Fehlerzustand „Sorte konnte nicht geladen werden“ mit Button „Erneut versuchen“.

Regeln: Alle Texte deutsch und exakt so geschrieben. Textkontrast mindestens WCAG AA, Touch-Flächen mindestens 44 px.
Keine medizinischen Wirkungsversprechen. Keine Felder, Zahlen oder Funktionen dazuerfinden. Kein Warenkorb, kein Kaufen.

---

## Prompt 2 – Sorte bewerten

Gestalte jetzt im gleichen Stil das Bewerten einer Sorte. Es öffnet sich über „Jetzt bewerten“ oder „Bewertung ändern“:
auf dem iPhone als Vollbild, auf Tablet und Desktop als ruhiger Dialog über der Sortenseite.
Es soll sich mit einem Daumen in unter einer Minute ausfüllen lassen und Freude machen.

Board: iPhone (390) groß und in mehreren Schritten oder Scroll-Positionen, dazu je einmal Tablet (768) und Desktop (1440),
darunter „Komponenten (Auszug)“.

Nur die Gesamtbewertung ist Pflicht, alles andere ist freiwillig. Die Seite muss sich auch nach nur einem Tipp
speichern lassen. Die freiwilligen Angaben kommen danach in ruhigen Gruppen.

1. Kopf: kleines Foto, „Platinum Garlic“, Schließen-Symbol
2. „Wie war's insgesamt?“ – fünf große Sterne mit HALBEN Schritten (0,5 bis 5) und Zahl daneben, z. B. „4,5“
3. „Im Detail“ – Geschmack, Aroma, Wirkung, Blütenqualität, je als kleinere halbe Sterne, einzeln zurücksetzbar
4. „Wie hat es gewirkt?“ – Mehrfachauswahl als Chips:
   Entspannend, Beruhigend, Schlaffördernd, Euphorisch, Glücklich, Kreativ, Fokussiert, Energetisch, Gesprächig,
   Appetitanregend, Schmerzlindernd, Körperlich (Body High)
5. „Nebenwirkungen“ – Mehrfachauswahl, dezent abgesetzt, zunächst eingeklappt:
   Trockener Mund, Trockene Augen, Kopfschmerzen, Unruhe, Paranoia, Schwindel, Müdigkeit
6. „Konsumform“ – eine Auswahl: Vaporizer, Joint, Bong, Pfeife, Essbar, Sonstiges
7. „Probiert am“ – Datum
8. „Würdest du sie wieder nehmen?“ – Ja / Vielleicht / Nein
9. „Notizen“ – mehrzeilig, Platzhalter „Wie war's? Tageszeit, Stimmung, Besonderheiten …“
10. Sichtbarkeit als klare Entscheidung zwischen „Nur für mich“ (vorausgewählt) und „Mit der Runde teilen“
11. Unten fest: Hauptbutton „Bewertung speichern“. Beim Ändern zusätzlich ein unauffälliges „Bewertung löschen“.

Zeige außerdem diese Zustände:
- leer (Speichern noch nicht möglich, mit Hinweis „Bitte vergib eine Gesamtbewertung.“)
- ausgefüllt
- beim Speichern
- Fehler „Speichern hat nicht geklappt. Deine Eingaben sind noch da.“ mit „Erneut versuchen“
- gespeichert: kurze, hochwertige Bestätigung „Bewertung gespeichert“
- Rückfrage beim Löschen: „Bewertung wirklich löschen?“ mit „Abbrechen“ und „Löschen“
- Rückfrage beim Schließen mit ungespeicherten Eingaben: „Änderungen verwerfen?“

Regeln wie bei Prompt 1. Auswahl nie nur durch Farbe zeigen, sondern auch durch Häkchen oder Form.

---

## Lieferung

Je Prompt ein Bild des Boards als PNG oder WebP, mindestens 2000 px breit, dazu ein Bild nur mit den iPhone-Ansichten,
in dem alle Texte lesbar sind. Außerdem eine kurze Textbeschreibung: Abstände, Schriftgrößen, Verhalten beim Scrollen
und Unterschiede zwischen iPhone, Tablet und Desktop.
