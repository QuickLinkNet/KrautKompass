import { ApiError } from '../api/client';

/** Lesbare deutsche Fehlermeldung aus beliebigen Fehlern. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return 'Server nicht erreichbar. Läuft die API?';
  if (error instanceof Error) return error.message;
  return 'Unbekannter Fehler.';
}

/** Feldfehler (422) für Formulare, sonst leeres Objekt. */
export function fieldErrors(error: unknown): Record<string, string> {
  return error instanceof ApiError ? error.fields : {};
}
