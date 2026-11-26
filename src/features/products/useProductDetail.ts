import { useCallback, useState } from 'react';
import { productApi } from '../../api/endpoints';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { errorMessage } from '../../utils/errorMessage';

/** Sorte mit Bewertungen laden; Merkliste sofort anzeigen und bei Fehler zurücknehmen. */
export function useProductDetail(id: number) {
  const { data, loading, error, reload } = useAsyncResource(() => productApi.show(id), [id]);
  const [favorite, setFavorite] = useState<{ id: number; value: boolean } | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const current = data?.product.id === id ? data : null;
  const isFavorite = favorite?.id === id ? favorite.value : (current?.product.favorite ?? false);

  const toggleFavorite = useCallback(async () => {
    setFavoriteError(null);
    setFavorite({ id, value: !isFavorite });
    try {
      await productApi.setFavorite(id, !isFavorite);
    } catch (e) {
      setFavorite({ id, value: isFavorite });
      setFavoriteError(errorMessage(e));
    }
  }, [id, isFavorite]);

  return { data: current, loading, error, reload, isFavorite, favoriteError, toggleFavorite };
}
