// Entfernt den vorherigen Vite-Build aus api/public, ohne index.php,
// .htaccess oder media/ anzufassen.
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '../api/public');

for (const entry of ['index.html', 'assets', 'favicon.svg']) {
  rmSync(join(publicDir, entry), { recursive: true, force: true });
}
console.log('api/public bereinigt.');
