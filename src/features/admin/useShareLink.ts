import { useCallback, useState } from 'react';

/** Link kopieren oder über das Teilen-Menü des Geräts verschicken, mit kurzer Bestätigung. */
export function useShareLink() {
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setToast({ text: 'Link kopiert', ok: true });
    } catch {
      // Ältere Browser oder fehlendes Recht: über ein unsichtbares Feld kopieren, sonst Hinweis (nie blockieren)
      const ok = legacyCopy(url);
      setToast({ text: ok ? 'Link kopiert' : 'Kopieren nicht möglich – bitte den Link markieren', ok });
    }
  }, []);

  const share = useCallback(async (url: string, name: string | null) => {
    try {
      await navigator.share({
        title: 'Einladung zu KrautKompass',
        text: name ? `Hallo ${name}, hier ist deine Einladung zu KrautKompass:` : 'Deine Einladung zu KrautKompass:',
        url,
      });
    } catch (e) {
      // Abbrechen im Teilen-Menü ist kein Fehler; sonst wenigstens kopieren
      if (!(e instanceof DOMException && e.name === 'AbortError')) await copy(url);
    }
  }, [copy]);

  return { canShare, copy, share, toast, clearToast: useCallback(() => setToast(null), []) };
}

function legacyCopy(text: string): boolean {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
  }
}
