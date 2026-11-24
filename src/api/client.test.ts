import { describe, expect, it } from 'vitest';
import { ApiError, buildUrl, toApiError } from './client';

describe('buildUrl', () => {
  it('lässt leere Filter weg und kodiert Werte', () => {
    expect(buildUrl('/products', { q: 'Larry GMO', producer: '', available: true, page: 2, terpene: undefined }))
      .toBe('/api/products?q=Larry+GMO&available=1&page=2');
  });

  it('kommt ohne Query aus', () => {
    expect(buildUrl('/system/status')).toBe('/api/system/status');
  });
});

describe('toApiError', () => {
  it('übernimmt Code, Meldung und Feldfehler der API', () => {
    const error = toApiError(422, {
      error: { code: 'validation_failed', message: 'Bitte Eingaben prüfen.', details: { fields: { email: 'Pflichtfeld.' } } },
    });
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('validation_failed');
    expect(error.fields).toEqual({ email: 'Pflichtfeld.' });
  });

  it('liefert eine verständliche Meldung bei kaputter Antwort', () => {
    expect(toApiError(502, null).message).toContain('HTTP 502');
  });
});
