import { useCallback, useEffect, useRef, useState } from 'react';
import { productApi } from '../../api/endpoints';
import type { Product } from '../../api/types';
import { errorMessage } from '../../utils/errorMessage';
import type { CatalogFilters } from './catalogQuery';

const PER_PAGE = 24;

interface CatalogState {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

const INITIAL: CatalogState = { items: [], total: 0, page: 0, pageCount: 0, loading: true, loadingMore: false, error: null };

/**
 * Lädt die Sortenliste seitenweise („Weitere laden“). Bei neuen Filtern geht es
 * wieder bei Seite 1 los; veraltete Antworten werden verworfen.
 */
export function useCatalog(filters: CatalogFilters) {
  const [state, setState] = useState<CatalogState>(INITIAL);
  const requestId = useRef(0);
  const key = JSON.stringify(filters);

  const load = useCallback(
    async (page: number) => {
      const id = ++requestId.current;
      setState((s) => ({ ...s, loading: page === 1, loadingMore: page > 1, error: null }));
      try {
        const result = await productApi.list({ ...(JSON.parse(key) as CatalogFilters), page, perPage: PER_PAGE });
        if (id !== requestId.current) return;
        setState((s) => ({
          items: page === 1 ? result.items : [...s.items, ...result.items],
          total: result.pagination.total,
          page: result.pagination.page,
          pageCount: result.pagination.pageCount,
          loading: false,
          loadingMore: false,
          error: null,
        }));
      } catch (e) {
        if (id === requestId.current) setState((s) => ({ ...s, loading: false, loadingMore: false, error: errorMessage(e) }));
      }
    },
    [key],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  /** Merkliste umschalten: sofort anzeigen, bei Fehler zurücknehmen. */
  const toggleFavorite = useCallback(async (product: Product) => {
    const next = !product.favorite;
    const apply = (favorite: boolean) =>
      setState((s) => ({ ...s, items: s.items.map((p) => (p.id === product.id ? { ...p, favorite } : p)) }));
    apply(next);
    try {
      await productApi.setFavorite(product.id, next);
    } catch (e) {
      apply(!next);
      setState((s) => ({ ...s, error: errorMessage(e) }));
    }
  }, []);

  return {
    ...state,
    hasMore: state.page < state.pageCount,
    loadMore: () => load(state.page + 1),
    retry: () => load(1),
    toggleFavorite,
  };
}
