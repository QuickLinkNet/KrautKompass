# KrautKompass

Privates Bewertungstagebuch für Cannabissorten aus dem Sortiment von
[Kraut Kurier](https://krautkurier.shop). Geschlossene Runde: Zugang nur per Einladung.

- **Frontend** (Projekt-Root): Vite + React 19 + TypeScript, Atomic Design, CSS Modules, Designsystem „Apothecary“ (Playfair Display + Inter lokal gehostet)
- **API** (`api/`): PHP 8.1+ ohne Abhängigkeiten (eigenes kleines MVC), SQLite
- **Selbstinstallierend:** Datenbank, Verzeichnisse und Migrationen entstehen beim ersten Aufruf,
  der erste Admin kommt aus `api/.env` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) – ohne Vorgabe per Assistent im Browser
- **Sortenkatalog = Startseite:** Suche, Filter (Hersteller, THC/CBD, Terpen, Wirkung, Bewertung, Verfügbarkeit,
  Merkliste), Sortierung, Listen-/Kachelansicht; Filter stehen in der URL. Automatischer Abgleich mit dem
  Kraut-Kurier-Shop (Stammdaten, Terpene, Beschreibung, Bilder)

Weitere Doku: [Architektur](docs/ARCHITEKTUR.md) · [Sicherheit](docs/SICHERHEIT.md) · [Designsystem](docs/DESIGN.md) · Design-Kit in [`design/`](design)

## Projektstruktur

```
src/                 Frontend (React)
  api/               Fetch-Client (CSRF, Timeout, Fehler) + typisierte Endpunkte
  components/        atoms / molecules / organisms / templates
  pages/  routes/    Seiten + Routing mit Guards
  features/          Session, Meta-Vokabular, Katalog (URL-Filter, Laden in Seiten)
  styles/            Design-Tokens
design/              Design-Kit (verbindlich): tokens.json, Assets, Screen-Referenzen + Abnahme-Screenshots
scripts/             Build- und Deploy-Helfer (prepare-deploy.mjs, deploy.mjs)
api/                 Backend (PHP)
  public/            Webroot: index.php, .htaccess, Vite-Build, media/ (Produktbilder)
  src/Core/          MVC-Kern: Kernel, Router, Request/Response, Container, Database, Migrator, Session, Validator
  src/Domain/        Repositories + Presenter (Users, Invites, PasswordResets, Products, Favorites, Ratings, Settings, Sync)
  src/Services/      Installer, Auth, PasswordReset, Mailer, RateLimiter, PasswordHasher, Sync/
  src/Http/          Controller + Middleware
  routes/api.php     alle Endpunkte
  database/migrations/
  config/            app.php (Standard, liest api/.env) + local.php (optional, nicht eingecheckt)
  .env               Server-Werte: Admin, URL, Mail (nicht eingecheckt, Vorlage .env.example)
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

Vorher `api/.env.example` nach `api/.env` kopieren und `ADMIN_EMAIL`/`ADMIN_PASSWORD` eintragen – der Admin
entsteht beim ersten Aufruf. Dann <http://localhost:5220> öffnen.
Vite leitet `/api` und `/media` an den PHP-Server auf Port 8095 weiter.

Für „Passwort vergessen“ lokal in `api/.env`: `APP_URL=http://localhost:5220`, `APP_DEBUG=true`, `MAIL_TRANSPORT=log`
– die Mail samt Link steht dann in `api/storage/logs/app-JJJJ-MM.log`.

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

## Deployment (`krautkompass.red-it.org`)

Gleicher Webspace wie die anderen red-it-Apps (Alfahosting/Plesk), Ziel `/html/apps/krautkompass`.
**Nur nach Freigabe deployen.**

Einmalig:

1. Subdomain `krautkompass.red-it.org` in Plesk anlegen, **Document Root `/html/apps/krautkompass/public`**
   (zeigt sie auf `/html/apps/krautkompass`, leitet die `.htaccess` dort alles nach `public/` um). SSL aktivieren.
2. `.env.deploy.example` nach `.env.deploy` kopieren und das FTP-Passwort eintragen.
3. `api/.env.example` als `.env` nach `/html/apps/krautkompass/.env` hochladen und ausfüllen:
   `APP_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mind. 10 Zeichen), für „Passwort vergessen“
   `MAIL_TRANSPORT=mail` + `MAIL_FROM` (Absender auf der eigenen Domain).
   Solange der Admin in der `.env` steht, ist der Einrichtungsassistent gesperrt – niemand kann sich vorher zum Admin machen.

Jedes Deployment:

```powershell
npm run deploy
```

Prüft alles (`npm run check`), baut, stellt `deploy/` zusammen und lädt per FTP hoch. Das Skript bricht ab,
wenn das Ziel nicht auf `/krautkompass` endet, und fasst `storage/` (Datenbank), `public/media/` (Bilder)
und `.env` nie an.

Nach dem ersten Deployment:

4. Subdomain öffnen – der Admin aus der `.env` wird angelegt. Anmelden, dann `ADMIN_PASSWORD` in der `.env`
   leeren (die E-Mail stehen lassen). Das Passwort ändert man danach in der App.
5. Unter *Verwaltung* den Sorten-Abgleich starten, Einladungen erzeugen und weitergeben.
6. Optional Cronjob für den täglichen Abgleich: `0 6 * * * php /html/apps/krautkompass/bin/console products:sync`

Hinweis: Der Webspace hat **SQLite 3.7.17**. Kein Upsert, kein `RETURNING`, keine JSON-Funktionen,
keine Window-Functions – ein Test (`CatalogTest`) sucht danach im SQL. Backup = die Datei
`storage/database.sqlite` per FTP sichern.

## Datenschutz & Rechtliches (Kurzfassung)

- Geschlossene Gruppe, kein öffentlicher Zugang (`noindex`), Registrierung nur per Einladung.
  Hintergrund: Werbeverbot für verschreibungspflichtige Arzneimittel (§ 10 HWG). Auch der Shop zeigt
  Bilder und Preise erst nach dem Login.
- Bewertungen sind **standardmäßig privat**. Für die Runde sichtbar werden sie nur, wenn man sie bewusst teilt.
- Keine Fremd-Requests aus dem Browser: Schrift lokal gehostet, Produktbilder lokal gespeichert,
  Content-Security-Policy erlaubt nur die eigene Domain.
- Produktbilder tragen ein Cannaleo-Wasserzeichen. Die Nutzung ist mit dem Shop-Betreiber abgesprochen.
  Vor einer Öffnung über den privaten Kreis hinaus bitte die Bildrechte mit Cannaleo klären.
