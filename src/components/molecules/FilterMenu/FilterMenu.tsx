import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './FilterMenu.module.css';

interface FilterMenuProps {
  label: string;
  /** Gewählter Wert als Kurztext, z. B. „4+“; macht den Knopf aktiv */
  summary: string | null;
  children: ReactNode;
}

/** Aufklappmenü für einen Filter (Desktop-Leiste). Schließt per Escape und Klick daneben. */
export function FilterMenu({ label, summary, children }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      root.current?.querySelector('button')?.focus();
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.menu} ref={root}>
      <button type="button" className={`${styles.trigger} ${summary ? styles.active : ''}`} aria-expanded={open}
        aria-controls={id} onClick={() => setOpen(!open)}>
        {summary && <Icon name="tick" size={16} />}
        <span>{label}{summary ? `: ${summary}` : ''}</span>
        <Icon name="chevronDown" size={16} />
      </button>
      {open && <div id={id} className={styles.panel} role="group" aria-label={label}>{children}</div>}
    </div>
  );
}
