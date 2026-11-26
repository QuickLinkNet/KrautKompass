import type { JournalSummary } from '../../../features/journal/journalSummary';
import { effectIcon } from '../../../features/catalog/catalogQuery';
import { methodIcon } from '../../../features/journal/methodIcon';
import { formatStarValue } from '../../../utils/format';
import { Badge } from '../../atoms/Badge/Badge';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import styles from './JournalOverview.module.css';

interface JournalOverviewProps {
  summary: JournalSummary;
  label: { effect: (key: string) => string; method: (key: string) => string };
}

/** Überblick „Dein Kompass“: Kennzahlen, häufigste Wirkungen, meistgenutzte Konsumform. */
export function JournalOverview({ summary, label }: JournalOverviewProps) {
  const stats: { icon: IconName; value: string; text: string }[] = [
    { icon: 'star', value: String(summary.count), text: summary.count === 1 ? 'Bewertung' : 'Bewertungen' },
    { icon: 'star', value: summary.average === null ? '–' : `Ø ${formatStarValue(summary.average)}`, text: 'Sterne' },
    { icon: 'check', value: String(summary.again), text: 'würdest du wieder nehmen' },
  ];

  return (
    <section className={styles.overview} aria-label="Überblick">
      <ul className={styles.stats}>
        {stats.map((s) => (
          <li key={s.text} className={styles.stat}>
            <Icon name={s.icon} size={20} filled={s.icon === 'star'} className={styles.statIcon} />
            <span><strong className={styles.value}>{s.value}</strong> <span className={styles.text}>{s.text}</span></span>
          </li>
        ))}
      </ul>
      {summary.topEffects.length > 0 && (
        <div className={styles.effects}>
          <span className={styles.caption}>Am häufigsten:</span>
          {summary.topEffects.map((e) => <Badge key={e} tone="effect" icon={effectIcon(e)}>{label.effect(e)}</Badge>)}
        </div>
      )}
      {summary.topMethod && (
        <p className={styles.method}>
          <Icon name={methodIcon(summary.topMethod)} size={20} />
          Meist per {label.method(summary.topMethod)}
        </p>
      )}
    </section>
  );
}
