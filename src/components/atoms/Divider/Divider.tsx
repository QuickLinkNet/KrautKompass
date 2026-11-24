import styles from './Divider.module.css';

/** Horizontale Trennlinie, optional mit Beschriftung in der Mitte (z. B. „oder“). */
export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className={styles.line} />;
  return (
    <div className={styles.labelled} role="separator" aria-label={label}>
      <span aria-hidden="true">{label}</span>
    </div>
  );
}
