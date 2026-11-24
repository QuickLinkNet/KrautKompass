import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { productApi } from '../api/endpoints';
import { Button } from '../components/atoms/Button/Button';
import { Icon } from '../components/atoms/Icon/Icon';
import { Spinner } from '../components/atoms/Spinner/Spinner';
import { Alert } from '../components/molecules/Alert/Alert';
import { SearchField } from '../components/molecules/SearchField/SearchField';
import { Sheet } from '../components/molecules/Sheet/Sheet';
import { CatalogFilters } from '../components/organisms/CatalogFilters/CatalogFilters';
import { CatalogHero } from '../components/organisms/CatalogHero/CatalogHero';
import { CatalogToolbar } from '../components/organisms/CatalogToolbar/CatalogToolbar';
import { ProductCard, type CardView } from '../components/organisms/ProductCard/ProductCard';
import {
  DEFAULT_SORT, filterChips, parseFilters, patchFilters, toSearchParams, type CatalogFilters as Filters,
} from '../features/catalog/catalogQuery';
import { useCatalog } from '../features/catalog/useCatalog';
import { labelFor, useMeta } from '../features/meta/useMeta';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { useMediaQuery } from '../hooks/useMediaQuery';
import styles from './ProductsPage.module.css';

const VIEW_KEY = 'kk.catalogView';

function storedView(): CardView {
  try {
    return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'list';
  } catch {
    return 'list';
  }
}

/** Startseite nach dem Login: Sortenkatalog mit Suche und Filtern (Screendesign Sortenkatalog). */
export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const filters = parseFilters(params);
  const meta = useMeta();
  const facets = useAsyncResource(() => productApi.facets(), []);
  const catalog = useCatalog(filters);
  const [chosenView, setView] = useState<CardView>(storedView);
  // Auf dem Handy gibt es keinen Umschalter (Screendesign) – dort immer die Liste
  const narrow = useMediaQuery('(max-width: 767.98px)');
  const view: CardView = narrow ? 'list' : chosenView;
  const [sheetOpen, setSheetOpen] = useState(false);

  const effectLabel = (key: string) => labelFor(meta?.effects, key);
  const limits = { thcMax: facets.data?.thcMax || 35, cbdMax: facets.data?.cbdMax || 25 };
  const chips = filterChips(filters, limits, effectLabel);
  const update = (patch: Partial<Filters>) => setParams(toSearchParams(patchFilters(filters, patch)), { replace: true });
  const reset = () => setParams(toSearchParams({ sort: filters.sort, q: filters.q }), { replace: true });
  const changeView = (next: CardView) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Privater Modus: Ansicht gilt dann nur bis zum Neuladen
    }
  };

  const filterPanel = (withSearch: boolean) => (
    <CatalogFilters filters={filters} facets={facets.data} effects={meta?.effects ?? []} onChange={update} withSearch={withSearch} />
  );

  return (
    <>
      <CatalogHero />
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-labelledby="filter-title">
          <div className={styles.sidebarHead}>
            <h2 id="filter-title" className={styles.sidebarTitle}><Icon name="sliders" /> Filter</h2>
            <button type="button" className={styles.resetLink} onClick={reset} disabled={chips.length === 0}>
              Alle zurücksetzen
            </button>
          </div>
          {filterPanel(true)}
        </aside>

        <section className={styles.results} aria-label="Sorten">
          <div className={styles.mobileSearch}>
            <SearchField id="catalog-search" value={filters.q ?? ''} onCommit={(q) => update({ q })} />
          </div>
          <CatalogToolbar
            total={catalog.loading && catalog.items.length === 0 ? null : catalog.total}
            sort={filters.sort ?? DEFAULT_SORT}
            view={view}
            chips={chips}
            onSort={(sort) => update({ sort })}
            onView={changeView}
            onRemoveChip={(chip) => update(chip.patch)}
            onReset={reset}
            onOpenFilters={() => setSheetOpen(true)}
          />

          {catalog.error && (
            <Alert>
              {catalog.error} <button type="button" className={styles.inlineButton} onClick={catalog.retry}>Erneut versuchen</button>
            </Alert>
          )}

          {catalog.loading && catalog.items.length === 0 ? (
            <Spinner label="Sorten werden geladen …" />
          ) : catalog.items.length === 0 && !catalog.error ? (
            <div className={styles.empty}>
              <Icon name="search" size={24} />
              <p>{chips.length > 0 || filters.q ? 'Keine Sorte passt zu deiner Suche.' : 'Noch keine Sorten im Katalog. Ein Admin startet den Abgleich unter „Verwaltung“.'}</p>
              {(chips.length > 0 || filters.q) && (
                <Button variant="secondary" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                  Suche und Filter zurücksetzen
                </Button>
              )}
            </div>
          ) : (
            <ul className={`${styles.list} ${styles[view]}`} aria-busy={catalog.loading || undefined}>
              {catalog.items.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} view={view} effectLabel={effectLabel} onToggleFavorite={catalog.toggleFavorite} />
                </li>
              ))}
            </ul>
          )}

          {catalog.hasMore && (
            <div className={styles.more}>
              <Button variant="secondary" loading={catalog.loadingMore} onClick={() => void catalog.loadMore()}>
                Weitere Sorten laden
              </Button>
            </div>
          )}
        </section>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter"
        footer={(
          <div className={styles.sheetFooter}>
            <Button variant="ghost" onClick={reset} disabled={chips.length === 0}>Zurücksetzen</Button>
            <Button onClick={() => setSheetOpen(false)}>
              {catalog.total} {catalog.total === 1 ? 'Sorte' : 'Sorten'} anzeigen
            </Button>
          </div>
        )}
      >
        {filterPanel(false)}
      </Sheet>
    </>
  );
}
