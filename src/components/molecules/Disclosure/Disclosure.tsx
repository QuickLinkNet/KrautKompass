import { useState, type ReactNode } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './Disclosure.module.css';

interface DisclosureProps {
  title: string;
  /** Kurzinfo neben dem Titel, z. B. „2 gewählt“ */
  info?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Aufklappbare Gruppe (natives <details>). */
export function Disclosure({ title, info, defaultOpen = false, children }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details className={styles.details} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className={styles.summary}>
        <span className={styles.title}>{title}</span>
        {info && <span className={styles.info}>{info}</span>}
        <Icon name="chevronDown" size={20} className={styles.chevron} />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
