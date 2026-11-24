import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Input.module.css';

type WithInvalid = { invalid?: boolean };

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, WithInvalid {
  /** Dekoratives Icon links im Feld */
  icon?: IconName;
  /** Bedienelement rechts im Feld (z. B. Passwort anzeigen) */
  trailing?: ReactNode;
}

export function Input({ invalid, className, icon, trailing, ...rest }: InputProps) {
  const input = (
    <input
      className={cx(styles.control, invalid, [!!icon && styles.withIcon, !!trailing && styles.withTrailing, className])}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
  if (!icon && !trailing) return input;
  return (
    <span className={styles.group}>
      {icon && <Icon name={icon} className={styles.icon} />}
      {input}
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </span>
  );
}

export function Select({ invalid, className, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & WithInvalid) {
  return <select className={cx(styles.control, invalid, [className])} aria-invalid={invalid || undefined} {...rest} />;
}

export function Textarea({ invalid, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & WithInvalid) {
  return (
    <textarea
      className={cx(styles.control, invalid, [styles.textarea, className])}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

function cx(base: string | undefined, invalid: boolean | undefined, extra: Array<string | false | undefined>): string {
  return [base, invalid && styles.invalid, ...extra].filter(Boolean).join(' ');
}
