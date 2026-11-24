import type { ProductSort } from '../../../api/endpoints';
import { SORT_OPTIONS, type FilterChip as Chip } from '../../../features/catalog/catalogQuery';
import { Button } from '../../atoms/Button/Button';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { Select } from '../../atoms/Input/Input';
import { FilterChip } from '../../molecules/FilterChip/FilterChip';
import type { CardView } from '../ProductCard/ProductCard';
import styles from './CatalogToolbar.module.css';

interface CatalogToolbarProps {
  total: number | null;
  sort: ProductSort;
  view: CardView;
  chips: Chip[];
  onSort: (sort: ProductSort) => void;
  onView: (view: CardView) => void;
  onRemoveChip: (chip: Chip) => void;
  onReset: () => void;
  /** Öffnet die Filter (nur unterhalb des Desktops sichtbar) */
  onOpenFilters: () => void;
}

const count = new Intl.NumberFormat('de-DE');

/** Leiste über der Sortenliste: Treffer, Sortierung, Ansicht, aktive Filter. */
export function CatalogToolbar(props: CatalogToolbarProps) {
  const { total, sort, view, chips, onSort, onView, onRemoveChip, onReset, onOpenFilters } = props;
  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        <Button variant="secondary" size="sm" icon="sliders" onClick={onOpenFilters} className={styles.filterButton}
          aria-haspopup="dialog">
          Filter{chips.length > 0 ? ` (${chips.length})` : ''}
        </Button>
        <p className={styles.count} aria-live="polite">
          {total === null ? 'Sorten werden geladen …' : `${count.format(total)} ${total === 1 ? 'Produkt' : 'Produkte'} gefunden`}
        </p>
        <label className={styles.sort}>
          <span className={styles.sortLabel}>Sortieren<span className={styles.wide}> nach</span>:</span>
          <Select value={sort} onChange={(e) => onSort(e.target.value as ProductSort)} className={styles.sortSelect}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </label>
        <div className={styles.views} role="group" aria-label="Ansicht">
          <IconButton icon="grid" label="Kachelansicht" aria-pressed={view === 'grid'}
            variant={view === 'grid' ? 'solid' : 'ghost'} onClick={() => onView('grid')} />
          <IconButton icon="list" label="Listenansicht" aria-pressed={view === 'list'}
            variant={view === 'list' ? 'solid' : 'ghost'} onClick={() => onView('list')} />
        </div>
      </div>
      {chips.length > 0 && (
        <div className={styles.chips}>
          {chips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} icon={chip.icon} onRemove={() => onRemoveChip(chip)} />
          ))}
          <button type="button" className={styles.reset} onClick={onReset}>Alle zurücksetzen</button>
        </div>
      )}
    </div>
  );
}
