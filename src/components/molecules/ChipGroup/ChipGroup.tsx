import type { Option } from '../../../api/types';
import styles from './ChipGroup.module.css';

/** Mehrfachauswahl als Chips (Wirkungen, Nebenwirkungen). */
export function ChipGroup({ options, value, onChange, label }: {
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  label: string;
}) {
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
            className={`${styles.chip} ${active ? styles.active : ''}`}
            aria-pressed={active}
            onClick={() => toggle(option.key)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
