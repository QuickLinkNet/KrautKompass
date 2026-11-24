import { ICONS, type IconName } from './icons';
import styles from './Icon.module.css';

interface IconProps {
  name: IconName;
  /** Kantenlänge in px (Standard 20) */
  size?: 14 | 16 | 18 | 20 | 24;
  /** Fläche füllen (z. B. gemerktes Herz, Sterne) */
  filled?: boolean;
  className?: string;
  /** Nur setzen, wenn das Icon allein Bedeutung trägt – sonst dekorativ */
  label?: string;
}

export function Icon({ name, size = 20, className, label, filled = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={[styles.icon, filled && styles.filled, className].filter(Boolean).join(' ')}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

export type { IconName };
