import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { productApi, ratingApi } from '../api/endpoints';
import type { Product, Rating } from '../api/types';
import { labelFor, useMeta } from '../features/meta/useMeta';
import { applyFilters, clearFilters, parseFilters, toParams, type JournalFilters, type JournalTab } from '../features/journal/journalQuery';
import { summarize } from '../features/journal/journalSummary';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { SegmentedChoice } from '../components/molecules/SegmentedChoice/SegmentedChoice';
import { JournalToolbar } from '../components/organisms/JournalFilters/JournalToolbar';
import { JournalOverview } from '../components/organisms/JournalOverview/JournalOverview';
import { JournalRatingCard } from '../components/organisms/JournalRatingCard/JournalRatingCard';
import { JournalSkeleton, JournalState } from '../components/organisms/JournalState/JournalState';
import { JournalTop3 } from '../components/organisms/JournalTop3/JournalTop3';
import { ProductCard } from '../components/organisms/ProductCard/ProductCard';
import styles from './JournalPage.module.css';

/** Journal „Dein Kompass“ (Screen 04): eigene Bewertungen mit Überblick und die Merkliste. */
export function JournalPage() {
  const navigate = useNavigate();
  const meta = useMeta();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  const mine = useAsyncResource(() => ratingApi.mine(), []);
  const favorites = useAsyncResource(() => productApi.list({ favorites: true, perPage: 100, sort: 'name' }), []);
  const [removed, setRemoved] = useState<number[]>([]);

  const update = useCallback(
    (patch: Partial<JournalFilters>) => setParams(toParams({ ...filters, ...patch }), { replace: true }),
    [filters, setParams],
  );

  const ratings = useMemo(() => mine.data?.items ?? [], [mine.data]);
  const summary = useMemo(() => summarize(ratings), [ratings]);
  const visible = useMemo(() => applyFilters(ratings, filters), [ratings, filters]);
  const saved = (favorites.data?.items ?? []).filter((p) => !removed.includes(p.id));

  const label = {
    effect: (k: string) => labelFor(meta?.effects, k),
    sideEffect: (k: string) => labelFor(meta?.sideEffects, k),
    method: (k: string) => labelFor(meta?.methods, k),
  };
  const edit = (r: Rating) => void navigate(`/sorten/${r.productId}`, { state: { rating: true } });
  const unfavorite = async (p: Product) => {
    setRemoved((ids) => [...ids, p.id]);
    try {
      await productApi.setFavorite(p.id, false);
    } catch {
      setRemoved((ids) => ids.filter((id) => id !== p.id));
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dein Kompass</h1>
      <p className={styles.lead}>Deine Bewertungen und deine Merkliste – nur für dich sichtbar.</p>

      {mine.loading && !mine.data ? <JournalSkeleton /> : mine.error ? (
        <JournalState kind="error" onAction={() => void mine.reload()} />
      ) : (
        <>
          {summary.count > 0 && <JournalOverview summary={summary} label={label} />}
          <JournalTop3 ratings={summary.top} />

          <div className={styles.tabs}>
            <SegmentedChoice<JournalTab> label="Ansicht" value={filters.tab} onChange={(tab) => tab && update({ tab })}
              options={[
                { value: 'bewertungen', label: `Bewertungen (${summary.count})`, icon: 'book' },
                { value: 'merkliste', label: `Merkliste (${favorites.data ? saved.length : '…'})`, icon: 'heart' },
              ]} />
          </div>

          {filters.tab === 'bewertungen' ? (
            <section aria-labelledby="journal-ratings">
              <h2 id="journal-ratings" className={styles.section}>Bewertungen</h2>
              {summary.count === 0 ? <JournalState kind="empty" /> : (
                <>
                  <JournalToolbar filters={filters} meta={meta} resultCount={visible.length} onChange={update} />
                  {visible.length === 0 ? (
                    <JournalState kind="noResults" onAction={() => update({ ...clearFilters(filters), q: '' })} />
                  ) : (
                    <ul className={styles.list}>
                      {visible.map((r) => <li key={r.id}><JournalRatingCard rating={r} label={label} onEdit={edit} /></li>)}
                    </ul>
                  )}
                </>
              )}
            </section>
          ) : (
            <section aria-labelledby="journal-favorites">
              <h2 id="journal-favorites" className={styles.section}>Merkliste</h2>
              {favorites.loading && !favorites.data ? <JournalSkeleton /> : favorites.error ? (
                <JournalState kind="error" onAction={() => void favorites.reload()} />
              ) : saved.length === 0 ? <JournalState kind="emptyFavorites" /> : (
                <ul className={styles.list}>
                  {saved.map((p) => (
                    <li key={p.id}>
                      <ProductCard product={p} effectLabel={label.effect} onToggleFavorite={(item) => void unfavorite(item)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
