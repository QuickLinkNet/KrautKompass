import { useDraft } from '../../../hooks/useDraft';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { Input } from '../../atoms/Input/Input';
import styles from './SearchField.module.css';

interface SearchFieldProps {
  id: string;
  value: string;
  /** Wird nach einer kurzen Tipp-Pause aufgerufen */
  onCommit: (value: string) => void;
  /** Sichtbare Beschriftung; ohne = nur für Screenreader */
  label?: string;
}

/** Suchfeld mit Lupe und Löschen-Knopf; übernimmt die Eingabe verzögert. */
export function SearchField({ id, value, onCommit, label }: SearchFieldProps) {
  const [draft, setDraft] = useDraft(value, (v) => onCommit(v.trim()));
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={label ? styles.label : styles.srOnly}>{label ?? 'Suche'}</label>
      <Input
        id={id}
        type="search"
        icon="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Sorte, Hersteller, Terpen …"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        trailing={draft ? (
          <IconButton icon="x" label="Suche leeren" onClick={() => { setDraft(''); onCommit(''); }} />
        ) : undefined}
      />
    </div>
  );
}
