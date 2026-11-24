import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import styles from './Alert.module.css';

type Tone = 'danger' | 'success' | 'info';

const ICON: Record<Tone, IconName> = { danger: 'alert', success: 'check', info: 'info' };

interface AlertProps {
  tone?: Tone;
  /** Ohne Fläche, kleiner und gedämpft – für ruhige Hinweise (z. B. unter dem Login) */
  subtle?: boolean;
  children: ReactNode;
}

/**
 * Meldung mit Icon. Fehler werden per role="alert" sofort vorgelesen,
 * Erfolge als role="status"; dezente Hinweise sind normaler Text.
 */
export function Alert({ tone = 'danger', subtle = false, children }: AlertProps) {
  const role = subtle ? undefined : tone === 'danger' ? 'alert' : 'status';
  return (
    <div className={[styles.alert, styles[tone], subtle && styles.subtle].filter(Boolean).join(' ')} role={role}>
      <Icon name={ICON[tone]} size={subtle ? 18 : 20} className={styles.icon} />
      <div className={styles.body}>{children}</div>
    </div>
  );
}
