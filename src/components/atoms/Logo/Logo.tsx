import logoUrl from '../../../../design/assets/logo.svg';
import logoWhiteUrl from '../../../../design/assets/logo-white.svg';
import styles from './Logo.module.css';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** light = weiße Variante für Fotos und dunkle Flächen */
  tone?: 'default' | 'light';
  className?: string;
}

/** Wort-Bild-Marke aus dem Design-Kit (design/assets/logo*.svg, Seitenverhältnis 609:90). */
export function Logo({ size = 'md', tone = 'default', className }: LogoProps) {
  return (
    <img
      src={tone === 'light' ? logoWhiteUrl : logoUrl}
      alt="KrautKompass"
      width={609}
      height={90}
      className={[styles.logo, styles[size], className].filter(Boolean).join(' ')}
      decoding="async"
    />
  );
}
