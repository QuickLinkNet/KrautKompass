/**
 * Installierbare App: Service Worker, Installieren und Updates. Ein kleiner Speicher außerhalb von React,
 * damit das Installations-Angebot des Browsers schon vor dem ersten Rendern aufgefangen wird.
 */

/** Chromium-Ereignis „App installieren“ (nicht in den Standard-Typen enthalten) */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaState {
  /** Läuft bereits als installierte App (Home-Bildschirm, Dock) */
  standalone: boolean;
  /** Browser kann direkt installieren (Android, Chrome, Edge) */
  canPrompt: boolean;
  /** iPhone/iPad: Installieren nur über „Teilen → Zum Home-Bildschirm“ */
  ios: boolean;
  /** Eine neue Version ist geladen und wartet */
  updateReady: boolean;
}

let installEvent: InstallPromptEvent | null = null;
let waitingWorker: ServiceWorker | null = null;
const listeners = new Set<() => void>();

function detectIos() {
  const ua = navigator.userAgent;
  // iPadOS meldet sich als Mac, hat aber Touch
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

function detectStandalone() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

let state: PwaState = { standalone: false, canPrompt: false, ios: false, updateReady: false };

function update(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getState = () => state;

/** Öffnet den Installations-Dialog des Browsers. Liefert true, wenn installiert wurde. */
export async function promptInstall() {
  if (!installEvent) return false;
  const event = installEvent;
  installEvent = null;
  update({ canPrompt: false });
  await event.prompt();
  return (await event.userChoice).outcome === 'accepted';
}

/** Aktiviert die wartende Version; die Seite lädt danach neu. */
export function applyUpdate() {
  waitingWorker?.postMessage('SKIP_WAITING');
}

function watchRegistration(registration: ServiceWorkerRegistration) {
  const offer = (worker: ServiceWorker | null) => {
    // Nur ein Update anbieten, wenn schon eine Version läuft (nicht beim allerersten Besuch)
    if (worker && navigator.serviceWorker.controller) {
      waitingWorker = worker;
      update({ updateReady: true });
    }
  };
  offer(registration.waiting);
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => worker.state === 'installed' && offer(worker));
  });
  // Lange offene App (iPhone im Hintergrund): beim Zurückkommen nach Updates sehen
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') registration.update().catch(() => {});
  });
}

export function initPwa() {
  update({ standalone: detectStandalone(), ios: detectIos() });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installEvent = event as InstallPromptEvent;
    update({ canPrompt: true });
  });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    update({ canPrompt: false, standalone: true });
  });

  // Nur im Build: Im Dev-Server würde ein Service Worker alte Dateien festhalten.
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (waitingWorker && !reloading) {
      reloading = true;
      window.location.reload();
    }
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .then(watchRegistration)
      .catch(() => {
        // Ohne Service Worker läuft die App normal weiter, nur ohne Offline-Start.
      });
  });
}
