import { createContext, useContext } from 'react';
import type { SystemStatus, User } from '../../api/types';

export interface SessionState {
  /** null, solange der erste Status-Request läuft */
  status: SystemStatus | null;
  user: User | null;
  error: string | null;
  refresh: () => Promise<void>;
  signedIn: (user: User) => void;
  logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionState | null>(null);

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession() außerhalb von <SessionProvider> verwendet.');
  return ctx;
}
