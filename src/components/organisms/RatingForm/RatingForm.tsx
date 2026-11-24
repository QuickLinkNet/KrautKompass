import { productApi } from '../../../api/endpoints';
import type { Meta, Rating, RatingInput } from '../../../api/types';
import { useForm } from '../../../hooks/useForm';
import layout from '../../../styles/layout.module.css';
import { Button } from '../../atoms/Button/Button';
import { Input, Select, Textarea } from '../../atoms/Input/Input';
import { Alert } from '../../molecules/Alert/Alert';
import { ChipGroup } from '../../molecules/ChipGroup/ChipGroup';
import { FormField } from '../../molecules/FormField/FormField';
import { ScoreInput } from '../../molecules/ScoreInput/ScoreInput';
import styles from './RatingForm.module.css';

interface Props {
  productId: number;
  meta: Meta;
  existing: Rating | null;
  onSaved: () => void;
}

type Values = Omit<RatingInput, 'overall'> & { overall: number | null; effects: string[]; side_effects: string[] };

export function RatingForm({ productId, meta, existing, onSaved }: Props) {
  const form = useForm<Values>({
    overall: existing?.overall ?? null,
    taste: existing?.taste ?? null,
    aroma: existing?.aroma ?? null,
    effect: existing?.effect ?? null,
    effects: existing?.effects ?? [],
    side_effects: existing?.sideEffects ?? [],
    method: existing?.method ?? '',
    notes: existing?.notes ?? '',
    visibility: existing?.visibility ?? 'private',
    consumed_at: existing?.consumedAt ?? '',
  });
  const v = form.values;

  const submit = form.handleSubmit(async (values) => {
    if (values.overall === null) throw new Error('Bitte eine Gesamtbewertung vergeben.');
    await productApi.rate(productId, {
      ...values,
      overall: values.overall,
      method: values.method || null,
      notes: values.notes || null,
      consumed_at: values.consumed_at || null,
    });
    onSaved();
  });

  const remove = form.handleSubmit(async () => {
    await productApi.deleteRating(productId);
    onSaved();
  });

  return (
    <form className={layout.form} onSubmit={submit}>
      {form.formError && <Alert>{form.formError}</Alert>}
      <FormField label="Gesamt *" error={form.errors.overall}>
        <ScoreInput label="Gesamt" value={v.overall} max={meta.scaleMax} onChange={(n) => form.set('overall', n)} />
      </FormField>
      <div className={styles.scores}>
        {(['taste', 'aroma', 'effect'] as const).map((key) => (
          <FormField key={key} label={{ taste: 'Geschmack', aroma: 'Aroma', effect: 'Wirkung' }[key]} error={form.errors[key]}>
            <ScoreInput label={key} optional value={v[key] ?? null} max={meta.scaleMax} onChange={(n) => form.set(key, n)} />
          </FormField>
        ))}
      </div>
      <FormField label="Wirkungen" error={form.errors.effects}>
        <ChipGroup label="Wirkungen" options={meta.effects} value={v.effects} onChange={(n) => form.set('effects', n)} />
      </FormField>
      <FormField label="Nebenwirkungen" error={form.errors.side_effects}>
        <ChipGroup label="Nebenwirkungen" options={meta.sideEffects} value={v.side_effects}
          onChange={(n) => form.set('side_effects', n)} />
      </FormField>
      <div className={styles.scores}>
        <FormField label="Konsumform" htmlFor="method" error={form.errors.method}>
          <Select id="method" value={v.method ?? ''} onChange={(e) => form.set('method', e.target.value)}>
            <option value="">–</option>
            {meta.methods.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </Select>
        </FormField>
        <FormField label="Probiert am" htmlFor="consumed" error={form.errors.consumed_at}>
          <Input id="consumed" type="date" value={v.consumed_at ?? ''} onChange={(e) => form.set('consumed_at', e.target.value)} />
        </FormField>
      </div>
      <FormField label="Notizen" htmlFor="notes" error={form.errors.notes}>
        <Textarea id="notes" value={v.notes ?? ''} onChange={(e) => form.set('notes', e.target.value)}
          placeholder="Wie war's? Tageszeit, Stimmung, Besonderheiten …" />
      </FormField>
      <label className={styles.share}>
        <input type="checkbox" checked={v.visibility === 'group'}
          onChange={(e) => form.set('visibility', e.target.checked ? 'group' : 'private')} />
        Mit der Runde teilen (sonst nur für dich sichtbar)
      </label>
      <div className={layout.row}>
        <Button type="submit" loading={form.submitting}>{existing ? 'Bewertung speichern' : 'Bewertung anlegen'}</Button>
        {existing && <Button type="button" variant="danger" onClick={() => void remove()}>Löschen</Button>}
      </div>
    </form>
  );
}
