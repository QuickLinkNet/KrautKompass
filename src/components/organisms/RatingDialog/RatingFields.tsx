import type { Meta } from '../../../api/types';
import { AGAIN_OPTIONS, DETAIL_SCORES, methodIcon, today, type RatingDraft } from '../../../features/rating/ratingDraft';
import { Icon } from '../../atoms/Icon/Icon';
import { Input, Textarea } from '../../atoms/Input/Input';
import { ChipGroup } from '../../molecules/ChipGroup/ChipGroup';
import { Disclosure } from '../../molecules/Disclosure/Disclosure';
import { SegmentedChoice } from '../../molecules/SegmentedChoice/SegmentedChoice';
import { StarInput } from '../../molecules/StarInput/StarInput';
import styles from './RatingFields.module.css';

interface RatingFieldsProps {
  draft: RatingDraft;
  meta: Meta;
  onChange: (patch: Partial<RatingDraft>) => void;
  /** Gesamtbewertung fehlt und es wurde schon versucht zu speichern */
  showError: boolean;
}

const chosen = (n: number) => (n > 0 ? `${n} gewählt` : undefined);

export function RatingFields({ draft, meta, onChange, showError }: RatingFieldsProps) {
  return (
    <div className={styles.fields}>
      <section className={styles.overall}>
        <h3 className={styles.heading}>Wie war’s insgesamt?</h3>
        <StarInput label="Gesamtbewertung" size="lg" value={draft.overall} invalid={showError}
          describedBy="overall-hint" onChange={(overall) => onChange({ overall })} />
        {draft.overall === null && (
          <p id="overall-hint" className={showError ? styles.error : styles.hint} role={showError ? 'alert' : undefined}>
            <Icon name={showError ? 'alert' : 'info'} size={18} />
            Bitte vergib eine Gesamtbewertung.
          </p>
        )}
      </section>

      <section>
        <h3 className={styles.heading}>Im Detail</h3>
        <ul className={styles.scores}>
          {DETAIL_SCORES.map(({ key, label }) => (
            <li key={key} className={styles.score}>
              <span className={styles.scoreLabel} aria-hidden="true">{label}</span>
              <StarInput label={label} clearable value={draft[key]} onChange={(n) => onChange({ [key]: n })} />
            </li>
          ))}
        </ul>
      </section>

      <Disclosure title="Wie hat es gewirkt?" info={chosen(draft.effects.length)} defaultOpen>
        <ChipGroup label="Wirkungen" options={meta.effects} value={draft.effects} onChange={(effects) => onChange({ effects })} />
      </Disclosure>

      <Disclosure title="Nebenwirkungen" info={chosen(draft.sideEffects.length)} defaultOpen={draft.sideEffects.length > 0}>
        <ChipGroup label="Nebenwirkungen" tone="warning" options={meta.sideEffects} value={draft.sideEffects}
          onChange={(sideEffects) => onChange({ sideEffects })} />
      </Disclosure>

      <section>
        <h3 className={styles.heading}>Konsumform</h3>
        <SegmentedChoice label="Konsumform" clearable value={draft.method} onChange={(method) => onChange({ method })}
          options={meta.methods.map((m) => ({ value: m.key, label: m.label, icon: methodIcon(m.key) }))} />
      </section>

      <section>
        <label className={styles.heading} htmlFor="rating-date">Probiert am</label>
        <Input id="rating-date" type="date" icon="calendar" className={styles.date} max={today()} value={draft.consumedAt}
          onChange={(e) => onChange({ consumedAt: e.target.value })} />
      </section>

      <section>
        <h3 className={styles.heading}>Würdest du sie wieder nehmen?</h3>
        <SegmentedChoice label="Würdest du sie wieder nehmen?" columns={3} clearable options={AGAIN_OPTIONS}
          value={draft.again} onChange={(again) => onChange({ again })} />
      </section>

      <section>
        <label className={styles.heading} htmlFor="rating-notes">Notizen</label>
        <Textarea id="rating-notes" value={draft.notes} maxLength={4000}
          placeholder="Wie war’s? Tageszeit, Stimmung, Besonderheiten …"
          onChange={(e) => onChange({ notes: e.target.value })} />
      </section>
    </div>
  );
}
