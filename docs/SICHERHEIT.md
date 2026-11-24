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
| Letzter Admin | kann weder herabgestuft noch deaktiviert werden (transaktional geprüft) |

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

Document Root ist `api/public`. `src/`, `config/`, `database/`, `routes/`, `bin/` und `storage/`
liegen außerhalb und haben zusätzlich je eine `Require all denied`-`.htaccess`.

## Bewusst offen / nächste Schritte

- Passwort-vergessen-Funktion (braucht Mailversand) bzw. Passwort-Reset durch einen Admin – fehlt noch
- Zwei-Faktor-Login, falls die Runde über Freunde hinaus wächst
- Backups: `api/storage/database.sqlite` regelmäßig sichern (z. B. per Cron mit `sqlite3 .backup`)
