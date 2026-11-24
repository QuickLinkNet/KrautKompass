import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import type { User } from '../api/types';
import { ButtonLink } from '../components/atoms/Button/Button';
import { Divider } from '../components/atoms/Divider/Divider';
import { Icon } from '../components/atoms/Icon/Icon';
import { Alert } from '../components/molecules/Alert/Alert';
import { LoginForm } from '../components/organisms/LoginForm/LoginForm';
import { ForgotPasswordForm } from '../components/organisms/PasswordResetForms/ForgotPasswordForm';
import { ResetPasswordForm } from '../components/organisms/PasswordResetForms/ResetPasswordForm';
import { RegisterForm } from '../components/organisms/RegisterForm/RegisterForm';
import { SetupForm } from '../components/organisms/SetupForm/SetupForm';
import { AuthLayout } from '../components/templates/AuthLayout/AuthLayout';
import { useSession } from '../features/session/sessionContext';
import layout from '../styles/layout.module.css';

/** Nach dem Anmelden zurück zur ursprünglich aufgerufenen Seite (von RequireUser gemerkt). */
function useSignedIn() {
  const { signedIn } = useSession();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  return (user: User) => {
    signedIn(user);
    navigate(from && from.startsWith('/') ? from : '/', { replace: true });
  };
}

function BackToLogin() {
  return (
    <Link to="/login" className={layout.backLink}>
      <Icon name="arrowLeft" size={18} />
      Zurück zur Anmeldung
    </Link>
  );
}

export function LoginPage() {
  const done = useSignedIn();
  return (
    <AuthLayout
      title="Willkommen zurück"
      footer={
        <>
          <Divider label="oder" />
          <ButtonLink to="/registrieren" icon="ticket" block>Mit Einladungscode registrieren</ButtonLink>
          <Alert tone="info" subtle>Der Zugang zu KrautKompass ist auf eingeladene Mitglieder beschränkt.</Alert>
        </>
      }
    >
      <LoginForm onDone={done} />
    </AuthLayout>
  );
}

export function RegisterPage() {
  const [params] = useSearchParams();
  const done = useSignedIn();
  return (
    <AuthLayout
      title="Konto anlegen"
      subtitle="Mit deinem persönlichen Einladungscode bist du in zwei Minuten dabei."
      footer={<BackToLogin />}
    >
      <RegisterForm initialCode={params.get('code') ?? ''} onDone={done} />
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const enabled = useSession().status?.features?.passwordReset ?? false;
  return (
    <AuthLayout
      title="Passwort vergessen?"
      subtitle={enabled ? 'Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort vergibst.' : undefined}
      footer={<BackToLogin />}
    >
      {enabled ? (
        <ForgotPasswordForm />
      ) : (
        <Alert tone="info">
          Der Versand von Reset-Links ist für diese Runde noch nicht eingerichtet. Bitte wende dich an deinen Admin.
        </Alert>
      )}
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  // Token einmal übernehmen und aus der Adresszeile entfernen (Verlauf, Screenshots, Referrer).
  const [token] = useState(() => params.get('token') ?? '');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (params.has('token')) navigate('/passwort-neu', { replace: true });
  }, [params, navigate]);

  if (done) {
    return (
      <AuthLayout title="Passwort geändert" footer={<ButtonLink to="/login" variant="primary" block>Zur Anmeldung</ButtonLink>}>
        <Alert tone="success">
          Aus Sicherheitsgründen wurden alle Geräte abgemeldet. Melde dich jetzt mit dem neuen Passwort an.
        </Alert>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Neues Passwort" subtitle="Vergib ein neues Passwort für dein Konto." footer={<BackToLogin />}>
      {token ? (
        <ResetPasswordForm token={token} onDone={() => setDone(true)} />
      ) : (
        <Alert>
          <p>Dieser Link ist unvollständig. Bitte öffne den Link aus der E-Mail erneut oder fordere einen neuen an.</p>
          <p><Link to="/passwort-vergessen">Neuen Link anfordern</Link></p>
        </Alert>
      )}
    </AuthLayout>
  );
}

export function SetupPage() {
  const { status } = useSession();
  const done = useSignedIn();
  return (
    <AuthLayout title="Einrichtung" subtitle="Einmalig: Systemcheck und dein Admin-Konto.">
      <SetupForm requirements={status?.requirements ?? []} onDone={done} />
    </AuthLayout>
  );
}
