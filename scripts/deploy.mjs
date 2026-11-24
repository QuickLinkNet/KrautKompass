// Lädt deploy/ per FTP nach REMOTE_BASE_DIR (Muster wie bei Familien-Insel).
// Zugangsdaten stehen in .env.deploy (nicht versioniert, siehe .env.deploy.example).
//
// Fasst NIE an: storage/ (Datenbank, Sessions, Logs), public/media/ (Produktbilder), .env
// – uploadFromDir überschreibt nur Dateien, die im Paket liegen, und löscht nichts.
import { Client } from 'basic-ftp';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const envPath = join(root, '.env.deploy');
if (!existsSync(envPath)) {
  console.error('Fehler: .env.deploy fehlt. Bitte .env.deploy.example kopieren und ausfüllen.');
  process.exit(1);
}
process.loadEnvFile(envPath);

const env = (key, fallback = '') => process.env[key] ?? fallback;
const remoteBaseDir = env('REMOTE_BASE_DIR').replace(/\/+$/, '');
const publicAppUrl = env('PUBLIC_APP_URL');

function fail(message) {
  console.error(`Deployment abgebrochen: ${message}`);
  process.exit(1);
}

if (['', '/', '/html', '/html/apps'].includes(remoteBaseDir)) fail(`REMOTE_BASE_DIR "${remoteBaseDir}" ist zu allgemein.`);
if (!remoteBaseDir.endsWith('/krautkompass')) fail('REMOTE_BASE_DIR muss auf "/krautkompass" enden.');
if (env('FTP_PASSWORD') === '') fail('FTP_PASSWORD ist leer.');

const deployDir = join(root, 'deploy');
for (const required of ['public/index.html', 'public/index.php', 'src/bootstrap.php', 'config/app.php', '.htaccess']) {
  if (!existsSync(join(deployDir, required))) fail(`deploy/${required} fehlt – erst "npm run deploy:prepare" ausführen.`);
}
for (const secret of ['.env', 'config/local.php', 'storage/database.sqlite']) {
  if (existsSync(join(deployDir, secret))) fail(`deploy/${secret} darf nicht hochgeladen werden.`);
}

const ftpSecure = env('FTP_SECURE', 'true') === 'true';
console.log(`Ziel: ${env('FTP_HOST')}:${env('FTP_PORT', '21')}${remoteBaseDir} (FTPS: ${ftpSecure ? 'ja' : 'nein'})`);

const client = new Client();
try {
  await client.access({
    host: env('FTP_HOST'),
    user: env('FTP_USER'),
    password: env('FTP_PASSWORD'),
    port: Number(env('FTP_PORT', '21')),
    secure: ftpSecure,
  });
  await client.ensureDir(remoteBaseDir);
  console.log('Lade Dateien hoch …');
  await client.uploadFromDir(deployDir);
  console.log('\nDeployment abgeschlossen.');
  if (publicAppUrl) console.log(`Öffentliche URL: ${publicAppUrl}`);
} catch (error) {
  console.error('Deployment fehlgeschlagen:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  client.close();
}
