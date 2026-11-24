import { useEffect, useRef, useState } from 'react';

/**
 * Lokaler Entwurf für Eingaben, die erst nach einer Pause übernommen werden
 * (Suche, Schieberegler) – sonst gäbe es bei jedem Tastendruck einen Request.
 * Ändert sich der Wert von außen (z. B. „Alle zurücksetzen“), folgt der Entwurf.
 */
export function useDraft<T>(value: T, commit: (value: T) => void, delay = 350) {
  const [draft, setDraft] = useState(value);
  const pending = useRef(false);
  const commitRef = useRef(commit);
  commitRef.current = commit;
  const outside = JSON.stringify(value);

  useEffect(() => {
    if (!pending.current) setDraft(JSON.parse(outside) as T);
  }, [outside]);

  useEffect(() => {
    if (!pending.current) return undefined;
    const timer = setTimeout(() => {
      pending.current = false;
      commitRef.current(draft);
    }, delay);
    return () => clearTimeout(timer);
  }, [draft, delay]);

  const change = (next: T) => {
    pending.current = true;
    setDraft(next);
  };
  return [draft, change] as const;
}
