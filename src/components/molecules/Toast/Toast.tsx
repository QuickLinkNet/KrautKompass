import { useEffect } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './Toast.module.css';

interface ToastProps {
  /** Text der Meldung; null = nichts anzeigen */
  message: string | null;
  onDone: () => void;
  durationMs?: number;
  /** info = Hinweis ohne Häkchen (z. B. wenn Kopieren nicht ging) */
  tone?: 'success' | 'info';
}

/** Kurze Bestätigung unten am Bildschirm („Link kopiert“), verschwindet von selbst. */
export function Toast({ message, onDone, durationMs = 2500, tone = 'success' }: ToastProps) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, onDone, durationMs]);

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {message && (
        <p className={styles.toast}>
          <Icon name={tone === 'success' ? 'check' : 'info'} size={20} />
          {message}
        </p>
      )}
    </div>
  );
}
