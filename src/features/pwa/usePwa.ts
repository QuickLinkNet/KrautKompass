import { useSyncExternalStore } from 'react';
import { applyUpdate, getState, promptInstall, subscribe } from './pwa';

/** Zustand der installierbaren App für Komponenten. */
export function usePwa() {
  const state = useSyncExternalStore(subscribe, getState, getState);
  return {
    ...state,
    /** Installieren ist möglich: direkt (Browser-Dialog) oder per Anleitung (iPhone) */
    installable: !state.standalone && (state.canPrompt || state.ios),
    promptInstall,
    applyUpdate,
  };
}

const subscribeOnline = (listener: () => void) => {
  window.addEventListener('online', listener);
  window.addEventListener('offline', listener);
  return () => {
    window.removeEventListener('online', listener);
    window.removeEventListener('offline', listener);
  };
};

/** true, solange das Gerät eine Netzverbindung meldet */
export function useOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}
