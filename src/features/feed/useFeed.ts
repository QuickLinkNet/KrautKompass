import { useCallback, useEffect, useRef, useState } from 'react';
import { ratingApi, type FeedResponse } from '../../api/endpoints';
import type { Rating } from '../../api/types';
import { errorMessage } from '../../utils/errorMessage';

const PAGE = 20;

export interface FeedFilter {
  /** Mitglied (User-ID) oder null = alle */
  author: number | null;
  /** nur Sorten auf der eigenen Merkliste */
  favorites: boolean;
}

/** Geteilte Bewertungen seitenweise laden; ein Filterwechsel beginnt von vorn. */
export function useFeed(filter: FeedFilter) {
  const [items, setItems] = useState<Rating[]>([]);
  const [authors, setAuthors] = useState<FeedResponse['authors']>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const load = useCallback(async (offset: number) => {
    const id = ++request.current;
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await ratingApi.feed({ limit: PAGE, offset, author: filter.author, favorites: filter.favorites });
      if (id !== request.current) return;
      setItems((prev) => (offset === 0 ? res.items : [...prev, ...res.items]));
      setAuthors(res.authors);
      setHasMore(res.hasMore);
      setError(null);
    } catch (e) {
      if (id === request.current) setError(errorMessage(e));
    } finally {
      if (id === request.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [filter.author, filter.favorites]);

  useEffect(() => {
    void load(0);
  }, [load]);

  return {
    items, authors, hasMore, loading, loadingMore, error,
    loadMore: () => void load(items.length),
    reload: () => void load(0),
  };
}
