// Vite-Plugin für die installierbare App (PWA), ohne zusätzliche Abhängigkeit:
//  - Manifest (manifest.webmanifest) mit Icons, Farben aus design/tokens.json und Kurzbefehlen
//  - Service Worker (sw.js) mit Liste der Build-Dateien für den Offline-Start
// Beides liegt im Build neben index.html und berücksichtigt einen Unterordner (--base).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path);
const tokens = JSON.parse(read('design/tokens.json').toString()) as { color: Record<string, string> };

const ICONS = [
  { file: 'icon-192.png', sizes: '192x192', purpose: 'any' },
  { file: 'icon-512.png', sizes: '512x512', purpose: 'any' },
  { file: 'icon-maskable-512.png', sizes: '512x512', purpose: 'maskable' },
] as const;

const SCREENSHOTS = [
  { file: 'screenshot-schmal.webp', sizes: '780x1688', form_factor: 'narrow', label: 'Sortenkatalog auf dem iPhone' },
  { file: 'screenshot-breit.webp', sizes: '1440x900', form_factor: 'wide', label: 'Sortenkatalog am Computer' },
] as const;

/** Schriftdateien, die vorab gespeichert werden (Deutsch braucht nur Latin und Latin-Ext). */
const PRECACHE_FONT = /(latin|latin-ext)-wght-normal-[\w-]+\.woff2$/;
const PRECACHE_SKIP = /\.(woff2|map)$/;

function manifest(base: string, url: (file: string) => string) {
  return {
    id: base,
    name: 'KrautKompass',
    short_name: 'KrautKompass',
    description: 'Dein privates Journal für medizinische Cannabis-Bewertungen.',
    lang: 'de',
    dir: 'ltr',
    start_url: base,
    scope: base,
    display: 'standalone',
    background_color: tokens.color.background,
    theme_color: tokens.color.background,
    categories: ['health', 'lifestyle'],
    icons: ICONS.map((icon) => ({ src: url(icon.file), sizes: icon.sizes, type: 'image/png', purpose: icon.purpose })),
    screenshots: SCREENSHOTS.map(({ file, ...rest }) => ({ src: url(file), type: 'image/webp', ...rest })),
    shortcuts: [
      { name: 'Sortenkatalog', url: base, icons: [{ src: url('icon-192.png'), sizes: '192x192' }] },
      { name: 'Journal', url: `${base}bewertungen`, icons: [{ src: url('icon-192.png'), sizes: '192x192' }] },
    ],
  };
}

export function pwa(): Plugin {
  let base = '/';
  return {
    name: 'krautkompass-pwa',
    enforce: 'post',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: () => [
      { tag: 'link', attrs: { rel: 'manifest', href: `${base}manifest.webmanifest` }, injectTo: 'head' },
      { tag: 'link', attrs: { rel: 'apple-touch-icon', href: `${base}apple-touch-icon.png` }, injectTo: 'head' },
    ],
    // Dev: Manifest und Icons ausliefern, damit sich die App auch lokal prüfen lässt (ohne Service Worker).
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] ?? '';
        if (path === `${base}manifest.webmanifest`) {
          res.setHeader('Content-Type', 'application/manifest+json');
          res.end(JSON.stringify(manifest(base, (file) => `${base}design/assets/pwa/${file}`)));
        } else if (path === `${base}apple-touch-icon.png`) {
          res.setHeader('Content-Type', 'image/png');
          res.end(read('design/assets/pwa/apple-touch-icon.png'));
        } else next();
      });
    },
    generateBundle(_options, bundle) {
      const emitted: Record<string, string> = {};
      for (const { file } of [...ICONS, ...SCREENSHOTS]) {
        const ref = this.emitFile({ type: 'asset', name: file, source: read(`design/assets/pwa/${file}`) });
        emitted[file] = this.getFileName(ref);
      }
      this.emitFile({ type: 'asset', fileName: 'apple-touch-icon.png', source: read('design/assets/pwa/apple-touch-icon.png') });
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: JSON.stringify(manifest(base, (file) => `${base}${emitted[file]}`), null, 2),
      });

      const precache = Object.keys(bundle)
        .filter((file) => file.startsWith('assets/'))
        .filter((file) => PRECACHE_FONT.test(file) || !PRECACHE_SKIP.test(file))
        .filter((file) => !/screenshot-/.test(file))
        .sort();
      const version = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12);
      const sw = read('scripts/pwa/sw.js')
        .toString()
        .replace("'__VERSION__'", JSON.stringify(version))
        .replace('[] /* __PRECACHE__ */', JSON.stringify(precache));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: sw });
    },
  };
}
