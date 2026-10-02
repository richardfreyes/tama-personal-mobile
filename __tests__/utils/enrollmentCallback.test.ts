import { describe, expect, it, jest } from '@jest/globals';
import * as WebBrowser from 'expo-web-browser';
import { getEnrollmentResultRoute, getLegacyEnrollmentCallbackResult, handleEnrollmentBrowserCallback, normaliseEnrollmentCallbackMessage, normaliseEnrollmentCallbackOutcome, parseEnrollmentCallbackUrl } from '../../utils/enrollmentCallback';

jest.mock('expo-web-browser', () => ({
  dismissBrowser: jest.fn(() => Promise.resolve()),
}));

describe('enrollment callback parsing', () => {
  it('parses a custom-scheme callback and decodes its safe result parameters', () => {
    expect(parseEnrollmentCallbackUrl(
      'personaldashboardmob://enrollment-result?outcome=success&message=Verified+%26+ready%2E',
    )).toEqual({
      outcome: 'success',
      message: 'Verified & ready.',
    });
  });

  it('parses the configured universal-link callback path', () => {
    expect(parseEnrollmentCallbackUrl(
      'https://app.aqwire.io/v1/mobile/enrollment-result?outcome=cancelled&message=User+cancelled',
    )).toEqual({
      outcome: 'cancelled',
      message: 'User cancelled',
    });
  });

  it('parses a native relative callback and maps only result fields to the app route', () => {
    const result = parseEnrollmentCallbackUrl(
      '/v1/mobile/enrollment-result?outcome=failure&message=Try+again&return_url=https%3A%2F%2Fevil.example',
    );

    expect(result).toEqual({
      outcome: 'failure',
      message: 'Try again',
    });
    expect(getEnrollmentResultRoute(result!)).toBe(
      '/bills/enrollments/result?outcome=failure&message=Try%20again',
    );
  });

  it('ignores unrelated links instead of accepting a client navigation target', () => {
    expect(parseEnrollmentCallbackUrl(
      'https://evil.example/redirect?outcome=success&message=Complete',
    )).toBeNull();
  });

  it('normalises unknown outcomes and empty messages to safe failure copy', () => {
    const outcome = normaliseEnrollmentCallbackOutcome('javascript:alert(1)');
    expect(outcome).toBe('failure');
    expect(normaliseEnrollmentCallbackMessage('', outcome)).toBe(
      'Card verification failed. Please try again.',
    );
  });

  it('dismisses an active browser session and sends the parsed result to navigation', () => {
    const onResult = jest.fn();

    expect(handleEnrollmentBrowserCallback(
      'personaldashboardmob://enrollment-result?outcome=failure&message=Try+again',
      onResult,
    )).toBe(true);
    expect(WebBrowser.dismissBrowser).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith({
      outcome: 'failure',
      message: 'Try again',
    });
  });

  describe('getLegacyEnrollmentCallbackResult', () => {
    it('recognises a legacy CKO success URL', () => {
      expect(getLegacyEnrollmentCallbackResult(
        'https://example.com/merchants/m1/enrollments/e1/cko/success',
      )).toEqual({
        outcome: 'success',
        message: 'Verification complete. You may return to the app.',
      });
    });

    it('recognises a legacy CKO success URL with query params', () => {
      expect(getLegacyEnrollmentCallbackResult(
        'https://example.com/merchants/m1/enrollments/e1/cko/success?ref=123',
      )).toEqual({
        outcome: 'success',
        message: 'Verification complete. You may return to the app.',
      });
    });

    it('recognises a legacy CKO error URL', () => {
      expect(getLegacyEnrollmentCallbackResult(
        'https://example.com/merchants/m1/enrollments/e1/cko/error',
      )).toEqual({
        outcome: 'failure',
        message: 'Card verification failed. Please try again.',
      });
    });

    it('returns null for unrelated URLs', () => {
      expect(getLegacyEnrollmentCallbackResult(
        'https://example.com/dashboard',
      )).toBeNull();
    });

    it('returns null for a partial match that lacks the full path', () => {
      expect(getLegacyEnrollmentCallbackResult(
        'https://example.com/merchants/m1/cko/success',
      )).toBeNull();
    });
  });
});
