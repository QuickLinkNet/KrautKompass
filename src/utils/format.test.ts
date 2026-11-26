import { describe, expect, it } from 'vitest';
import { formatDate, formatPercent, formatStars, toStars, formatPrice, formatStarValue, initials } from './format';

describe('format', () => {
  it('formatiert Prozent deutsch', () => {
    expect(formatPercent(27)).toBe('27,0 %');
    expect(formatPercent(null)).toBe('–');
  });

  it('rechnet die 1–10-Skala in halbe Sterne um', () => {
    expect(toStars(9)).toBe(4.5);
    expect(toStars(8.6)).toBe(4.5);
    expect(formatStars(10)).toBe('5 / 5');
    expect(formatStars(null)).toBe('noch keine Bewertung');
  });

  it('formatiert Datum und fängt Unsinn ab', () => {
    expect(formatDate('2026-11-20')).toBe('20.11.2026');
    expect(formatDate('kaputt')).toBe('–');
  });
});

describe('Sortenseite', () => {
  it('bildet Initialen aus Vor- und Nachname', () => {
    expect(initials('Anna Sommer')).toBe('AS');
    expect(initials('  Jessica  ')).toBe('J');
    expect(initials('Max von der Linde')).toBe('ML');
    expect(initials(null)).toBe('?');
  });

  it('formatiert Sterne und Preis', () => {
    expect(formatStarValue(8.5)).toBe('4,3');
    expect(formatStarValue(10)).toBe('5,0');
    expect(formatPrice(3.5)?.replace(/\s/, ' ')).toBe('3,50 €');
    expect(formatPrice(null)).toBeNull();
  });
});
