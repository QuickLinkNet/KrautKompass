import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Schriften lokal ausgeliefert (keine externen Font-Requests, DSGVO): variable Fonts, je eine Datei pro Schriftsystem
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/playfair-display/wght.css';
import './styles/global.css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('#root fehlt in index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
