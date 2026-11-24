import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Choice.module.css';

interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'checkbox' | 'radio';
  children: ReactNode;
}

/** Checkbox oder Radio mit Beschriftung; die ganze Zeile ist klickbar (44 px hoch). */
export function Choice({ type = 'checkbox', children, className, ...rest }: ChoiceProps) {
  return (
    <label className={[styles.choice, className].filter(Boolean).join(' ')}>
      <input type={type} className={styles.input} {...rest} />
      <span className={styles.label}>{children}</span>
    </label>
  );
}
