# KrautKompass als App (PWA)

KrautKompass lässt sich wie eine App installieren: auf dem iPhone über Safari, auf Android, in Chrome und in Edge.
Danach startet sie vom Home-Bildschirm ohne Browserleiste. Einen App Store braucht es nicht.

## Für Nutzer
- **iPhone/iPad:** Unter der Kopfzeile erscheint der Hinweis „Leg KrautKompass als App auf deinen Home-Bildschirm“.
  „So geht’s“ öffnet die Anleitung: Teilen → Zum Home-Bildschirm → Hinzufügen. Dieselbe Anleitung steht im Konto-Menü
  unter „App installieren“.
- **Android, Chrome, Edge:** Dort öffnet „Installieren“ direkt den Dialog des Browsers.
- Der Hinweis lässt sich mit × dauerhaft ausblenden. In der installierten App verschwinden Hinweis und Menüeintrag.
- **Neue Version:** Die App meldet „Eine neue Version von KrautKompass ist da“. Erst „Aktualisieren“ lädt sie, damit
  niemand mitten in einer Bewertung neu geladen wird.
- **Offline:** Die App startet auch ohne Netz und meldet „Keine Verbindung“. Sorten und Bewertungen kommen immer
  frisch vom Server, offline wird nichts gespeichert.

## Technik
| Datei | Aufgabe |
|---|---|
| `scripts/pwa/plugin.ts` | Vite-Plugin: erzeugt `manifest.webmanifest` (Farben aus `design/tokens.json`), `sw.js` mit Dateiliste und `apple-touch-icon.png`. Berücksichtigt den Unterordner (`--base`). |
| `scripts/pwa/sw.js` | Service-Worker-Vorlage: Build-Dateien vorab gespeichert, Seiten zuerst aus dem Netz, `/api` nie gespeichert, Produktbilder (`/media`) bis 300 Stück zwischengespeichert |
| `src/features/pwa/pwa.ts` | Registrierung (nur im Build), Installations-Angebot, Update-Erkennung |
| `src/features/pwa/usePwa.ts` | Hooks `usePwa`, `useOnline` |
| `organisms/AppNotices`, `organisms/InstallDialog` | Hinweise unter der Kopfzeile, iPhone-Anleitung |
| `design/assets/pwa/` | Icons 192/512 (abgerundet), maskierbar 512, Apple 180, Screenshots für den Installationsdialog |

- Im Dev-Server (`npm run dev`) gibt es Manifest und Icons, aber **keinen Service Worker**, damit nichts veraltet.
  Testen lässt sich die PWA mit `npm run build` und dann auf http://127.0.0.1:8095.
- `sw.js` und `manifest.webmanifest` laufen mit `Cache-Control: no-cache` (`.htaccess`, `dev-router.php`).
- Eine PWA braucht **HTTPS**. Auf der Live-Adresse geht das erst, wenn das SSL-Zertifikat der Subdomain stimmt.

## Geprüft (26.11.2026, Produktionsbuild, Edge headless)
Edge meldet keine Installationsfehler, das Manifest ist ohne Fehler. Der Service Worker ist aktiv und steuert die Seite.
Im Cache liegen 14 App-Dateien und Produktbilder, aber keine `/api`-Antwort. Offline lädt `/bewertungen` mit Kopfzeile
und „Keine Verbindung“. Das Update erscheint als Hinweis, „Aktualisieren“ lädt neu. Mit iPhone-Kennung erscheinen
„So geht’s“ und die Anleitung aus Hinweis und Menü, Escape schließt sie. Als installierte App gibt es weder Hinweis noch
Menüeintrag. Der Unterordner-Build hat korrekte Pfade für Manifest, Icons, Scope und Service Worker.
Bilder: `docs/pwa/`.

**Nicht geprüft:** echtes iPhone, echtes Android-Gerät, Live-Server (wartet auf SSL und Freigabe).
