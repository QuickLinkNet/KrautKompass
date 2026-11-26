import { initials } from '../../../utils/format';
import styles from './Avatar.module.css';

/** Kreis mit Initialen (keine Profilfotos). Dekorativ – der Name steht immer daneben. */
export function Avatar({ name }: { name: string | null }) {
  return <span className={styles.avatar} aria-hidden="true">{initials(name)}</span>;
}
