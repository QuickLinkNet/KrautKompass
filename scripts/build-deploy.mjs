// Baut das Deploy-Paket für die Adresse aus .env.deploy (PUBLIC_APP_URL).
// Liegt die App dort in einem Unterordner (…/apps/krautkompass), wird der Build dafür erzeugt.
// Danach wird lokal wieder der normale Build (Pfad "/") hergestellt.
import { spawnSync } from 'node:child_process';

process.loadEnvFile('.env.deploy');
const base = new URL(process.env.PUBLIC_APP_URL).pathname.replace(/\/*$/, '/');

function run(command, args) {
  const result = spawnSync(process.execPath, [command, ...args], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const build = (target) => {
  run('scripts/clean-public.mjs', []);
  run('node_modules/vite/bin/vite.js', ['build', '--base', target, '--logLevel', 'warn']);
};

console.log(`Baue für Pfad ${base}`);
build(base);
run('scripts/prepare-deploy.mjs', []);
if (base !== '/') build('/');
