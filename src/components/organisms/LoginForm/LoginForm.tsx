import { authApi } from '../../../api/endpoints';
import type { User } from '../../../api/types';
import { useForm } from '../../../hooks/useForm';
import layout from '../../../styles/layout.module.css';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Alert } from '../../molecules/Alert/Alert';
import { FormField } from '../../molecules/FormField/FormField';
import { PasswordField } from '../../molecules/PasswordField/PasswordField';

export function LoginForm({ onDone }: { onDone: (user: User) => void }) {
  const form = useForm({ email: '', password: '' });

  const submit = form.handleSubmit(async ({ email, password }) => {
    const { user } = await authApi.login(email, password);
    onDone(user);
  });

  return (
    <form className={layout.form} onSubmit={submit} noValidate>
      {form.formError && <Alert>{form.formError}</Alert>}
      <FormField label="E-Mail" htmlFor="email" error={form.errors.email}>
        <Input id="email" type="email" inputMode="email" autoCapitalize="none" autoComplete="username" value={form.values.email}
          onChange={(e) => form.set('email', e.target.value)} invalid={!!form.errors.email} />
      </FormField>
      <FormField label="Passwort" htmlFor="password" error={form.errors.password}>
        <PasswordField id="password" autoComplete="current-password" value={form.values.password}
          onChange={(e) => form.set('password', e.target.value)} invalid={!!form.errors.password} />
      </FormField>
      <Button type="submit" block loading={form.submitting}>
        Anmelden
      </Button>
    </form>
  );
}
