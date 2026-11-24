import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './IconButton.module.css';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName;
  /** Pflicht: Icon-Buttons brauchen einen zugänglichen Namen */
  label: string;
  /** ghost = ohne Rahmen (Herz), outline = runder Rahmen (Pfeil), solid = gefüllt */
  variant?: 'ghost' | 'outline' | 'solid';
  /** Icon gefüllt darstellen (z. B. gemerkt) */
  filled?: boolean;
}

/** Quadratischer Button nur mit Icon, mind. 44 × 44 px Trefferfläche (iOS). */
export function IconButton({ icon, label, variant = 'ghost', filled = false, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      <Icon name={icon} size={20} filled={filled} />
    </button>
  );
}
