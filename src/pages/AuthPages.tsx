import { Link, useNavigate, useSearchParams } from 'react-router';
import type { User } from '../api/types';
import { LoginForm } from '../components/organisms/LoginForm/LoginForm';
import { RegisterForm } from '../components/organisms/RegisterForm/RegisterForm';
import { SetupForm } from '../components/organisms/SetupForm/SetupForm';
import { AuthLayout } from '../components/templates/AuthLayout/AuthLayout';
import { useSession } from '../features/session/sessionContext';

function useSignedIn() {
  const { signedIn } = useSession();
  const navigate = useNavigate();
  return (user: User) => {
    signedIn(user);
    navigate('/', { replace: true });
  };
}

export function SetupPage() {
  const { status } = useSession();
  const done = useSignedIn();
  return (
    <AuthLayout eyebrow="Erster Start" title="Einrichtung" subtitle="Einmalig: Systemcheck und dein Admin-Konto.">
      <SetupForm requirements={status?.requirements ?? []} onDone={done} />
    </AuthLayout>
  );
}

export function LoginPage() {
  const { status } = useSession();
  const done = useSignedIn();
  return (
    <AuthLayout
      eyebrow={status?.instanceName}
      title="Willkommen zurück"
      subtitle="Melde dich an, um Sorten zu bewerten und die Notizen der Runde zu sehen."
      footer={<>Einladung bekommen? <Link to="/registrieren">Konto anlegen</Link></>}
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
      eyebrow="Einladung"
      title="Konto anlegen"
      subtitle="Mit deinem Einladungscode bist du in zwei Minuten dabei."
      footer={<>Schon dabei? <Link to="/login">Anmelden</Link></>}
    >
      <RegisterForm initialCode={params.get('code') ?? ''} onDone={done} />
    </AuthLayout>
  );
}
