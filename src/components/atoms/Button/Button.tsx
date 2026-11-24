import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface StyleProps {
  variant?: Variant;
  size?: 'sm' | 'md';
  block?: boolean;
  /** Icon vor dem Text */
  icon?: IconName;
  /** Icon nach dem Text (z. B. Pfeil) */
  iconEnd?: IconName;
}

function classes({ variant = 'primary', size = 'md', block = false }: StyleProps, extra?: string, loading = false) {
  return [styles.button, styles[variant], styles[size], block && styles.block, loading && styles.loading, extra]
    .filter(Boolean)
    .join(' ');
}

function Content({ icon, iconEnd, children }: { icon?: IconName; iconEnd?: IconName; children: ReactNode }) {
  return (
    <>
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
      {iconEnd && <Icon name={iconEnd} size={18} />}
    </>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  /** Zeigt einen Ladeindikator, sperrt den Button und meldet aria-busy */
  loading?: boolean;
}

export function Button({ variant, size, block, icon, iconEnd, loading = false, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={classes({ variant, size, block }, className, loading)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Content icon={loading ? undefined : icon} iconEnd={loading ? undefined : iconEnd}>{children}</Content>
    </button>
  );
}

/** Navigation im Button-Look (z. B. „Mit Einladungscode registrieren“). */
export function ButtonLink({ variant = 'secondary', size, block, icon, iconEnd, className, children, ...rest }: LinkProps & StyleProps) {
  return (
    <Link className={classes({ variant, size, block }, className)} {...rest}>
      <Content icon={icon} iconEnd={iconEnd}>{children}</Content>
    </Link>
  );
}
