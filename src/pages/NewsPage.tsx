import { useSearchParams } from 'react-router';
import { Button, ButtonLink } from '../components/atoms/Button/Button';
import { StateMessage } from '../components/molecules/StateMessage/StateMessage';
import { FeedEntry } from '../components/organisms/FeedEntry/FeedEntry';
import { FeedFilters } from '../components/organisms/FeedFilters/FeedFilters';
import { JournalSkeleton } from '../components/organisms/JournalState/JournalState';
import { NewInCatalog } from '../components/organisms/NewInCatalog/NewInCatalog';
import { PageHero } from '../components/organisms/PageHero/PageHero';
import { groupByDay } from '../features/feed/feedGroups';
import { useFeed } from '../features/feed/useFeed';
import { labelFor, useMeta } from '../features/meta/useMeta';
import { useSession } from '../features/session/sessionContext';
import styles from './NewsPage.module.css';

/** Neuigkeiten (Screen 05): neu im Katalog und geteilte Bewertungen der Runde als Chronik. */
export function NewsPage() {
  const meta = useMeta();
  const me = useSession().user;
  const [params, setParams] = useSearchParams();
  const author = Number(params.get('person')) || null;
  const favorites = params.get('merkliste') === '1';
  const feed = useFeed({ author, favorites });

  // Filter stehen in der URL (teilbar, Zurück-Taste)
  const setFilter = (next: { author?: number | null; favorites?: boolean }) => {
    const p = new URLSearchParams();
    const a = next.author === undefined ? author : next.author;
    const f = next.favorites === undefined ? favorites : next.favorites;
    if (a) p.set('person', String(a));
    if (f) p.set('merkliste', '1');
    setParams(p, { replace: true });
  };

  const label = {
    effect: (k: string) => labelFor(meta?.effects, k),
    sideEffect: (k: string) => labelFor(meta?.sideEffects, k),
    method: (k: string) => labelFor(meta?.methods, k),
  };
  const unfiltered = author === null && !favorites;
  const personName = feed.authors.find((a) => a.id === author)?.name ?? 'Diese Person';
  let emptyTitle = 'Hier ist es noch ruhig.';
  if (favorites) emptyTitle = 'Zu deinen gemerkten Sorten hat noch niemand etwas geteilt.';
  else if (author !== null) emptyTitle = author === me?.id ? 'Du hast noch nichts geteilt.' : `${personName} hat noch nichts geteilt.`;

  return (
    <>
      <PageHero id="news-title" title="Neuigkeiten" lead="Was die Runde zuletzt geteilt hat." leadOnPhone />
      <div className={styles.page}>
        <NewInCatalog />

        <section aria-labelledby="news-round">
          <h2 id="news-round" className={styles.title}>Aus der Runde</h2>
          <FeedFilters authors={feed.authors} meId={me?.id ?? null} author={author} favorites={favorites}
            onAuthor={(a) => setFilter({ author: a })} onFavorites={(f) => setFilter({ favorites: f })} />

          {feed.loading ? <JournalSkeleton /> : feed.error ? (
            <StateMessage icon="alert" tone="danger" title="Neuigkeiten konnten nicht geladen werden.">
              <Button iconEnd="refresh" onClick={feed.reload}>Erneut versuchen</Button>
            </StateMessage>
          ) : feed.items.length === 0 ? (
            <StateMessage icon={unfiltered ? 'leaf' : 'users'} title={emptyTitle}
              text={unfiltered ? 'Teile eine Bewertung mit der Runde – dann erscheint sie hier.' : undefined}>
              {unfiltered && <ButtonLink to="/" variant="primary" iconEnd="arrowRight">Zum Sortenkatalog</ButtonLink>}
            </StateMessage>
          ) : (
            <>
              {groupByDay(feed.items).map((day) => (
                <section key={day.key} className={styles.day} aria-label={day.label}>
                  <h3 className={styles.dayLabel}>{day.label}</h3>
                  <ul className={styles.list}>
                    {day.items.map((r) => <li key={r.id}><FeedEntry rating={r} label={label} /></li>)}
                  </ul>
                </section>
              ))}
              {feed.hasMore && (
                <div className={styles.more}>
                  <Button variant="secondary" iconEnd="chevronDown" loading={feed.loadingMore} onClick={feed.loadMore}>
                    Ältere laden
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
