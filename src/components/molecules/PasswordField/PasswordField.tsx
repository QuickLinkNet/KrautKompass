import { useState, type InputHTMLAttributes } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import { Input } from '../../atoms/Input/Input';
import styles from './PasswordField.module.css';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { invalid?: boolean };

/** Passwortfeld mit Schloss-Icon und Augen-Umschalter (hilft beim Tippen am Handy). */
export function PasswordField({ invalid, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  const toggle = (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setVisible((v) => !v)}
      aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
      aria-pressed={visible}
    >
      <Icon name={visible ? 'eyeOff' : 'eye'} />
    </button>
  );
  return (
    <Input
      {...rest}
      type={visible ? 'text' : 'password'}
      invalid={invalid}
      icon="lock"
      trailing={toggle}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
    />
  );
}
