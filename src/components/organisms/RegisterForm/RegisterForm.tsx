import { authApi } from '../../../api/endpoints';
import type { User } from '../../../api/types';
import { useForm } from '../../../hooks/useForm';
import layout from '../../../styles/layout.module.css';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Alert } from '../../molecules/Alert/Alert';
import { FormField } from '../../molecules/FormField/FormField';
import { PasswordField } from '../../molecules/PasswordField/PasswordField';

/** Registrierung nur mit Einladungscode (z. B. aus dem Link /registrieren?code=KK-…). */
export function RegisterForm({ initialCode, onDone }: { initialCode: string; onDone: (user: User) => void }) {
  const form = useForm({ invite_code: initialCode, display_name: '', email: '', password: '' });

  const submit = form.handleSubmit(async (values) => {
    const { user } = await authApi.register({ ...values, invite_code: values.invite_code.trim().toUpperCase() });
    onDone(user);
  });

  return (
    <form className={layout.form} onSubmit={submit} noValidate>
      {form.formError && <Alert>{form.formError}</Alert>}
      <FormField label="Einladungscode" htmlFor="code" error={form.errors.invite_code}>
        <Input id="code" placeholder="KK-XXXX-XXXX" value={form.values.invite_code}
          onChange={(e) => form.set('invite_code', e.target.value)} invalid={!!form.errors.invite_code} />
      </FormField>
      <FormField label="Anzeigename" htmlFor="name" error={form.errors.display_name} hint="So sehen dich die anderen.">
        <Input id="name" autoComplete="nickname" value={form.values.display_name}
          onChange={(e) => form.set('display_name', e.target.value)} invalid={!!form.errors.display_name} />
      </FormField>
      <FormField label="E-Mail" htmlFor="email" error={form.errors.email}>
        <Input id="email" type="email" inputMode="email" autoCapitalize="none" autoComplete="email" value={form.values.email}
          onChange={(e) => form.set('email', e.target.value)} invalid={!!form.errors.email} />
      </FormField>
      <FormField label="Passwort" htmlFor="password" error={form.errors.password} hint="Mindestens 10 Zeichen.">
        <PasswordField id="password" autoComplete="new-password" value={form.values.password}
          onChange={(e) => form.set('password', e.target.value)} invalid={!!form.errors.password} />
      </FormField>
      <Button type="submit" block loading={form.submitting}>
        Konto anlegen
      </Button>
    </form>
  );
}
