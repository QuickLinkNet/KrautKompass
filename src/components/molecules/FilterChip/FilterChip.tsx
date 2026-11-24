import { Icon, type IconName } from '../../atoms/Icon/Icon';
import styles from './FilterChip.module.css';

interface FilterChipProps {
  label: string;
  icon?: IconName;
  onRemove: () => void;
}

/** Aktiver Filter; ein Tipp entfernt ihn. */
export function FilterChip({ label, icon, onRemove }: FilterChipProps) {
  return (
    <button type="button" className={styles.chip} onClick={onRemove} aria-label={`Filter entfernen: ${label}`}>
      {icon && <Icon name={icon} size={14} />}
      <span>{label}</span>
      <Icon name="x" size={14} className={styles.remove} />
    </button>
  );
}
