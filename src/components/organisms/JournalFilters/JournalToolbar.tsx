import { useState } from 'react';
import type { Meta } from '../../../api/types';
import { activeFilterCount, clearFilters, type JournalFilters, type JournalSort } from '../../../features/journal/journalQuery';
import { Button } from '../../atoms/Button/Button';
import { Select } from '../../atoms/Input/Input';
import { FilterMenu } from '../../molecules/FilterMenu/FilterMenu';
import { SearchField } from '../../molecules/SearchField/SearchField';
import { Sheet } from '../../molecules/Sheet/Sheet';
import { FilterGroup, GROUP_TITLES, groupSummary, type FilterGroupKey } from './filterGroups';
import styles from './JournalToolbar.module.css';

const GROUPS: FilterGroupKey[] = ['stars', 'effects', 'methods', 'again', 'visibility'];

interface JournalToolbarProps {
  filters: JournalFilters;
  meta: Meta | null;
  resultCount: number;
  onChange: (patch: Partial<JournalFilters>) => void;
}

/** Suche, Sortierung und Filter. Handy: Filter im Sheet, ab Tablet als Menüs in einer Leiste. */
export function JournalToolbar({ filters, meta, resultCount, onChange }: JournalToolbarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = activeFilterCount(filters);
  const reset = () => onChange(clearFilters(filters));

  return (
    <div className={styles.toolbar}>
      <div className={styles.search}>
        <SearchField id="journal-search" value={filters.q} placeholder="Sorte suchen …" onCommit={(q) => onChange({ q })} />
      </div>
      <Button variant="secondary" size="sm" icon="sliders" className={styles.filterButton} onClick={() => setSheetOpen(true)}>
        Filter{active ? ` (${active})` : ''}
      </Button>
      <label className={styles.sort}>
        <span className={styles.srOnly}>Sortieren</span>
        <Select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as JournalSort })}>
          <option value="neu">Neueste zuerst</option>
          <option value="beste">Beste Bewertung</option>
          <option value="alt">Älteste zuerst</option>
        </Select>
      </label>

      <div className={styles.menus}>
        {GROUPS.map((g) => (
          <FilterMenu key={g} label={GROUP_TITLES[g]} summary={groupSummary(g, filters, meta)}>
            <FilterGroup group={g} filters={filters} meta={meta} onChange={onChange} />
          </FilterMenu>
        ))}
        {active > 0 && <button type="button" className={styles.reset} onClick={reset}>Filter zurücksetzen</button>}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filter"
        footer={(
          <div className={styles.sheetFooter}>
            <Button variant="secondary" onClick={reset} disabled={active === 0}>Zurücksetzen</Button>
            <Button onClick={() => setSheetOpen(false)} iconEnd="arrowRight">
              Anzeigen ({resultCount})
            </Button>
          </div>
        )}>
        {GROUPS.map((g) => (
          <fieldset key={g} className={styles.group}>
            <legend className={styles.legend}>{GROUP_TITLES[g]}</legend>
            <FilterGroup group={g} filters={filters} meta={meta} onChange={onChange} />
          </fieldset>
        ))}
      </Sheet>
    </div>
  );
}
