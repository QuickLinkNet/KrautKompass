# Architektur

## Überblick

```
Browser (React-SPA)
   │  fetch /api/*  (Session-Cookie + X-CSRF-Token)
   ▼
api/public/index.php ──► Kernel
                           ├─ guardBody()             Größenlimit (413), nur JSON (415)
                           ├─ Installer::prepare()    Verzeichnisse, SQLite, Migrationen
                           ├─ Session::start()
                           ├─ Router::match()         api/routes/api.php
                           ├─ Middleware-Pipeline     csrf → installed → auth → admin
                           └─ Controller ──► Services / Repositories ──► Database (PDO SQLite)
```

Ordner: Frontend im Projekt-Root (`src/`, `index.html`, `vite.config.ts`), Backend unter `api/`.
Der Vite-Build landet in `api/public/`, deployt wird nur `api/`.

## Backend: Schichten

| Schicht | Ordner | Aufgabe |
|---|---|---|
| Kern | `src/Core` | Framework-Teile ohne Fachlogik: Kernel, Router, Request/Response, DI-Container, Database, Migrator, Session, Validator, Logger |
| HTTP | `src/Http` | Controller (dünn: validieren → Service/Repository → JSON) und Middleware |
| Services | `src/Services` | Abläufe über mehrere Repositories: Installer, Auth, Produkt-Sync |
| Domain | `src/Domain` | Repositories (SQL) und Presenter (DB-Zeile → API-JSON) pro Fachbereich |
| Support | `src/Support` | kleine Helfer: Clock, HttpClient |

**DI-Container:** Klassen werden per Konstruktor-Reflection aufgelöst und sind Singletons.
Nur `Config` und `Database` haben explizite Factories im Kernel. Eine neue Abhängigkeit
bedeutet also: einfach in den Konstruktor schreiben.

**Fehler:** Fachliche Fehler sind `HttpException` (Status + Code + Meldung + Details) und werden
als `{"error": {"code", "message", "details"}}` ausgeliefert. Unerwartete Fehler landen in
`storage/logs/app-JJJJ-MM.log`, die Antwort bleibt dabei generisch (außer bei `app.debug`).

## Selbstinstallation

1. **Bei jedem Aufruf** (Web und CLI) legt `Installer::prepare()` fehlende Verzeichnisse an,
   erstellt die SQLite-Datei und spielt neue Dateien aus `database/migrations/` ein.
   Ausgeführte Migrationen stehen in `schema_migrations`.
2. **Einmalig:** Solange in `settings` kein `installed_at` steht, sperrt die Middleware `installed`
   alle fachlichen Endpunkte (HTTP 409 `not_installed`). Das Frontend zeigt dann den Assistenten:
   Er prüft die Voraussetzungen und legt über `POST /api/system/install` den ersten Admin an.

Schema-Änderung = neue Datei `database/migrations/JJJJ_MM_TT_NNNNNN_name.php`, die ein
`Closure(Database): void` zurückgibt. Bestehende Migrationen nie ändern.

## Sicherheit

Vollständige Übersicht aller Maßnahmen: [SICHERHEIT.md](SICHERHEIT.md). Kurz: Session-Cookie
mit sicheren Flags und Session-Version, CSRF-Token, Rate-Limits, Argon2id, Einladungen atomar,
strikte Validierung, Schreibtransaktionen mit `BEGIN IMMEDIATE`, CSP, gehärteter Sync.

## Datenmodell

- `users`: Rolle `admin` | `member`, Status `active` | `disabled`
- `invites`: Code `KK-XXXX-XXXX`, Rolle, Ablaufdatum, eingelöst/widerrufen
- `products`: aus dem Shop, eindeutig über (`source`, `external_id`). Fehlt eine Sorte im Shop,
  wird sie nur inaktiv; ihre Bewertungen bleiben erhalten
- `ratings`: genau eine pro Benutzer und Sorte (änderbar). Skalen 1–10 (= halbe Sterne), Wirkungen
  und Nebenwirkungen als JSON-Listen aus festem Vokabular (`config/app.php` → `ratings`),
  `visibility` `private` (Standard) | `group`
- `sync_runs`: Protokoll der Katalogabgleiche
- `settings`, `login_attempts`

## Produkt-Sync

`Services/Sync`:

- `CannaleoClient` liest die inoffizielle Schnittstelle des Shops (Cannaleo-White-Label, Next.js):
  `/api/products?pagination[...]&vend=139` für die Liste, `__NEXT_DATA__` der Detailseite für
  Beschreibung, Terpene und Bild-URLs. **Ändert Cannaleo etwas, wird nur diese Klasse angepasst.**
- `ProductMapper` bildet die Daten ohne I/O auf Tabellenspalten ab und ist getestet.
- `ProductSync` arbeitet inkrementell: Details und Bilder werden nur bei neuen oder geänderten
  Sorten geladen (`updated_at` des Shops). Mit `--force` wird alles neu geladen. Zwischen den
  Requests wartet er 250 ms.
- `ImageStore` legt die Bilder unter `public/media/products/` ab.

## Frontend

- **Atomic Design:** `atoms` (Button, Input, Badge, Card, Logo, Spinner) → `molecules`
  (FormField, Alert, StatBar, ChipGroup, ScoreInput) → `organisms` (Formulare, ProductCard,
  Filter, Panels) → `templates` (AuthLayout, AppLayout) → `pages`
- **Design-Tokens** in `src/styles/tokens.css`: Alle Farben, Abstände und Radien sind CSS-Variablen.
  Screendesigns tauschen hier zentral.
- **Daten:** `api/client.ts` (CSRF, Fehler als `ApiError` mit Feldfehlern), `api/endpoints.ts`
  (typisiert), `hooks/useAsyncResource` (Laden + Race-Schutz), `hooks/useForm` (Formular +
  422-Feldfehler)
- **Routing-Guards** in `routes/AppRoutes.tsx`: nicht installiert → `/einrichtung`,
  nicht angemeldet → `/login`, `/admin` nur für Admins
- Dateien bleiben unter 200 Zeilen.

## Neues Feature anlegen (Checkliste)

1. Migration in `database/migrations/`
2. Repository (+ Presenter) in `src/Domain/<Bereich>/`
3. Controller in `src/Http/Controllers/`, Route in `routes/api.php` (passende Middleware-Gruppe)
4. Test in `api/tests/` (Muster: `ApiFlowTest.php` mit `test_kernel()` und `api()`)
5. Typen + Endpunkt in `src/api/`, Komponenten nach Atomic Design, Seite + Route
