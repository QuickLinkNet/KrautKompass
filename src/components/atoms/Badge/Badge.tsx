import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Badge.module.css';

/**
 * metric = Kennzahl (THC/CBD), effect = Wirkung (grün hinterlegt, mit Icon),
 * plain = Terpen (dezent, ohne Fläche); übrige Töne für Status-Anzeigen.
 */
type Tone = 'neutral' | 'success' | 'accent' | 'primary' | 'danger' | 'metric' | 'effect' | 'plain';

interface BadgeProps {
  tone?: Tone;
  icon?: IconName;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
