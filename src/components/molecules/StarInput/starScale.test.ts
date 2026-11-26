import { describe, expect, it } from 'vitest';
import { valueFromPosition } from './starScale';

describe('valueFromPosition', () => {
  it('teilt die Reihe in zehn halbe Sterne', () => {
    expect(valueFromPosition(1, 220)).toBe(1);
    expect(valueFromPosition(23, 220)).toBe(2);
    expect(valueFromPosition(197, 220)).toBe(9);
    expect(valueFromPosition(220, 220)).toBe(10);
  });

  it('bleibt beim Wischen über den Rand im Bereich', () => {
    expect(valueFromPosition(-40, 220)).toBe(1);
    expect(valueFromPosition(400, 220)).toBe(10);
    expect(valueFromPosition(10, 0)).toBe(1);
  });
});
