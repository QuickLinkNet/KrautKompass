import { formatPercent } from '../../../utils/format';
import styles from './StatBar.module.css';

/** THC/CBD-Anzeige mit Balken, wie auf den Produktkarten des Shops. */
export function StatBar({ label, value, max = 35, tone = 'accent' }: {
  label: string;
  value: number | null;
  max?: number;
  tone?: 'accent' | 'warm';
}) {
  const width = value === null ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className={styles.stat}>
      <div className={styles.row}>
        <span>{label}</span>
        <span>{formatPercent(value)}</span>
      </div>
      <div className={styles.track}>
        <div className={`${styles.fill} ${styles[tone]}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
