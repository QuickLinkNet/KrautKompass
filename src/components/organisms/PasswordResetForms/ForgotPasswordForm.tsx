import { useState } from 'react';
import { authApi } from '../../../api/endpoints';
import { useForm } from '../../../hooks/useForm';
import layout from '../../../styles/layout.module.css';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Alert } from '../../molecules/Alert/Alert';
import { FormField } from '../../molecules/FormField/FormField';

/** Fordert einen Reset-Link an. Die Bestätigung verrät bewusst nicht, ob die Adresse registriert ist. */
export function ForgotPasswordForm() {
  const form = useForm({ email: '' });
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = form.handleSubmit(async ({ email }) => {
    await authApi.forgotPassword(email.trim());
    setSentTo(email.trim());
  });

  if (sentTo) {
    return (
      <Alert tone="success">
        <p><strong>Schau in dein Postfach.</strong></p>
        <p>
          Falls zu {sentTo} ein Konto existiert, ist eine E-Mail mit einem Link unterwegs. Er ist 60 Minuten gültig.
          Nichts angekommen? Prüfe auch den Spam-Ordner.
        </p>
      </Alert>
    );
  }

  return (
    <form className={layout.formAuth} onSubmit={submit} noValidate aria-label="Passwort zurücksetzen">
      {form.formError && <Alert>{form.formError}</Alert>}
      <FormField label="E-Mail" htmlFor="email" error={form.errors.email}>
        <Input id="email" type="email" icon="mail" placeholder="E-Mail-Adresse" inputMode="email" autoCapitalize="none"
          autoCorrect="off" autoComplete="username" enterKeyHint="send" value={form.values.email}
          onChange={(e) => form.set('email', e.target.value)} invalid={!!form.errors.email} />
      </FormField>
      <Button type="submit" block loading={form.submitting}>
        Link anfordern
      </Button>
    </form>
  );
}
