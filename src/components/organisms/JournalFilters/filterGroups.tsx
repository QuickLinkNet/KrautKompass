import type { Again, Meta, Visibility } from '../../../api/types';
import { STAR_STEPS, type JournalFilters } from '../../../features/journal/journalQuery';
import { ChipGroup } from '../../molecules/ChipGroup/ChipGroup';
import { SegmentedChoice } from '../../molecules/SegmentedChoice/SegmentedChoice';

export type FilterGroupKey = 'stars' | 'effects' | 'methods' | 'again' | 'visibility';

export const GROUP_TITLES: Record<FilterGroupKey, string> = {
  stars: 'Ab Sterne',
  effects: 'Wirkung',
  methods: 'Konsumform',
  again: 'Würde ich wieder nehmen',
  visibility: 'Sichtbarkeit',
};

interface GroupProps {
  group: FilterGroupKey;
  filters: JournalFilters;
  meta: Meta | null;
  onChange: (patch: Partial<JournalFilters>) => void;
}

const ALL = 'alle';

/** Eine Filtergruppe; dieselben Bausteine im Sheet (Handy) und in den Menüs (Desktop). */
export function FilterGroup({ group, filters, meta, onChange }: GroupProps) {
  const label = GROUP_TITLES[group];
  switch (group) {
    case 'stars':
      return (
        <SegmentedChoice label={label} columns="fit" value={filters.minScore === null ? ALL : String(filters.minScore)}
          options={STAR_STEPS.map((s) => ({ value: s.score === null ? ALL : String(s.score), label: s.label }))}
          onChange={(v) => onChange({ minScore: v === null || v === ALL ? null : Number(v) })} />
      );
    case 'effects':
      return <ChipGroup label={label} options={meta?.effects ?? []} value={filters.effects} onChange={(effects) => onChange({ effects })} />;
    case 'methods':
      return <ChipGroup label={label} options={meta?.methods ?? []} value={filters.methods} onChange={(methods) => onChange({ methods })} />;
    case 'again':
      return (
        <SegmentedChoice<Again | typeof ALL> label={label} columns="fit" value={filters.again ?? ALL}
          options={[{ value: ALL, label: 'Alle' }, { value: 'yes', label: 'Ja' }, { value: 'maybe', label: 'Vielleicht' }, { value: 'no', label: 'Nein' }]}
          onChange={(v) => onChange({ again: v === null || v === ALL ? null : v })} />
      );
    case 'visibility':
      return (
        <SegmentedChoice<Visibility | typeof ALL> label={label} columns={3} value={filters.visibility ?? ALL}
          options={[{ value: ALL, label: 'Alle' }, { value: 'private', label: 'Nur für mich' }, { value: 'group', label: 'Mit der Runde geteilt' }]}
          onChange={(v) => onChange({ visibility: v === null || v === ALL ? null : v })} />
      );
  }
}

/** Kurztext für den Menü-Knopf am Desktop, z. B. „4+“ oder „2 gewählt“ */
export function groupSummary(group: FilterGroupKey, f: JournalFilters, meta: Meta | null): string | null {
  const label = (key: string | undefined, options = meta?.effects) => options?.find((o) => o.key === key)?.label ?? key ?? '';
  switch (group) {
    case 'stars': return STAR_STEPS.find((s) => s.score === f.minScore && s.score !== null)?.label ?? null;
    case 'effects': return f.effects.length === 1 ? label(f.effects[0]) : f.effects.length ? `${f.effects.length} gewählt` : null;
    case 'methods': return f.methods.length === 1 ? label(f.methods[0], meta?.methods) : f.methods.length ? `${f.methods.length} gewählt` : null;
    case 'again': return f.again ? { yes: 'Ja', maybe: 'Vielleicht', no: 'Nein' }[f.again] : null;
    case 'visibility': return f.visibility ? { private: 'Nur für mich', group: 'Geteilt' }[f.visibility] : null;
  }
}
