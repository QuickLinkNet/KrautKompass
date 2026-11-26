import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

/**
 * Das Bewerten ist ein eigener Verlaufseintrag: Die Zurück-Geste schließt den Dialog,
 * statt die Seite zu verlassen. Gibt es ungespeicherte Eingaben, bleibt er offen und fragt nach.
 */
export function useRatingRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as Record<string, unknown> | null;
  const routed = state?.rating === true;
  const [open, setOpen] = useState(routed);
  /** Vom Dialog gesetzt: true = darf schließen, false = fragt gerade nach */
  const mayClose = useRef<() => boolean>(() => true);
  const closing = useRef(false);

  const push = useCallback(() => {
    void navigate(location.pathname + location.search, { state: { ...state, rating: true } });
  }, [navigate, location.pathname, location.search, state]);

  useEffect(() => {
    if (routed) {
      setOpen(true);
    } else if (open) {
      if (closing.current || mayClose.current()) setOpen(false);
      else push();
    }
    closing.current = false;
    // Nur auf den Wechsel des Verlaufseintrags reagieren
  }, [routed]);

  const close = useCallback(() => {
    closing.current = true;
    if (routed) void navigate(-1);
    else setOpen(false);
  }, [navigate, routed]);

  return { open, start: push, close, mayClose };
}
