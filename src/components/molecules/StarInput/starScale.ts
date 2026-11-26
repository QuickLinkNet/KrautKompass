export const STAR_MAX = 10;

/**
 * Position auf der Sternreihe → Wert 1–10 (halbe Sterne).
 * @param x Abstand vom linken Rand, darf außerhalb liegen (Wischen über den Rand)
 */
export function valueFromPosition(x: number, width: number): number {
  if (width <= 0) return 1;
  return Math.min(STAR_MAX, Math.max(1, Math.ceil((x / width) * STAR_MAX)));
}
