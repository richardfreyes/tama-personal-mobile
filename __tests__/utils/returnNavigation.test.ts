import { describe, expect, it } from '@jest/globals';
import { resolveInternalReturnPath } from '@/utils/returnNavigation';

describe('resolveInternalReturnPath', () => {
  const fallback = '/payment-methods';

  it('keeps valid internal application routes', () => {
    expect(resolveInternalReturnPath('/bills/one-time-payments/pay/bill_1', fallback))
      .toBe('/bills/one-time-payments/pay/bill_1');
    expect(resolveInternalReturnPath('/dashboard', fallback)).toBe('/dashboard');
  });

  it('falls back for external and unsafe destinations', () => {
    expect(resolveInternalReturnPath('https://evil.example.com', fallback)).toBe(fallback);
    expect(resolveInternalReturnPath('//evil.example.com', fallback)).toBe(fallback);
    expect(resolveInternalReturnPath('javascript:alert(1)', fallback)).toBe(fallback);
    expect(resolveInternalReturnPath('http://internal/../evil', fallback)).toBe(fallback);
    expect(resolveInternalReturnPath('bills/one-time-payments', fallback)).toBe(fallback); // not app-absolute
    expect(resolveInternalReturnPath('/path with space', fallback)).toBe(fallback);
    expect(resolveInternalReturnPath('/back\\slash', fallback)).toBe(fallback);
  });

  it('falls back for missing or non-string values', () => {
    expect(resolveInternalReturnPath(undefined, fallback)).toBe(fallback);
    expect(resolveInternalReturnPath(null, fallback)).toBe(fallback);
    expect(resolveInternalReturnPath('', fallback)).toBe(fallback);
    expect(resolveInternalReturnPath(42, fallback)).toBe(fallback);
  });
});
