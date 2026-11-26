import styles from './Skeleton.module.css';

/** Grauer Platzhalter während des Ladens (rein dekorativ). */
export function Skeleton({ className }: { className?: string }) {
  return <span className={[styles.skeleton, className].filter(Boolean).join(' ')} aria-hidden="true" />;
}
