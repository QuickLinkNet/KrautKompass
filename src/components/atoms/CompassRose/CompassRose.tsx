import styles from './CompassRose.module.css';

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
// Nur Nord: hält die Rose ruhig und kollidiert nicht mit Text am Panelrand.
const CARDINALS = [{ label: 'N', angle: 0 }];

function polar(angle: number, radius: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [200 + radius * Math.cos(rad), 200 + radius * Math.sin(rad)];
}

/** Dekorative Kompassrose als Linienzeichnung (Markenmotiv, siehe docs/DESIGN.md). */
export function CompassRose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={[styles.rose, className].filter(Boolean).join(' ')} aria-hidden="true">
      <circle cx="200" cy="200" r="192" className={styles.ring} />
      <circle cx="200" cy="200" r="150" className={styles.ringFaint} />
      <circle cx="200" cy="200" r="96" className={styles.ringFaint} />
      {TICKS.map((angle) => {
        const long = angle % 30 === 0;
        const [x1, y1] = polar(angle, long ? 168 : 178);
        const [x2, y2] = polar(angle, 188);
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} className={long ? styles.tickLong : styles.tick} />;
      })}
      {CARDINALS.map(({ label, angle }) => {
        const [x, y] = polar(angle, 130);
        return (
          <text key={label} x={x} y={y} className={styles.cardinal} textAnchor="middle" dominantBaseline="central">
            {label}
          </text>
        );
      })}
      <g className={styles.needle}>
        <path d="M200 70 L218 200 L200 214 L182 200 Z" className={styles.needleNorth} />
        <path d="M200 330 L218 200 L200 186 L182 200 Z" className={styles.needleSouth} />
        <circle cx="200" cy="200" r="7" className={styles.pivot} />
      </g>
    </svg>
  );
}
