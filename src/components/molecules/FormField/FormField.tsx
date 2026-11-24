import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  /** id des Eingabefelds; ohne (z. B. bei Chip-Gruppen) wird das Label reiner Text */
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/**
 * Label + Feld + Hinweis/Fehler. Verknüpft Hinweis und Fehler per aria-describedby mit dem Feld,
 * damit Screenreader sie beim Fokus vorlesen.
 */
export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  const fallbackId = useId();
  const messageId = error || hint ? `${htmlFor ?? fallbackId}-message` : undefined;
  const field = isValidElement(children) && htmlFor && messageId
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': messageId })
    : children;

  return (
    <div className={styles.field}>
      {htmlFor ? (
        <label className={styles.label} htmlFor={htmlFor}>{label}</label>
      ) : (
        <span className={styles.label}>{label}</span>
      )}
      {field}
      {error ? (
        <p id={messageId} className={styles.error}>
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : (
        hint && <p id={messageId} className={styles.hint}>{hint}</p>
      )}
    </div>
  );
}
