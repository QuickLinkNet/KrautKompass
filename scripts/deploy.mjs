// Lädt deploy/ per FTP nach REMOTE_BASE_DIR (Muster wie bei Familien-Insel).
// Zugangsdaten stehen in .env.deploy (nicht versioniert, siehe .env.deploy.example).
//
// Fasst NIE an: storage/ (Datenbank, Sessions, Logs), public/media/ (Produktbilder), eine vorhandene Server-.env
// – uploadFromDir überschreibt nur Dateien, die im Paket liegen, und löscht nichts.
import { Client } from 'basic-ftp';
import { existsSync, readFileSync } from 'node:fs';
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

const deployDir = process.env.KK_DEPLOY_DIR ?? join(root, 'deploy');
for (const required of ['public/index.html', 'public/index.php', 'src/bootstrap.php', 'config/app.php', '.htaccess']) {
  if (!existsSync(join(deployDir, required))) fail(`deploy/${required} fehlt – erst "npm run deploy:prepare" ausführen.`);
}
for (const secret of ['.env', 'config/local.php', 'storage/database.sqlite']) {
  if (existsSync(join(deployDir, secret))) fail(`deploy/${secret} darf nicht hochgeladen werden.`);
}

const basePath = new URL(publicAppUrl).pathname.replace(/\/*$/, '/');
if (!readFileSync(join(deployDir, 'public/index.html'), 'utf8').includes(`src="${basePath}assets/`)) {
  fail(`Das Paket ist nicht für ${basePath} gebaut – erst "npm run deploy:prepare" ausführen.`);
}

const ftpSecure = env('FTP_SECURE', 'true') === 'true';
console.log(`Ziel: ${env('FTP_HOST')}:${env('FTP_PORT', '21')}${remoteBaseDir} (FTPS: ${ftpSecure ? 'ja' : 'nein'})`);

/**
 * Ohne .env (und damit ohne Admin aus der Konfiguration) stünde die Browser-Einrichtung jedem offen.
 * Deshalb: Liegt auf dem Server noch keine .env, wird api/.env.production VOR dem Code hochgeladen –
 * aber nur, wenn darin ein gültiger Admin steht. Eine vorhandene Server-.env wird nie überschrieben.
 * Die Sperrdateien (.htaccess) müssen vorher oben sein, sonst wäre die .env kurz öffentlich lesbar.
 */
async function ensureServerEnv(ftp) {
  const remoteEnv = `${remoteBaseDir}/.env`;
  if ((await ftp.list(remoteBaseDir)).some((f) => f.name === '.env')) {
    console.log('Server-.env vorhanden – bleibt unverändert.');
    return;
  }
  const localEnv = join(root, 'api', '.env.production');
  if (!existsSync(localEnv)) fail('Auf dem Server liegt keine .env und api/.env.production fehlt.');
  const values = Object.fromEntries(readFileSync(localEnv, 'utf8').split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.replace(/^(['"])(.*)\1$/, '$2')]));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.ADMIN_EMAIL ?? '')) fail('ADMIN_EMAIL in api/.env.production fehlt oder ist ungültig.');
  if ((values.ADMIN_PASSWORD ?? '').length < 10) fail('ADMIN_PASSWORD in api/.env.production fehlt oder hat weniger als 10 Zeichen.');
  if (!(values.APP_URL ?? '').startsWith('https://')) fail('APP_URL in api/.env.production muss mit https:// beginnen.');
  if (!ftpSecure) fail('Die .env wird nur verschlüsselt übertragen – FTP_SECURE=true setzen.');
  await ftp.uploadFrom(localEnv, remoteEnv);
  console.log('Erstinstallation: api/.env.production als Server-.env hochgeladen.');
}

/** Zugriffssperren zuerst: Ab hier sind .env, Konfiguration und Datenbank nicht mehr abrufbar. */
async function uploadProtection(ftp) {
  for (const dir of ['', 'config', 'storage']) {
    await ftp.ensureDir([remoteBaseDir, dir].filter(Boolean).join('/'));
    await ftp.uploadFrom(join(deployDir, dir, '.htaccess'), '.htaccess');
  }
  await ftp.cd(remoteBaseDir);
}

const client = new Client();
try {
  await client.access({
    host: env('FTP_HOST'),
    user: env('FTP_USER'),
    password: env('FTP_PASSWORD'),
    port: Number(env('FTP_PORT', '21')),
    secure: ftpSecure,
  });
  await uploadProtection(client);
  if (process.argv.includes('--protection-only')) {
    await client.uploadFrom(join(deployDir, '.env.example'), '.env.example');
    console.log('Nur Sperrdateien hochgeladen (zum Prüfen: /.env.example darf nicht abrufbar sein).');
    process.exit(0);
  }
  await ensureServerEnv(client);
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
