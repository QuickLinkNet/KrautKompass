import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import { pwa } from './scripts/pwa/plugin.ts';

// Dev: Vite auf :5220, API-Ziel setzt scripts/dev.mjs (lokal :8095 oder die Live-API, siehe README).
// Build: landet direkt im Webroot der API (api/public).
const apiTarget = process.env.KK_API_URL ?? 'http://127.0.0.1:8095';
const proxy: ProxyOptions = {
  target: apiTarget,
  // Die Live-API braucht ihren eigenen Hostnamen (TLS, Virtual Host).
  changeOrigin: apiTarget.startsWith('https:'),
  configure: (server) =>
    server.on('proxyRes', (response) => {
      // Das Live-Cookie ist "Secure", der Dev-Server läuft ohne HTTPS. Gilt nur hier lokal.
      const cookies = response.headers['set-cookie'];
      if (cookies) response.headers['set-cookie'] = cookies.map((c) => c.replace(/;\s*secure/i, ''));
    }),
};

export default defineConfig({
  plugins: [react(), pwa()],
  server: {
    port: 5220,
    strictPort: true,
    proxy: {
      '/api': proxy,
      '/media': proxy,
    },
    // Das PHP-Backend (Datenbank, Bilder, Logs) gehört nicht in den Vite-Watcher.
    watch: { ignored: ['**/api/**'] },
  },
  build: {
    outDir: 'api/public',
    // api/public enthält auch index.php, .htaccess und media/ – nicht leeren.
    // Alte Build-Dateien entfernt scripts/clean-public.mjs.
    emptyOutDir: false,
  },
});
