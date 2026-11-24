import type { Requirement, User } from '../../../api/types';
import { systemApi } from '../../../api/endpoints';
import { useForm } from '../../../hooks/useForm';
import layout from '../../../styles/layout.module.css';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { Input } from '../../atoms/Input/Input';
import { Alert } from '../../molecules/Alert/Alert';
import { FormField } from '../../molecules/FormField/FormField';
import { PasswordField } from '../../molecules/PasswordField/PasswordField';
import styles from './SetupForm.module.css';

/** Einrichtungsassistent: prüft Voraussetzungen und legt den ersten Admin an. */
export function SetupForm({ requirements, onDone }: { requirements: Requirement[]; onDone: (user: User) => void }) {
  const form = useForm({ instance_name: 'KrautKompass', display_name: '', email: '', password: '' });
  const allOk = requirements.every((r) => r.ok);

  const submit = form.handleSubmit(async (values) => {
    const { user } = await systemApi.install({ ...values, email: values.email.trim() });
    onDone(user);
  });

  return (
    <form className={layout.formAuth} onSubmit={submit} noValidate aria-label="Einrichtung">
      <ul className={styles.checks} aria-label="Systemvoraussetzungen">
        {requirements.map((r) => (
          <li key={r.key} className={r.ok ? styles.ok : styles.fail}>
            <Icon name={r.ok ? 'check' : 'alert'} size={18} label={r.ok ? 'erfüllt' : 'fehlt'} />
            {r.label}
          </li>
        ))}
      </ul>
      {!allOk && <Alert>Bitte erst die fehlenden Voraussetzungen auf dem Server beheben.</Alert>}
      {form.formError && <Alert>{form.formError}</Alert>}

      <FormField label="Name der Runde" htmlFor="instance" error={form.errors.instance_name}>
        <Input id="instance" value={form.values.instance_name} onChange={(e) => form.set('instance_name', e.target.value)}
          invalid={!!form.errors.instance_name} />
      </FormField>
      <FormField label="Dein Anzeigename" htmlFor="name" error={form.errors.display_name}>
        <Input id="name" icon="user" autoComplete="nickname" value={form.values.display_name}
          onChange={(e) => form.set('display_name', e.target.value)} invalid={!!form.errors.display_name} />
      </FormField>
      <FormField label="E-Mail" htmlFor="email" error={form.errors.email}>
        <Input id="email" type="email" icon="mail" placeholder="E-Mail-Adresse" inputMode="email" autoCapitalize="none"
          autoCorrect="off" autoComplete="email" value={form.values.email}
          onChange={(e) => form.set('email', e.target.value)} invalid={!!form.errors.email} />
      </FormField>
      <FormField label="Passwort" htmlFor="password" error={form.errors.password} hint="Mindestens 10 Zeichen.">
        <PasswordField id="password" autoComplete="new-password" value={form.values.password}
          onChange={(e) => form.set('password', e.target.value)} invalid={!!form.errors.password} />
      </FormField>
      <Button type="submit" block loading={form.submitting} disabled={!allOk}>
        Einrichten und als Admin anmelden
      </Button>
    </form>
  );
}
