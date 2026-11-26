import { describe, expect, it } from 'vitest';
import type { Rating } from '../../api/types';
import { dayLabel, groupByDay, isNew, wasUpdated } from './feedGroups';

const now = new Date(2026, 10, 26, 12, 0);
const at = (d: number, h = 10, m = 0) => new Date(2026, 10, d, h, m).toISOString();
const entry = (id: number, updatedAt: string, createdAt = updatedAt) => ({ id, updatedAt, createdAt }) as Rating;

describe('Neuigkeiten', () => {
  it('benennt Tage wie im Entwurf', () => {
    expect(dayLabel(new Date(2026, 10, 26, 9), now)).toBe('Heute');
    expect(dayLabel(new Date(2026, 10, 25, 23), now)).toBe('Gestern');
    expect(dayLabel(new Date(2026, 10, 23, 14), now)).toBe('Montag, 23.11.');
  });

  it('gruppiert die Einträge nach Tag, Reihenfolge bleibt', () => {
    const days = groupByDay([entry(1, at(26, 10)), entry(2, at(26, 9)), entry(3, at(25)), entry(4, at(23))], now);
    expect(days.map((d) => [d.label, d.items.map((i) => i.id)])).toEqual([
      ['Heute', [1, 2]], ['Gestern', [3]], ['Montag, 23.11.', [4]],
    ]);
  });

  it('erkennt geänderte Bewertungen und neue Sorten', () => {
    expect(wasUpdated(entry(1, at(26, 10, 5), at(26, 10)))).toBe(true);
    expect(wasUpdated(entry(1, at(26, 10)))).toBe(false);
    expect(isNew(at(20), now)).toBe(true);
    expect(isNew(new Date(2026, 8, 1).toISOString(), now)).toBe(false);
    expect(isNew(null, now)).toBe(false);
  });
});
