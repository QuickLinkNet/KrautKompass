import type { ProductQuery } from '../../../api/endpoints';
import type { Facets } from '../../../api/types';
import { Input, Select } from '../../atoms/Input/Input';
import styles from './ProductFilters.module.css';

interface Props {
  query: ProductQuery;
  facets: Facets | null;
  onChange: (next: ProductQuery) => void;
}

/** Suche, Filter und Sortierung der Sortenliste. */
export function ProductFilters({ query, facets, onChange }: Props) {
  const update = (patch: Partial<ProductQuery>) => onChange({ ...query, ...patch, page: 1 });

  return (
    <div className={styles.filters}>
      <Input
        type="search"
        placeholder="Suche nach Sorte, Strain oder Hersteller"
        value={query.q ?? ''}
        onChange={(e) => update({ q: e.target.value })}
        className={styles.search}
        aria-label="Suche"
      />
      <Select value={query.producer ?? ''} onChange={(e) => update({ producer: e.target.value })} aria-label="Hersteller">
        <option value="">Alle Hersteller</option>
        {facets?.producers.map((p) => <option key={p}>{p}</option>)}
      </Select>
      <Select value={query.genetic ?? ''} onChange={(e) => update({ genetic: e.target.value })} aria-label="Genetik">
        <option value="">Alle Genetiken</option>
        {facets?.genetics.map((g) => <option key={g}>{g}</option>)}
      </Select>
      <Select value={query.terpene ?? ''} onChange={(e) => update({ terpene: e.target.value })} aria-label="Terpen">
        <option value="">Alle Terpene</option>
        {facets?.terpenes.map((t) => <option key={t}>{t}</option>)}
      </Select>
      <Select
        value={query.sort ?? 'name'}
        onChange={(e) => update({ sort: e.target.value as ProductQuery['sort'] })}
        aria-label="Sortierung"
      >
        <option value="name">Name A–Z</option>
        <option value="rating">Beste Bewertung</option>
        <option value="thc">Höchster THC</option>
        <option value="newest">Neueste</option>
      </Select>
      <label className={styles.toggle}>
        <input type="checkbox" checked={!!query.available} onChange={(e) => update({ available: e.target.checked })} />
        nur lieferbare
      </label>
    </div>
  );
}
