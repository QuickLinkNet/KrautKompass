import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { ratingApi } from '../../../api/endpoints';
import type { Meta, Product, Rating } from '../../../api/types';
import { isDirty, toDraft, toInput, VISIBILITY_OPTIONS, type RatingDraft } from '../../../features/rating/ratingDraft';
import { errorMessage } from '../../../utils/errorMessage';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { Alert } from '../../molecules/Alert/Alert';
import { ConfirmDialog } from '../../molecules/ConfirmDialog/ConfirmDialog';
import { Dialog } from '../../molecules/Dialog/Dialog';
import { SegmentedChoice } from '../../molecules/SegmentedChoice/SegmentedChoice';
import { RatingFields } from './RatingFields';
import styles from './RatingDialog.module.css';

interface RatingDialogProps {
  open: boolean;
  product: Product;
  meta: Meta;
  existing: Rating | null;
  onClose: () => void;
  /** Nach Speichern oder Löschen: Seite im Hintergrund aktualisieren */
  onChanged: () => void;
  /** Wird gefragt, bevor die Zurück-Geste den Dialog schließt */
  mayClose: RefObject<() => boolean>;
}

const FORM_ID = 'rating-form';

/** Sorte bewerten: Vollbild auf dem Handy, Dialog ab Tablet (Screendesign 03). */
export function RatingDialog({ open, product, meta, existing, onClose, onChanged, mayClose }: RatingDialogProps) {
  const [base, setBase] = useState(existing);
  const [draft, setDraft] = useState<RatingDraft>(() => toDraft(existing));
  const [view, setView] = useState<'form' | 'saved'>('form');
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ask, setAsk] = useState<'discard' | 'delete' | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const savedTitle = useRef<HTMLParagraphElement>(null);
  const missing = draft.overall === null;

  // Beim Öffnen immer mit dem aktuellen Stand beginnen; Nachladen währenddessen ändert nichts.
  useEffect(() => {
    if (!open) return;
    setBase(existing);
    setDraft(toDraft(existing));
    setView('form');
    setAttempted(false);
    setError(null);
    setAsk(null);
  }, [open]);

  useEffect(() => {
    if (view === 'saved') savedTitle.current?.focus();
  }, [view]);

  const tryClose = () => {
    if (busy) return false;
    if (view === 'form' && isDirty(draft, base)) {
      setAsk('discard');
      return false;
    }
    return true;
  };
  mayClose.current = tryClose;

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    if (busy) return;
    if (draft.overall === null) {
      setAttempted(true);
      document.getElementById(FORM_ID)?.querySelector<HTMLInputElement>('input[type="range"]')?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const input = toInput(draft, draft.overall);
      if (existing) await ratingApi.update(existing.id, input);
      else await ratingApi.create(product.id, input);
      setView('saved');
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setDeleteError(null);
    try {
      if (existing) await ratingApi.remove(existing.id);
      setAsk(null);
      onChanged();
      onClose();
    } catch (e) {
      setDeleteError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const footer = view === 'saved' ? (
    <Button type="button" block iconEnd="arrowRight" onClick={onClose}>Zur Sorte</Button>
  ) : (
    <div className={styles.footer}>
      {error && (
        <Alert>
          <strong>Speichern hat nicht geklappt.</strong> Deine Eingaben sind noch da. {error}
        </Alert>
      )}
      <SegmentedChoice
        label="Sichtbarkeit"
        columns="auto"
        options={VISIBILITY_OPTIONS}
        value={draft.visibility}
        onChange={(v) => v && setDraft((d) => ({ ...d, visibility: v }))}
      />
      <Button type="submit" form={FORM_ID} block loading={busy && ask === null} aria-disabled={missing || undefined}
        className={missing ? styles.incomplete : undefined}>
        {busy && ask === null ? 'Wird gespeichert …' : error ? 'Erneut versuchen' : 'Bewertung speichern'}
      </Button>
    </div>
  );

  return (
    <>
      <Dialog
        open={open}
        onRequestClose={() => tryClose() && onClose()}
        title={product.name}
        media={product.thumbUrl && <img src={product.thumbUrl} alt="" className={styles.thumb} />}
        footer={footer}
      >
        {view === 'saved' ? (
          <div className={styles.saved}>
            <span className={styles.savedIcon}><Icon name="tick" size={24} /></span>
            <p ref={savedTitle} tabIndex={-1} className={styles.savedTitle} role="status">Bewertung gespeichert</p>
            <p className={styles.savedText}>
              {draft.visibility === 'group' ? 'Die Runde kann sie jetzt sehen.' : 'Nur du kannst sie sehen.'}
            </p>
          </div>
        ) : (
          <form id={FORM_ID} onSubmit={(e) => void save(e)} noValidate>
            <RatingFields
              draft={draft}
              meta={meta}
              showError={attempted && missing}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            />
            {base && (
              <Button type="button" variant="ghost" block className={styles.delete} onClick={() => setAsk('delete')}>
                Bewertung löschen
              </Button>
            )}
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={ask === 'discard'}
        title="Änderungen verwerfen?"
        cancelLabel="Weiter bearbeiten"
        confirmLabel="Verwerfen"
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          setAsk(null);
          onClose();
        }}
      >
        Deine nicht gespeicherten Änderungen gehen dabei verloren.
      </ConfirmDialog>

      <ConfirmDialog
        open={ask === 'delete'}
        title="Bewertung wirklich löschen?"
        cancelLabel="Abbrechen"
        confirmLabel="Löschen"
        loading={busy}
        error={deleteError}
        onCancel={() => !busy && setAsk(null)}
        onConfirm={() => void remove()}
      >
        Deine gesamte Bewertung zu {product.name} wird gelöscht. Das lässt sich nicht rückgängig machen.
      </ConfirmDialog>
    </>
  );
}
