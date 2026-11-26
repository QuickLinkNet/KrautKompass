import { useRef, useState, type PointerEvent } from 'react';
import { formatStarValue } from '../../../utils/format';
import { Icon } from '../../atoms/Icon/Icon';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { STAR_MAX, valueFromPosition } from './starScale';
import styles from './StarInput.module.css';

const STARS = [0, 1, 2, 3, 4];

interface StarInputProps {
  label: string;
  /** Skala 1–10 (= 0,5–5 Sterne), null = keine Angabe */
  value: number | null;
  onChange: (next: number | null) => void;
  size?: 'sm' | 'lg';
  /** Zeigt „zurücksetzen“, sobald ein Wert gesetzt ist */
  clearable?: boolean;
  describedBy?: string;
  invalid?: boolean;
}

/**
 * Halbe Sterne durch Tippen oder Wischen. Darunter liegt ein echtes <input type="range">,
 * damit Tastatur und VoiceOver wie gewohnt funktionieren. Wer beim Scrollen auf den Sternen
 * landet, verändert nichts: Erst beim Loslassen wird übernommen, ein Scroll bricht ab.
 */
export function StarInput({ label, value, onChange, size = 'sm', clearable = false, describedBy, invalid }: StarInputProps) {
  const area = useRef<HTMLSpanElement>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const shown = preview ?? value;

  const at = (e: PointerEvent) => {
    const box = area.current?.getBoundingClientRect();
    return box ? valueFromPosition(e.clientX - box.left, box.width) : 1;
  };
  const start = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPreview(at(e));
  };
  const commit = (e: PointerEvent) => {
    if (preview === null) return;
    onChange(at(e));
    setPreview(null);
  };

  return (
    <div className={`${styles.wrap} ${styles[size]}`}>
      <span
        ref={area}
        className={`${styles.stars} ${invalid ? styles.invalid : ''}`}
        onPointerDown={start}
        onPointerMove={(e) => preview !== null && setPreview(at(e))}
        onPointerUp={commit}
        onPointerCancel={() => setPreview(null)}
      >
        <input
          type="range"
          className={styles.range}
          min={0}
          max={STAR_MAX}
          step={1}
          value={value ?? 0}
          aria-label={label}
          aria-valuetext={value === null ? 'keine Angabe' : `${formatStarValue(value)} von 5 Sternen`}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(Number(e.target.value) || null)}
        />
        <span className={styles.row} aria-hidden="true">
          {STARS.map((i) => <Icon key={i} name="star" size={24} className={styles.star} />)}
        </span>
        <span className={styles.fill} style={{ width: `${(shown ?? 0) * 10}%` }} aria-hidden="true">
          <span className={styles.row}>
            {STARS.map((i) => <Icon key={i} name="star" size={24} filled className={styles.star} />)}
          </span>
        </span>
      </span>
      <span className={styles.value} aria-hidden="true">{shown === null ? '–' : formatStarValue(shown)}</span>
      {clearable && (
        <IconButton
          icon="reset"
          label={`${label} zurücksetzen`}
          className={value === null ? styles.hidden : undefined}
          disabled={value === null}
          onClick={() => onChange(null)}
        />
      )}
    </div>
  );
}
