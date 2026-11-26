import { Button, ButtonLink } from '../../atoms/Button/Button';
import type { IconName } from '../../atoms/Icon/Icon';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import { StateMessage } from '../../molecules/StateMessage/StateMessage';
import styles from './JournalState.module.css';

type Kind = 'empty' | 'emptyFavorites' | 'noResults' | 'error';

const CONTENT: Record<Kind, { icon: IconName; title: string; text?: string }> = {
  empty: {
    icon: 'leaf',
    title: 'Dein Kompass ist noch leer.',
    text: 'Bewerte deine erste Sorte – nach und nach siehst du hier, was dir guttut.',
  },
  emptyFavorites: { icon: 'heart', title: 'Noch nichts gemerkt.', text: 'Tippe im Katalog auf das Herz.' },
  noResults: { icon: 'search', title: 'Keine Bewertung passt zu deinen Filtern.' },
  error: { icon: 'alert', title: 'Journal konnte nicht geladen werden' },
};

interface JournalStateProps {
  kind: Kind;
  onAction?: () => void;
}

/** Leer-, Treffer- und Fehlerzustände des Journals. */
export function JournalState({ kind, onAction }: JournalStateProps) {
  const c = CONTENT[kind];
  return (
    <StateMessage icon={c.icon} title={c.title} text={c.text} tone={kind === 'error' ? 'danger' : 'default'}>
      {kind === 'empty' && <ButtonLink to="/" variant="primary" iconEnd="arrowRight">Zum Sortenkatalog</ButtonLink>}
      {kind === 'noResults' && <Button variant="secondary" iconEnd="reset" onClick={onAction}>Filter zurücksetzen</Button>}
      {kind === 'error' && <Button iconEnd="refresh" onClick={onAction}>Erneut versuchen</Button>}
    </StateMessage>
  );
}

/** Platzhalter, solange das Journal lädt */
export function JournalSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Journal wird geladen">
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.row}>
          <Skeleton className={styles.thumb} />
          <div className={styles.lines}><Skeleton /><Skeleton /><Skeleton /></div>
        </div>
      ))}
    </div>
  );
}
