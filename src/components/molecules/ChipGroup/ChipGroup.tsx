import type { Option } from '../../../api/types';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './ChipGroup.module.css';

interface ChipGroupProps {
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  label: string;
  /** warning = dezent rötlich (Nebenwirkungen) */
  tone?: 'default' | 'warning';
}

/** Mehrfachauswahl als Chips. Ausgewählt = Häkchen und Fläche, nie nur Farbe. */
export function ChipGroup({ options, value, onChange, label, tone = 'default' }: ChipGroupProps) {
  const toggle = (key: string) =>
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);

  return (
    <div className={styles.group} role="group" aria-label={label}>
      {options.map((option) => {
        const active = value.includes(option.key);
        return (
          <button
            key={option.key}
            type="button"
            className={[styles.chip, active && styles.active, tone === 'warning' && styles.warning].filter(Boolean).join(' ')}
            aria-pressed={active}
            onClick={() => toggle(option.key)}
          >
            {active && <Icon name="tick" size={16} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
