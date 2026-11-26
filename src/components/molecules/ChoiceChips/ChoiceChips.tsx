import type { Option } from '../../../api/types';
import { Icon } from '../../atoms/Icon/Icon';
import chips from '../ChipGroup/ChipGroup.module.css';
import styles from './ChoiceChips.module.css';

interface ChoiceChipsProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (key: string) => void;
}

/** Einfachauswahl als Chips (gleiche Optik wie ChipGroup). Gewählt = Häkchen und Fläche. */
export function ChoiceChips({ label, options, value, onChange }: ChoiceChipsProps) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <button key={option.key} type="button" role="radio" aria-checked={active}
            className={[chips.chip, active && chips.active].filter(Boolean).join(' ')} onClick={() => onChange(option.key)}>
            {active && <Icon name="tick" size={16} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
