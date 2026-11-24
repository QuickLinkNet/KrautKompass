# KrautKompass

Privates Bewertungstagebuch für Cannabissorten aus dem Sortiment von
[Kraut Kurier](https://krautkurier.shop). Geschlossene Runde: Zugang nur per Einladung.

- **Frontend** (Projekt-Root): Vite + React 19 + TypeScript, Atomic Design, CSS Modules, Schrift Jost lokal gehostet
- **API** (`api/`): PHP 8.1+ ohne Abhängigkeiten (eigenes kleines MVC), SQLite
- **Selbstinstallierend:** Datenbank, Verzeichnisse und Migrationen entstehen beim ersten Aufruf,
  der Admin wird über einen Einrichtungsassistenten im Browser angelegt
- **Sortenkatalog:** automatischer Abgleich mit dem Kraut-Kurier-Shop (Stammdaten, Terpene, Beschreibung, Bilder)

Weitere Doku: [Architektur](docs/ARCHITEKTUR.md) · [Sicherheit](docs/SICHERHEIT.md) · [Designkonzept](docs/DESIGN.md)

## Projektstruktur

```
src/                 Frontend (React)
  api/               Fetch-Client (CSRF, Timeout, Fehler) + typisierte Endpunkte
  components/        atoms / molecules / organisms / templates
  pages/  routes/    Seiten + Routing mit Guards
  features/          Session, Meta-Vokabular
  styles/            Design-Tokens
public/              statische Frontend-Dateien (Favicon)
scripts/             Build-Helfer
api/                 Backend (PHP)
  public/            Webroot: index.php, .htaccess, Vite-Build, media/ (Produktbilder)
  src/Core/          MVC-Kern: Kernel, Router, Request/Response, Container, Database, Migrator, Session, Validator
  src/Domain/        Repositories + Presenter (Users, Invites, Products, Ratings, Settings, Sync)
  src/Services/      Installer, Auth, RateLimiter, PasswordHasher, Sync/
  src/Http/          Controller + Middleware
  routes/api.php     alle Endpunkte
  database/migrations/
  config/            app.php (Standard) + local.php (optional, nicht eingecheckt)
  bin/console        CLI: status, migrate, products:sync, invite:create
  storage/           SQLite, Sessions, Logs (automatisch erzeugt, nicht eingecheckt)
  tests/             abhängigkeitsfreier Test-Runner
```

## Lokal entwickeln

Voraussetzungen: PHP 8.1+ mit `pdo_sqlite` und cURL, Node 20+.

```powershell
npm install
```

```powershell
npm run api
```

```powershell
npm run dev
```

Dann <http://localhost:5220> öffnen. Beim ersten Aufruf startet der Einrichtungsassistent.
Vite leitet `/api` und `/media` an den PHP-Server auf Port 8095 weiter.

Sortenkatalog füllen (oder in der App unter *Verwaltung*):

```powershell
php api/bin/console products:sync
```

## Prüfen

```powershell
npm run check
```

Führt Typecheck, Frontend-Tests (Vitest) und API-Tests aus. Dieselben Schritte laufen in GitHub Actions
(`.github/workflows/ci.yml`, PHP 8.1 / 8.3 / 8.4).

## Deployment (z. B. `kompass.red-it.org`)

1. `npm run build` – der Build landet in `api/public/`.
2. Den Ordner `api/` hochladen (ohne `storage/`, `tests/` und `dev-router.php`).
3. **Document Root der Subdomain auf `api/public` setzen.** `src/`, `config/` und `storage/`
   liegen damit außerhalb des Webroots. Zusätzlich sperrt je eine `.htaccess` diese Ordner.
4. SSL: bei den meisten Hostern ein Klick (Let's Encrypt) für die Subdomain. `.htaccess` leitet
   danach auf HTTPS um und setzt HSTS. Sitzt ein eigener Proxy davor (z. B. Cloudflare),
   in `config/local.php` `security.trust_proxy` auf `true` setzen.
5. Subdomain im Browser öffnen, Einrichtungsassistent durchlaufen, eigenen Admin anlegen.
6. Cronjob für den täglichen Katalogabgleich, z. B. 6 Uhr:
   `0 6 * * * php /pfad/zu/api/bin/console products:sync`
7. Unter *Verwaltung* Einladungen erzeugen und den Link weitergeben.

Benötigt Apache 2.4 mit `mod_rewrite` (und idealerweise `mod_headers`). Bei nginx:
`/api` → `index.php`, sonst `try_files $uri /index.html`, Header aus `.htaccess` übernehmen.

## Datenschutz & Rechtliches (Kurzfassung)

- Geschlossene Gruppe, kein öffentlicher Zugang (`noindex`), Registrierung nur per Einladung.
  Hintergrund: Werbeverbot für verschreibungspflichtige Arzneimittel (§ 10 HWG). Auch der Shop zeigt
  Bilder und Preise erst nach dem Login.
- Bewertungen sind **standardmäßig privat**. Für die Runde sichtbar werden sie nur, wenn man sie bewusst teilt.
- Keine Fremd-Requests aus dem Browser: Schrift lokal gehostet, Produktbilder lokal gespeichert,
  Content-Security-Policy erlaubt nur die eigene Domain.
- Produktbilder tragen ein Cannaleo-Wasserzeichen. Die Nutzung ist mit dem Shop-Betreiber abgesprochen.
  Vor einer Öffnung über den privaten Kreis hinaus bitte die Bildrechte mit Cannaleo klären.
