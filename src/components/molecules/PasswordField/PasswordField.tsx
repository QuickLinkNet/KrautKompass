import { useState, type InputHTMLAttributes } from 'react';
import { Input } from '../../atoms/Input/Input';
import styles from './PasswordField.module.css';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { invalid?: boolean };

/** Passwortfeld mit „Anzeigen“-Umschalter (hilft beim Tippen am Handy). */
export function PasswordField({ invalid, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.wrap}>
      <Input {...rest} type={visible ? 'text' : 'password'} invalid={invalid} className={styles.input}
        autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
        aria-pressed={visible}
      >
        {visible ? 'Verbergen' : 'Anzeigen'}
      </button>
    </div>
  );
}
