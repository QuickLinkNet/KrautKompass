import { useState } from 'react';
import { authApi } from '../../../api/endpoints';
import { useForm } from '../../../hooks/useForm';
import layout from '../../../styles/layout.module.css';
import { Button } from '../../atoms/Button/Button';
import { Alert } from '../../molecules/Alert/Alert';
import { FormField } from '../../molecules/FormField/FormField';
import { PasswordField } from '../../molecules/PasswordField/PasswordField';

const EMPTY = { current_password: '', new_password: '', repeat: '' };

/** Passwort ändern: altes Passwort zur Bestätigung, andere Geräte werden danach abgemeldet. */
export function ChangePasswordForm() {
  const form = useForm(EMPTY);
  const [done, setDone] = useState(false);
  const [repeatError, setRepeatError] = useState<string | null>(null);

  const submit = form.handleSubmit(async ({ current_password, new_password, repeat }) => {
    setDone(false);
    if (new_password !== repeat) {
      setRepeatError('Die beiden neuen Passwörter stimmen nicht überein.');
      return;
    }
    setRepeatError(null);
    await authApi.updateProfile({ current_password, new_password });
    form.setValues(EMPTY);
    setDone(true);
  });

  return (
    <form className={layout.formAuth} onSubmit={submit} noValidate aria-label="Passwort ändern">
      {form.formError && <Alert>{form.formError}</Alert>}
      {done && (
        <Alert tone="success">
          <p><strong>Passwort geändert.</strong> Auf anderen Geräten musst du dich neu anmelden.</p>
        </Alert>
      )}
      <FormField label="Aktuelles Passwort" htmlFor="current-password" error={form.errors.current_password}>
        <PasswordField id="current-password" autoComplete="current-password" enterKeyHint="next"
          value={form.values.current_password} onChange={(e) => form.set('current_password', e.target.value)}
          invalid={!!form.errors.current_password} />
      </FormField>
      <FormField label="Neues Passwort" htmlFor="new-password" error={form.errors.new_password} hint="Mindestens 10 Zeichen.">
        <PasswordField id="new-password" autoComplete="new-password" enterKeyHint="next"
          value={form.values.new_password} onChange={(e) => form.set('new_password', e.target.value)}
          invalid={!!form.errors.new_password} />
      </FormField>
      <FormField label="Neues Passwort wiederholen" htmlFor="repeat-password" error={repeatError ?? undefined}>
        <PasswordField id="repeat-password" autoComplete="new-password" enterKeyHint="done"
          value={form.values.repeat} onChange={(e) => form.set('repeat', e.target.value)} invalid={!!repeatError} />
      </FormField>
      <Button type="submit" block loading={form.submitting}>Passwort ändern</Button>
    </form>
  );
}
