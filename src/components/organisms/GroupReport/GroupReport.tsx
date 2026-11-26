import type { GroupSummary } from '../../../api/types';
import { effectIcon } from '../../../features/catalog/catalogQuery';
import { DETAIL_SCORES } from '../../../features/rating/ratingDraft';
import { Badge } from '../../atoms/Badge/Badge';
import { Card } from '../../atoms/Card/Card';
import { RatingStars } from '../../atoms/RatingStars/RatingStars';
import styles from './GroupReport.module.css';

const MAX_EFFECTS = 6;

/** „Das berichtet die Runde“ – Wirkungen und Durchschnitte der geteilten Bewertungen. */
export function GroupReport({ summary, effectLabel }: { summary: GroupSummary; effectLabel: (key: string) => string }) {
  const scores = DETAIL_SCORES.filter(({ key }) => summary.averages[key] !== null);
  if (summary.effects.length === 0 && scores.length === 0) return null;
  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>Das berichtet die Runde</h2>
      {summary.effects.length > 0 && (
        <ul className={styles.effects} aria-label="Wirkungen">
          {summary.effects.slice(0, MAX_EFFECTS).map(({ key, count }) => (
            <li key={key}>
              <Badge tone="effect" icon={effectIcon(key)}>
                {effectLabel(key)} <strong aria-label={`${count}-mal genannt`}>{count}</strong>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      {scores.length > 0 && (
        <dl className={styles.scores}>
          {scores.map(({ key, label }) => (
            <div key={key} className={styles.score}>
              <dt>{label}</dt>
              <dd><RatingStars value={summary.averages[key]} /></dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}
