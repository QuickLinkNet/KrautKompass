import { useId } from 'react';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import styles from './SegmentedChoice.module.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

interface SegmentedChoiceProps<T extends string> {
  label: string;
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (next: T | null) => void;
  /** auto = Breite nach Textlänge (zwei unterschiedlich lange Segmente) */
  columns?: 2 | 3 | 'auto' | 'fit';
  /** Erneutes Tippen hebt die Auswahl auf (freiwillige Angaben) */
  clearable?: boolean;
}

/** Einfachauswahl als Segmente (echte Radios). Ausgewählt = Häkchen und Fläche. */
export function SegmentedChoice<T extends string>({ label, options, value, onChange, columns = 2, clearable = false }: SegmentedChoiceProps<T>) {
  const name = useId();
  return (
    <div className={`${styles.group} ${columns === 3 ? styles.three : columns === 'auto' ? styles.auto : columns === 'fit' ? styles.fit : ''}`} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <label key={option.value} className={`${styles.segment} ${active ? styles.active : ''}`}>
            <input
              type="radio"
              className={styles.input}
              name={name}
              checked={active}
              onChange={() => onChange(option.value)}
              onClick={() => clearable && active && onChange(null)}
            />
            {active ? <Icon name="tick" size={18} /> : option.icon && <Icon name={option.icon} size={18} />}
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
