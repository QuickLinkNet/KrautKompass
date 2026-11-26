import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  /** Schließen-Wunsch (X, Escape, Klick daneben) – der Aufrufer entscheidet */
  onRequestClose: () => void;
  title: string;
  /** Kleines Bild links vom Titel */
  media?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** full = Vollbild auf dem Handy, compact = kleine Rückfrage auf allen Geräten */
  size?: 'full' | 'compact';
}

/** Dialog auf Basis von <dialog>: Fokus bleibt im Dialog und kehrt danach zurück. */
export function Dialog({ open, onRequestClose, title, media, children, footer, size = 'full' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${styles[size]}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        if (e.target !== ref.current) return;
        e.preventDefault();
        e.stopPropagation();
        onRequestClose();
      }}
      onKeyDown={(e) => {
        // Chrome schließt beim zweiten Escape ohne „cancel“ – deshalb selbst behandeln
        if (e.key !== 'Escape') return;
        e.preventDefault();
        e.stopPropagation();
        onRequestClose();
      }}
      onClick={(e) => e.target === ref.current && onRequestClose()}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          {media}
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <IconButton icon="x" label="Schließen" onClick={onRequestClose} />
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
