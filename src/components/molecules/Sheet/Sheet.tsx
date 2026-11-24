import { useEffect, useRef, type ReactNode } from 'react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import styles from './Sheet.module.css';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Fester Bereich unten (z. B. „128 Sorten anzeigen“) */
  footer?: ReactNode;
}

/**
 * Bottom-Sheet auf Basis von <dialog>: Fokus bleibt im Sheet, Escape und
 * Tipp auf den Hintergrund schließen, der Fokus kehrt danach zurück.
 */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      aria-labelledby="sheet-title"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="sheet-title" className={styles.title}>{title}</h2>
          <IconButton icon="x" label="Schließen" onClick={onClose} />
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
