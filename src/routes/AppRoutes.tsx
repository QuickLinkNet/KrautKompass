import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { Button } from '../components/atoms/Button/Button';
import { Spinner } from '../components/atoms/Spinner/Spinner';
import { Alert } from '../components/molecules/Alert/Alert';
import { AppLayout, PageContainer } from '../components/templates/AppLayout/AppLayout';
import { AuthLayout } from '../components/templates/AuthLayout/AuthLayout';
import { useSession } from '../features/session/sessionContext';
import { AccountPage } from '../pages/AccountPage';
import { ImprintPage } from '../pages/ImprintPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { AdminPage } from '../pages/AdminPage';
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage, SetupPage } from '../pages/AuthPages';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductsPage } from '../pages/ProductsPage';
import { NewsPage } from '../pages/NewsPage';
import { JournalPage } from '../pages/JournalPage';

/**
 * Routing mit Guards:
 *  - nicht installiert → /einrichtung
 *  - nicht angemeldet → /login (Registrierung und Passwort-Reset bleiben erreichbar)
 *  - Admin-Bereich nur für Admins
 */
export function AppRoutes() {
  const { status, user, error, refresh } = useSession();

  if (!status) {
    return error ? (
      <AuthLayout title="Keine Verbindung">
        <Alert>{error}</Alert>
        <p><Button onClick={() => void refresh()}>Erneut versuchen</Button></p>
      </AuthLayout>
    ) : <Spinner label="KrautKompass startet …" />;
  }

  if (!status.installed) {
    return (
      <Routes>
        <Route path="/einrichtung" element={<SetupPage />} />
        <Route path="*" element={<Navigate to="/einrichtung" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/impressum" element={<ImprintPage />} />
      <Route path="/datenschutz" element={<PrivacyPage />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/registrieren" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/passwort-vergessen" element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
      {/* Bewusst auch angemeldet erreichbar: der Link aus der Mail soll immer funktionieren */}
      <Route path="/passwort-neu" element={<ResetPasswordPage />} />
      <Route element={<RequireUser><AppLayout /></RequireUser>}>
        {/* Startseite: Sortenkatalog mit eigener Vollbreite (Kopfband) */}
        <Route index element={<ProductsPage />} />
        <Route path="/neuigkeiten" element={<NewsPage />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/" replace />} />
        <Route element={<PageContainer />}>
          <Route path="/sorten/:id" element={<ProductDetailPage />} />
          <Route path="/bewertungen" element={<JournalPage />} />
          <Route path="/konto" element={<AccountPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RequireUser({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
