import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, request, setCsrfToken, setUnauthorizedHandler } from './client';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
});

describe('request – Härtung', () => {
  it('holt bei 419 ein frisches CSRF-Token und wiederholt die Anfrage einmal', async () => {
    setCsrfToken('alt');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(419, { error: { code: 'csrf_mismatch', message: 'abgelaufen' } }))
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'neu' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('POST', '/auth/logout', {})).resolves.toEqual({ ok: true });
    const retryHeaders = (fetchMock.mock.calls[2]?.[1] as RequestInit).headers as Record<string, string>;
    expect(retryHeaders['X-CSRF-Token']).toBe('neu');
  });

  it('meldet abgelaufene Sitzungen (401) an den Session-Handler', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      jsonResponse(401, { error: { code: 'unauthorized', message: 'Bitte zuerst anmelden.' } }),
    ));
    await expect(request('GET', '/products')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('übersetzt Netzwerkfehler in eine verständliche Meldung', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(request('GET', '/products')).rejects.toMatchObject({ code: 'network' });
  });

  it('übernimmt neue CSRF-Tokens aus Antworten', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 't2' }))
      .mockResolvedValueOnce(jsonResponse(200, {}));
    vi.stubGlobal('fetch', fetchMock);
    await request('POST', '/auth/login', {});
    await request('POST', '/auth/logout', {});
    const headers = (fetchMock.mock.calls[1]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers['X-CSRF-Token']).toBe('t2');
  });
});
