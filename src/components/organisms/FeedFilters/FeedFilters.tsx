import type { FeedResponse } from '../../../api/endpoints';
import { Icon } from '../../atoms/Icon/Icon';
import { ChoiceChips } from '../../molecules/ChoiceChips/ChoiceChips';
import styles from './FeedFilters.module.css';

interface FeedFiltersProps {
  authors: FeedResponse['authors'];
  meId: number | null;
  author: number | null;
  favorites: boolean;
  onAuthor: (author: number | null) => void;
  onFavorites: (favorites: boolean) => void;
}

const ALL = 'alle';

/** Personen-Chips (Alle · Mitglieder · Du) und der Schalter „Meine Merkliste“. */
export function FeedFilters({ authors, meId, author, favorites, onAuthor, onFavorites }: FeedFiltersProps) {
  const others = authors.filter((a) => a.id !== meId).map((a) => ({ key: String(a.id), label: a.name }));
  const options = [{ key: ALL, label: 'Alle' }, ...others, ...(meId ? [{ key: String(meId), label: 'Du' }] : [])];

  return (
    <div className={styles.filters}>
      <ChoiceChips label="Person" options={options} value={author === null ? ALL : String(author)}
        onChange={(key) => onAuthor(key === ALL ? null : Number(key))} />
      <button type="button" className={`${styles.favorite} ${favorites ? styles.active : ''}`} aria-pressed={favorites}
        onClick={() => onFavorites(!favorites)}>
        <Icon name="heart" size={16} filled={favorites} />
        Meine Merkliste
      </button>
    </div>
  );
}
