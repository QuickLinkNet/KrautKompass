// Fetch-Wrapper: JSON, Session-Cookie, CSRF-Header und einheitliche Fehler.
// Härtung: Timeout, automatischer Token-Refresh bei 419, Meldung bei abgelaufener Sitzung (401).

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Query = Record<string, string | number | boolean | null | undefined>;
export interface RequestOptions {
  /** Abbruch nach x ms (Standard 20 s; der Shop-Abgleich braucht länger) */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 20_000;
let csrfToken = '';
let onUnauthorized: (() => void) | null = null;

/** Wird nach /system/status, Login, Logout usw. mit dem aktuellen Token gefüttert. */
export function setCsrfToken(token: string): void {
  csrfToken = token;
}

/** Callback, wenn der Server die Sitzung nicht (mehr) kennt – z. B. zurück zum Login. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      params.set(key, value === true ? '1' : String(value));
    }
  }
  const qs = params.toString();
  return `/api${path}${qs ? `?${qs}` : ''}`;
}

async function send(method: Method, url: string, body: unknown, timeoutMs: number): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-CSRF-Token'] = csrfToken;
  try {
    return await fetch(url, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      throw new ApiError(0, 'timeout', 'Der Server antwortet nicht. Bitte später erneut versuchen.');
    }
    throw new ApiError(0, 'network', 'Server nicht erreichbar. Besteht eine Internetverbindung?');
  }
}

/** Holt ein frisches CSRF-Token (z. B. nach abgelaufener Sitzung). */
async function refreshCsrfToken(): Promise<void> {
  const response = await send('GET', buildUrl('/system/status'), undefined, DEFAULT_TIMEOUT_MS);
  const data = (await response.json().catch(() => null)) as { csrfToken?: unknown } | null;
  if (typeof data?.csrfToken === 'string') setCsrfToken(data.csrfToken);
}

export async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  query?: Query,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, query);
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let response = await send(method, url, body, timeout);

  // Token abgelaufen (Sitzung erneuert): einmal frisches Token holen und wiederholen.
  if (response.status === 419 && method !== 'GET') {
    await refreshCsrfToken();
    response = await send(method, url, body, timeout);
  }

  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = toApiError(response.status, data);
    if (error.code === 'unauthorized') onUnauthorized?.();
    throw error;
  }

  const token = (data as { csrfToken?: unknown } | null)?.csrfToken;
  if (typeof token === 'string') setCsrfToken(token);
  return data as T;
}

export function toApiError(status: number, data: unknown): ApiError {
  const error = (data as { error?: { code?: string; message?: string; details?: { fields?: Record<string, string> } } })
    ?.error;
  return new ApiError(
    status,
    error?.code ?? 'unknown',
    error?.message ?? `Unerwarteter Fehler (HTTP ${status}).`,
    error?.details?.fields ?? {},
  );
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body: unknown = {}, options?: RequestOptions) =>
    request<T>('POST', path, body, undefined, options),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
