import { useEffect, useId, useRef, useState } from 'react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import styles from './ActionMenu.module.css';

export interface MenuAction {
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
}

interface ActionMenuProps {
  /** Beschriftung für Screenreader, z. B. „Aktionen für Kathrin“ */
  label: string;
  actions: MenuAction[];
}

/** Menü „…“ mit wenigen Aktionen. Schließt per Escape, Klick daneben oder nach der Auswahl. */
export function ActionMenu({ label, actions }: ActionMenuProps) {
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
    root.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.menu} ref={root}>
      <IconButton icon="dots" label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={id}
        onClick={() => setOpen(!open)} />
      {open && (
        <div id={id} role="menu" aria-label={label} className={styles.panel}>
          {actions.map((a) => (
            <button key={a.label} type="button" role="menuitem" className={`${styles.item} ${a.tone === 'danger' ? styles.danger : ''}`}
              onClick={() => {
                setOpen(false);
                a.onSelect();
              }}>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
