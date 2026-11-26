// Startet die Entwicklung mit einem Befehl:
//   npm run dev               PHP-API (lokal, :8095) + Vite (:5220)
//   npm run dev:live          nur Vite, /api und /media gehen an die Live-API
//   npm run dev -- --host     zusätzlich im WLAN erreichbar (iPhone)
// Weitere Argumente gehen unverändert an Vite.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { connect } from 'node:net';

const API_PORT = 8095;
const LIVE_FALLBACK = 'https://krautkompass.red-it.org';
const args = process.argv.slice(2);
const live = args.includes('--live');
const viteArgs = args.filter((arg) => arg !== '--live');
const children = [];

function fail(message) {
  console.error(`\n${message}\n`);
  stop(1);
}

function stop(code) {
  for (const child of children) child.kill();
  process.exit(code);
}

function start(command, commandArgs, env = {}) {
  const child = spawn(command, commandArgs, { stdio: 'inherit', env: { ...process.env, ...env } });
  children.push(child);
  return child;
}

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = connect({ host: '127.0.0.1', port, timeout: 1000 });
    const done = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.once('timeout', () => done(false));
  });
}

/** Fragt /api/system/status ab. Liefert die Antwort oder wirft mit verständlicher Begründung. */
async function status(target) {
  let response;
  try {
    response = await fetch(`${target}/api/system/status`, { signal: AbortSignal.timeout(15_000) });
  } catch (error) {
    const code = error.cause?.code ?? error.name;
    if (String(code).includes('CERT') || String(code).includes('ALTNAME')) {
      throw new Error(`Das SSL-Zertifikat von ${target} passt nicht (${code}).`);
    }
    throw new Error(`${target} ist nicht erreichbar (${code}).`);
  }
  const body = await response.json().catch(() => null);
  const data = body?.data ?? body;
  if (!response.ok || data?.app === undefined) {
    throw new Error(`${target} antwortet mit HTTP ${response.status} statt mit der KrautKompass-API.`);
  }
  return data;
}

async function liveTarget() {
  if (existsSync('.env.deploy')) process.loadEnvFile('.env.deploy');
  const url = new URL(process.env.PUBLIC_APP_URL ?? LIVE_FALLBACK);
  if (url.pathname !== '/') fail('dev:live braucht eine Adresse ohne Unterordner (PUBLIC_APP_URL in .env.deploy).');
  if (url.protocol !== 'https:') fail('dev:live läuft nur über https, sonst ginge das Passwort unverschlüsselt durchs Netz.');
  try {
    const info = await status(url.origin);
    if (!info.installed) fail('Die Live-API ist noch nicht eingerichtet.');
  } catch (error) {
    fail(`Live-API nicht nutzbar: ${error.message}\nLokal geht es mit: npm run dev`);
  }
  console.log(`\n  ACHTUNG: echte Live-Daten von ${url.origin} – Bewertungen landen in der echten Datenbank.\n`);
  return url.origin;
}

async function localTarget() {
  const target = `http://127.0.0.1:${API_PORT}`;
  if (!(await portOpen(API_PORT))) {
    if (!existsSync('api/.env')) fail('api/.env fehlt. Bitte api/.env.example kopieren und den Admin eintragen.');
    const php = start('php', ['-S', `127.0.0.1:${API_PORT}`, '-t', 'api/public', 'api/dev-router.php']);
    php.on('error', () => fail('PHP wurde nicht gefunden. Bitte PHP 8.1 oder neuer installieren.'));
    for (let i = 0; i < 20 && !(await portOpen(API_PORT)); i++) await new Promise((r) => setTimeout(r, 250));
  }
  try {
    await status(target);
  } catch (error) {
    fail(`Lokale API startet nicht: ${error.message}`);
  }
  return target;
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

const target = live ? await liveTarget() : await localTarget();
start(process.execPath, ['node_modules/vite/bin/vite.js', ...viteArgs], { KK_API_URL: target }).on('exit', (code) =>
  stop(code ?? 0),
);
