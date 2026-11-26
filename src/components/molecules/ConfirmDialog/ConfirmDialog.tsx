import type { ReactNode } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Alert } from '../Alert/Alert';
import { Dialog } from '../Dialog/Dialog';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  /** Sichere Wahl, steht vorne und ist hervorgehoben */
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

/** Rückfrage vor einem Schritt, der Eingaben oder Daten verwirft. */
export function ConfirmDialog({ open, title, children, cancelLabel, confirmLabel, onCancel, onConfirm, loading, error }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onRequestClose={onCancel}
      title={title}
      size="compact"
      footer={
        <div className={styles.actions}>
          <Button type="button" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button type="button" variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      }
    >
      {children}
      {error && <div className={styles.error}><Alert>{error}</Alert></div>}
    </Dialog>
  );
}
