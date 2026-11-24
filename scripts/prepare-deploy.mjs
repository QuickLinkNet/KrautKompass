// Stellt deploy/ zusammen: genau die Dateien, die auf den Server gehören.
// Aufruf über "npm run deploy" (baut vorher) oder einzeln: node scripts/prepare-deploy.mjs
//
// Ziel-Layout (= Inhalt von /html/apps/krautkompass):
//   .htaccess        leitet alles nach public/ (falls die Subdomain auf den Ordner selbst zeigt)
//   public/          Webroot: index.html, assets/, index.php, .htaccess (media/ entsteht auf dem Server)
//   src/ config/ database/ routes/ bin/   PHP-Backend (nicht direkt erreichbar)
//   storage/.htaccess                     Laufzeitdaten entstehen auf dem Server
// Nie im Paket: .env, config/local.php, storage-Inhalte, media/products, Tests, Dev-Router.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const api = join(root, 'api');
const out = join(root, 'deploy');

function fail(message) {
  console.error(`Deploy-Paket abgebrochen: ${message}`);
  process.exit(1);
}

if (!existsSync(join(api, 'public', 'index.html'))) fail('Kein Frontend-Build gefunden. Erst "npm run build" ausführen.');

// Netzlaufwerk (NAS): Löschen wird verzögert sichtbar, daher mit Wiederholungen
function retry(fn) {
  for (let attempt = 1; ; attempt++) {
    try {
      return fn();
    } catch (error) {
      if (attempt >= 15 || !['ENOENT', 'ENOTEMPTY', 'EPERM', 'EBUSY'].includes(error.code)) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
    }
  }
}
retry(() => rmSync(out, { recursive: true, force: true }));
retry(() => mkdirSync(out, { recursive: true }));

for (const dir of ['src', 'database', 'routes', 'bin']) {
  cpSync(join(api, dir), join(out, dir), { recursive: true });
}
mkdirSync(join(out, 'config'));
cpSync(join(api, 'config', 'app.php'), join(out, 'config', 'app.php'));
cpSync(join(api, 'config', '.htaccess'), join(out, 'config', '.htaccess'));
cpSync(join(api, '.env.example'), join(out, '.env.example'));

// Webroot ohne heruntergeladene Produktbilder (die lädt der Sync auf dem Server)
cpSync(join(api, 'public'), join(out, 'public'), {
  recursive: true,
  filter: (src) => !src.replaceAll('\\', '/').includes('/public/media/'),
});
mkdirSync(join(out, 'public', 'media'), { recursive: true });
cpSync(join(api, 'public', 'media', '.htaccess'), join(out, 'public', 'media', '.htaccess'));

mkdirSync(join(out, 'storage'));
cpSync(join(api, 'storage', '.htaccess'), join(out, 'storage', '.htaccess'));

writeFileSync(join(out, '.htaccess'), `# KrautKompass – Wurzel des App-Ordners.
# Ideal: Die Subdomain zeigt direkt auf public/. Zeigt sie auf diesen Ordner,
# wird hier alles nach public/ umgeleitet – Backend, .env und storage/ bleiben unerreichbar.
Options -Indexes

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^public/ - [L]
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>

<FilesMatch "^\\.">
    Require all denied
</FilesMatch>
`);

// Sicherheitsnetz: nichts Geheimes oder Lokales im Paket
const forbidden = ['.env', 'local.php', 'database.sqlite', 'dev-router.php'];
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const files = walk(out);
const leaked = files.filter((f) => forbidden.some((name) => f.endsWith(`${name}`) && !f.endsWith('.env.example')));
if (leaked.length > 0) fail(`Unerlaubte Dateien im Paket: ${leaked.join(', ')}`);

console.log(`deploy/ bereit: ${files.length} Dateien.`);
