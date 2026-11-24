import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../utils/errorMessage';

interface AsyncResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Neu laden; silent = ohne Lade-Zustand (z. B. nach dem Speichern) */
  reload: (silent?: boolean) => Promise<void>;
}

/**
 * Lädt Daten über eine async Funktion und lädt neu, wenn sich die deps ändern.
 * Veraltete Antworten (Race Conditions bei schnellen Filterwechseln) werden verworfen.
 */
export function useAsyncResource<T>(loader: () => Promise<T>, deps: unknown[]): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Bewusst über deps gesteuert: loader ist meist eine Inline-Funktion.
  const load = useCallback(loader, deps);

  const reload = useCallback(
    async (silent = false) => {
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      try {
        const result = await load();
        if (id === requestId.current) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        if (id === requestId.current) setError(errorMessage(e));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [load],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
