import { describe, expect, it } from '@jest/globals';
import { VALIDATORS } from '@/constants';
import { parseDirectDebitCallbackUrl } from '@/utils/directDebitCallback';

describe('direct debit callback URL patterns (path-anchored)', () => {
  const success = VALIDATORS.DIRECT_DEBIT_SUCCESS_URL_PATTERN;
  const failure = VALIDATORS.DIRECT_DEBIT_FAILURE_URL_PATTERN;

  it('matches the success callback path with query/hash or at the end', () => {
    expect(success.test('https://api.aqwire.dev/payment-methods/direct-debit/success?state=abc')).toBe(true);
    expect(success.test('https://api.aqwire.dev/payment-methods/direct-debit/success')).toBe(true);
    expect(success.test('https://api.aqwire.dev/payment-methods/direct-debit/success#done')).toBe(true);
    expect(success.test('https://api.aqwire.dev/payment-methods/direct-debit/callback/success?state=abc')).toBe(false);
  });

  it('does not match look-alike paths (guards against substring spoofing)', () => {
    expect(success.test('https://evil.test/payment-methods/direct-debit/success.evil.com/x')).toBe(false);
    expect(success.test('https://api.aqwire.dev/payment-methods/direct-debit/error')).toBe(false);
    expect(success.test('https://api.aqwire.dev/gateway/maya/vault/abc/success')).toBe(false);
  });

  it('matches error and cancel for the failure pattern only', () => {
    expect(failure.test('https://api.aqwire.dev/payment-methods/direct-debit/error?state=abc')).toBe(true);
    expect(failure.test('https://api.aqwire.dev/payment-methods/direct-debit/cancel')).toBe(true);
    expect(failure.test('https://api.aqwire.dev/payment-methods/direct-debit/success')).toBe(false);
  });
});

describe('parseDirectDebitCallbackUrl', () => {
  it('parses a success deep link', () => {
    expect(parseDirectDebitCallbackUrl('personaldashboardmob://mobile/direct-debit-result?outcome=success'))
      .toEqual({ outcome: 'success' });
  });

  it('parses a cancelled deep link', () => {
    expect(parseDirectDebitCallbackUrl('personaldashboardmob://mobile/direct-debit-result?outcome=cancelled'))
      .toEqual({ outcome: 'cancelled' });
  });

  it('defaults unknown outcomes to failure', () => {
    expect(parseDirectDebitCallbackUrl('personaldashboardmob://mobile/direct-debit-result?outcome=weird'))
      .toEqual({ outcome: 'failure' });
  });

  it('matches a forwarded https callback path', () => {
    expect(parseDirectDebitCallbackUrl('https://arc.aqwire.dev/name/mobile/direct-debit-result?outcome=success'))
      .toEqual({ outcome: 'success' });
  });

  it('returns null for unrelated callbacks', () => {
    expect(parseDirectDebitCallbackUrl('personaldashboardmob://mobile/enrollment-result?outcome=success')).toBeNull();
    expect(parseDirectDebitCallbackUrl('')).toBeNull();
  });
});
