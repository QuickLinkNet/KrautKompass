import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setCsrfToken, setUnauthorizedHandler } from '../../api/client';
import { authApi, systemApi } from '../../api/endpoints';
import type { SystemStatus, User } from '../../api/types';
import { errorMessage } from '../../utils/errorMessage';
import { SessionContext, type SessionState } from './sessionContext';

/**
 * Lädt beim Start /api/system/status: Installationsstatus, angemeldeter Benutzer, CSRF-Token.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await systemApi.status();
      setCsrfToken(next.csrfToken);
      setStatus(next);
      setUser(next.user);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Abgelaufene oder serverseitig beendete Sitzung (z. B. Passwortwechsel auf einem
  // anderen Gerät): Benutzer abmelden, die Routen-Guards leiten zum Login.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const signedIn = useCallback((next: User) => {
    setUser(next);
    setStatus((s) => (s ? { ...s, installed: true, user: next } : s));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<SessionState>(
    () => ({ status, user, error, refresh, signedIn, logout }),
    [status, user, error, refresh, signedIn, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
