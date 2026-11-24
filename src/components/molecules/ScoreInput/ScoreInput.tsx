import styles from './ScoreInput.module.css';

/**
 * Bewertung in halben Sternen. Intern 1–10 (wie die API), angezeigt als 0,5–5 Sterne.
 */
export function ScoreInput({ value, onChange, max = 10, label, optional = false }: {
  value: number | null;
  onChange: (next: number | null) => void;
  max?: number;
  label: string;
  optional?: boolean;
}) {
  const steps = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className={styles.wrap}>
      <div className={styles.scale} role="radiogroup" aria-label={label}>
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            role="radio"
            aria-checked={value === step}
            aria-label={`${(step / 2).toLocaleString('de-DE')} Sterne`}
            className={`${styles.step} ${step % 2 === 1 ? styles.half : ''} ${value !== null && step <= value ? styles.on : ''}`}
            onClick={() => onChange(step)}
          />
        ))}
      </div>
      <span className={styles.value}>{value === null ? '–' : `${(value / 2).toLocaleString('de-DE')} / 5`}</span>
      {optional && value !== null && (
        <button type="button" className={styles.clear} onClick={() => onChange(null)}>
          zurücksetzen
        </button>
      )}
    </div>
  );
}
