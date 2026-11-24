import { useId } from 'react';
import { useDraft } from '../../../hooks/useDraft';
import styles from './RangeField.module.css';

interface RangeFieldProps {
  label: string;
  /** Obergrenze der Skala (z. B. höchster THC-Wert im Katalog) */
  max: number;
  min?: number;
  step?: number;
  unit?: string;
  value: { min?: number; max?: number };
  /** undefined = Grenze nicht eingeschränkt */
  onChange: (value: { min?: number; max?: number }) => void;
}

/** Bereichsfilter: zwei Schieberegler auf einer Spur plus Zahlenfelder (Eingabe per Tastatur). */
export function RangeField({ label, max, min = 0, step = 0.5, unit = '%', value, onChange }: RangeFieldProps) {
  const id = useId();
  const [draft, setDraft] = useDraft<[number, number]>(
    [value.min ?? min, value.max ?? max],
    ([lo, hi]) => onChange({ min: lo > min ? lo : undefined, max: hi < max ? hi : undefined }),
  );
  const [lo, hi] = draft;
  const span = Math.max(max - min, step);
  const clamp = (n: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
  const setLo = (n: number) => setDraft([Math.min(clamp(n), hi), hi]);
  const setHi = (n: number) => setDraft([lo, Math.max(clamp(n), lo)]);

  return (
    <fieldset className={styles.field}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.slider}>
        <span className={styles.track} />
        <span
          className={styles.fill}
          style={{ left: `${((lo - min) / span) * 100}%`, right: `${100 - ((hi - min) / span) * 100}%` }}
        />
        <input type="range" min={min} max={max} step={step} value={lo} onChange={(e) => setLo(e.target.valueAsNumber)}
          aria-label={`${label} von`} aria-valuetext={`${lo} ${unit}`} className={styles.thumb} />
        <input type="range" min={min} max={max} step={step} value={hi} onChange={(e) => setHi(e.target.valueAsNumber)}
          aria-label={`${label} bis`} aria-valuetext={`${hi} ${unit}`} className={styles.thumb} />
      </div>
      <div className={styles.inputs}>
        <label className={styles.box} htmlFor={`${id}-lo`}>
          <span className={styles.srOnly}>{label} von</span>
          <input id={`${id}-lo`} type="number" inputMode="decimal" min={min} max={max} step={step} value={lo}
            onChange={(e) => setLo(e.target.valueAsNumber)} />
          <span aria-hidden="true">{unit}</span>
        </label>
        <span className={styles.dash} aria-hidden="true">–</span>
        <label className={styles.box} htmlFor={`${id}-hi`}>
          <span className={styles.srOnly}>{label} bis</span>
          <input id={`${id}-hi`} type="number" inputMode="decimal" min={min} max={max} step={step} value={hi}
            onChange={(e) => setHi(e.target.valueAsNumber)} />
          <span aria-hidden="true">{unit}</span>
        </label>
      </div>
    </fieldset>
  );
}
