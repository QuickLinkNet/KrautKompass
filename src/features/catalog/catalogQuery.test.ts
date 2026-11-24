import { describe, expect, it } from 'vitest';
import { filterChips, parseFilters, patchFilters, toSearchParams } from './catalogQuery';

describe('catalogQuery', () => {
  it('liest Filter aus der URL und verwirft Unsinn', () => {
    const filters = parseFilters(
      new URLSearchParams('q=%20Lemon%20&thcMin=15&thcMax=abc&effects=kreativ,fokussiert&available=1&sort=hack&favorites=0'),
    );
    expect(filters).toEqual({ q: 'Lemon', thcMin: 15, effects: ['kreativ', 'fokussiert'], available: true });
  });

  it('schreibt nur gesetzte Werte zurück, Standardsortierung bleibt weg', () => {
    const params = toSearchParams({ producer: 'CanMedics', cbdMax: 0, sort: 'popular', effects: [] });
    expect(params.toString()).toBe('producer=CanMedics&cbdMax=0');
    expect(parseFilters(toSearchParams({ sort: 'thc_asc', minRating: 8 }))).toEqual({ sort: 'thc_asc', minRating: 8 });
  });

  it('patchFilters entfernt geleerte Felder', () => {
    expect(patchFilters({ terpene: 'Myrcen', effects: ['kreativ'] }, { terpene: '', effects: [] })).toEqual({});
  });

  it('baut Chips mit Bereichen, Wirkungen und Merkliste', () => {
    const chips = filterChips(
      { thcMin: 15, effects: ['kreativ'], available: true, favorites: true, q: 'ignoriert' },
      { thcMax: 30, cbdMax: 20 },
      (key) => key.toUpperCase(),
    );
    expect(chips.map((c) => c.label)).toEqual(['THC: 15 – 30 %', 'KREATIV', 'Verfügbar', 'Merkliste']);
    expect(chips[1]?.patch).toEqual({ effects: [] });
  });
});
