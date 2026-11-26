import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import styles from './StateMessage.module.css';

interface StateMessageProps {
  icon: IconName;
  title: string;
  text?: string;
  tone?: 'default' | 'danger';
  /** Knopf oder Link darunter */
  children?: ReactNode;
}

/** Ruhige Meldung für Leer-, Treffer- und Fehlerzustände. */
export function StateMessage({ icon, title, text, tone = 'default', children }: StateMessageProps) {
  return (
    <div className={styles.state} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon name={icon} size={24} className={tone === 'danger' ? styles.danger : styles.icon} />
      <p className={styles.title}>{title}</p>
      {text && <p className={styles.text}>{text}</p>}
      {children}
    </div>
  );
}
