import { Link } from 'react-router';
import { authApi } from '../../../api/endpoints';
import { useForm } from '../../../hooks/useForm';
import layout from '../../../styles/layout.module.css';
import { Button } from '../../atoms/Button/Button';
import { Alert } from '../../molecules/Alert/Alert';
import { FormField } from '../../molecules/FormField/FormField';
import { PasswordField } from '../../molecules/PasswordField/PasswordField';

/** Neues Passwort mit dem Token aus der Reset-Mail vergeben. */
export function ResetPasswordForm({ token, onDone }: { token: string; onDone: () => void }) {
  const form = useForm({ password: '' });

  const submit = form.handleSubmit(async ({ password }) => {
    await authApi.resetPassword(token, password);
    onDone();
  });

  const tokenError = form.errors.token;
  return (
    <form className={layout.formAuth} onSubmit={submit} noValidate aria-label="Neues Passwort vergeben">
      {(form.formError || tokenError) && (
        <Alert>
          <p>{tokenError ?? form.formError}</p>
          {tokenError && <p><Link to="/passwort-vergessen">Neuen Link anfordern</Link></p>}
        </Alert>
      )}
      <FormField label="Neues Passwort" htmlFor="password" error={form.errors.password} hint="Mindestens 10 Zeichen.">
        <PasswordField id="password" autoComplete="new-password" enterKeyHint="done" value={form.values.password}
          onChange={(e) => form.set('password', e.target.value)} invalid={!!form.errors.password} />
      </FormField>
      <Button type="submit" block loading={form.submitting}>
        Passwort speichern
      </Button>
    </form>
  );
}
