import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: Vite auf :5220, PHP-API auf :8095 (siehe README).
// Build: landet direkt im Webroot der API (api/public).
const apiTarget = process.env.KK_API_URL ?? 'http://127.0.0.1:8095';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5220,
    strictPort: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: false },
      '/media': { target: apiTarget, changeOrigin: false },
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
