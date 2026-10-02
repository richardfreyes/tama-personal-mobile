import { decodeJwt, normalizeBase64Url } from '@/utils/jwt';
import { describe, expect, it } from '@jest/globals';

describe('normalizeBase64Url', () => {
  it('replaces URL-safe characters with standard base64', () => {
    expect(normalizeBase64Url('abc-def_ghi')).toBe('abc+def/ghi=');
  });

  it('pads to a multiple of 4', () => {
    expect(normalizeBase64Url('ab')).toBe('ab==');
    expect(normalizeBase64Url('abc')).toBe('abc=');
    expect(normalizeBase64Url('abcd')).toBe('abcd');
  });

  it('leaves already-padded standard base64 unchanged', () => {
    expect(normalizeBase64Url('dGVzdA==')).toBe('dGVzdA==');
  });
});

describe('decodeJwt', () => {
  const makeToken = (payload: object): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.signature`;
  };

  it('decodes a valid JWT payload', () => {
    const payload = { sub: '123', name: 'Test User', exp: 9999999999 };
    const token = makeToken(payload);
    const decoded = decodeJwt(token);

    expect(decoded).toMatchObject({ sub: '123', name: 'Test User' });
  });

  it('returns null for tokens with wrong number of parts', () => {
    expect(decodeJwt('only.two')).toBeNull();
    expect(decodeJwt('no-dots')).toBeNull();
    expect(decodeJwt('a.b.c.d')).toBeNull();
  });

  it('returns null for tokens with invalid base64 payloads', () => {
    expect(decodeJwt('header.!!!invalid!!!.sig')).toBeNull();
  });
});
