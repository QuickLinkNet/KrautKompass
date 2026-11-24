# Sicherheit

Stand der Härtung. Jede Maßnahme ist mit Tests abgedeckt (`api/tests/HardeningTest.php`,
`api/tests/ApiFlowTest.php`, `src/api/request.test.ts`).

## Zugang & Sitzungen

| Maßnahme | Umsetzung |
|---|---|
| Geschlossene Gruppe | Registrierung nur mit Einladungscode (einmalig, läuft ab, widerrufbar) |
| Einladung atomar einlösen | `BEGIN IMMEDIATE` + bedingtes `UPDATE … WHERE used_at IS NULL` |
| Passwörter | Argon2id (Fallback bcrypt), automatisches Rehash, nicht getrimmt, min. 10 Zeichen |
| Login-Drosselung | 5 Fehlversuche pro Konto / 15 Min. und 30 Versuche pro IP / 15 Min. |
| Weitere Limits | Registrierung 10/h pro IP, Einladungsprüfung 30/h pro IP, Passwortwechsel 5/15 Min. |
| Keine Konto-Erkennung | gleiche Meldung und gleiche Laufzeit (Dummy-Hash) bei unbekannter E-Mail |
| Session-Cookie | `HttpOnly`, `SameSite=Lax`, `Secure` unter HTTPS, strict mode, eigener Speicherort |
| Session-Fixation | neue Session-ID nach jedem Login |
| Sitzungen beenden | Session-Version pro Benutzer: Passwortwechsel meldet alle anderen Geräte ab, Deaktivierung oder Rollenwechsel wirken sofort |
| Erster Admin | aus `api/.env` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`); solange vorgegeben, ist die Browser-Einrichtung gesperrt (403) – kein Wettlauf um den Admin nach dem Deploy. Passwort nach dem ersten Login aus der `.env` löschen |
| Letzter Admin | kann weder herabgestuft noch deaktiviert werden (transaktional geprüft) |
| Passwort-Reset | nur mit konfiguriertem Mailversand + `app.url` (sonst 503 und im Frontend als „nicht eingerichtet“ erklärt); Token 256 Bit, in der DB nur SHA-256, 60 Min. gültig, einmalig, ältere Tokens verfallen; immer gleiche Antwort (keine Konto-Erkennung); 5/15 Min. pro IP und 3/h pro Adresse; danach werden alle Sitzungen beendet; Link-Adresse nie aus dem Host-Header; Token wird im Browser sofort aus der Adresszeile entfernt |

## Requests

| Maßnahme | Umsetzung |
|---|---|
| CSRF | Token-Header `X-CSRF-Token` für alle schreibenden Requests (419 bei Fehlern, Frontend erneuert einmal automatisch) |
| Nur JSON | Bodies ohne `application/json` → 415 (schließt auch klassisches Formular-CSRF aus) |
| Größenlimit | Bodies über 64 KB → 413, gelesen werden höchstens 64 KB + 1 Byte |
| Validierung | strikte Typen (keine Listen/Objekte in Textfeldern), Whitelist-Vokabular für Wirkungen, Datumsprüfung, unbekannte Regeln = Programmierfehler |
| SQL | ausschließlich Prepared Statements; Sortierung nur über eine Whitelist |
| Fehler | PHP-Warnungen werden zu Exceptions → Log statt Ausgabe; fatale Fehler liefern trotzdem JSON; Details nur mit `app.debug` |
| Proxy-Header | `X-Forwarded-*` werden nur mit `security.trust_proxy = true` ausgewertet |

## Header

- API: `Content-Security-Policy: default-src 'none'`, `X-Frame-Options: DENY`, `nosniff`, `no-store`
- App (`.htaccess`): CSP nur eigene Domain (keine Inline-Skripte), HSTS, `Permissions-Policy`,
  `Referrer-Policy: same-origin`, HTTPS-Umleitung
- `media/`: nur Bilder, Skripte/HTML/SVG gesperrt, eigene CSP

## Produkt-Sync

- nur HTTPS, auch bei Weiterleitungen; TLS-Prüfung immer an
- Antwortgröße begrenzt (Streaming-Abbruch), Timeouts
- Bilder nur von freigegebenen Hosts (`sync.image_hosts`), Inhalt per Signatur als PNG/JPEG/WebP/GIF
  geprüft, Endung aus dem erkannten Typ, atomares Schreiben
- Läufe starten nie doppelt; hängende Läufe werden nach 30 Min. als fehlgeschlagen markiert
- Schutz vor Massendeaktivierung: Liefert der Shop weniger als die Hälfte der bekannten Sorten,
  wird nichts deaktiviert

## Server-Layout

Document Root ist `public/` (auf dem Server `/html/apps/krautkompass/public`). `src/`, `config/`, `database/`,
`routes/`, `bin/`, `storage/` und `.env` liegen außerhalb und haben zusätzlich je eine `Require all denied`-`.htaccess`.
Zeigt die Subdomain doch auf den App-Ordner, leitet dessen `.htaccess` alles nach `public/` um.
Das Deploy-Skript lädt nur das geprüfte Paket `deploy/` hoch (bricht bei `.env`, `local.php` oder Datenbank darin ab)
und fasst `storage/`, `public/media/` und `.env` auf dem Server nie an.

## Bewusst offen / nächste Schritte

- Passwort-Reset durch einen Admin (Fallback, wenn kein Mailversand eingerichtet ist) – fehlt noch
- Mailversand per SMTP mit Authentifizierung (aktuell PHP `mail()` des Webspaces) – bei schlechter Zustellbarkeit nachrüsten
- Leichter Timing-Unterschied beim Reset-Antrag (Mail wird nur bei existierendem Konto erzeugt); durch Rate-Limits abgeschwächt
- Zwei-Faktor-Login, falls die Runde über Freunde hinaus wächst
- Backups: `api/storage/database.sqlite` regelmäßig sichern (z. B. per Cron mit `sqlite3 .backup`)
