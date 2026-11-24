import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './Input.module.css';

type WithInvalid = { invalid?: boolean };

export function Input({ invalid, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & WithInvalid) {
  return <input className={cx(styles.control, invalid, className)} aria-invalid={invalid || undefined} {...rest} />;
}

export function Select({ invalid, className, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & WithInvalid) {
  return <select className={cx(styles.control, invalid, className)} aria-invalid={invalid || undefined} {...rest} />;
}

export function Textarea({ invalid, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & WithInvalid) {
  return (
    <textarea
      className={cx(`${styles.control} ${styles.textarea}`, invalid, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

function cx(base: string | undefined, invalid?: boolean, extra?: string): string {
  return [base, invalid && styles.invalid, extra].filter(Boolean).join(' ');
}
