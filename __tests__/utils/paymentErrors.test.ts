import { getPaymentErrorMessage, isPaymentMethodMismatchError } from '@/utils/paymentErrors';
import { describe, expect, it } from '@jest/globals';

describe('isPaymentMethodMismatchError', () => {
  it('detects mismatch by numeric error code 30021', () => {
    expect(isPaymentMethodMismatchError({ data: { code: '30021' } })).toBe(true);
    expect(isPaymentMethodMismatchError({ data: { errorCode: '30021' } })).toBe(true);
  });

  it('detects mismatch by string error code', () => {
    expect(isPaymentMethodMismatchError({ data: { code: 'PAYMENT_METHOD_MISMATCH' } })).toBe(true);
    expect(isPaymentMethodMismatchError({ data: { code: 'payment_method_mismatch' } })).toBe(true);
  });

  it('detects mismatch in error message', () => {
    expect(isPaymentMethodMismatchError({
      data: { message: 'Transaction failed: PAYMENT_METHOD_MISMATCH detected' },
    })).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isPaymentMethodMismatchError({ data: { code: '500' } })).toBe(false);
    expect(isPaymentMethodMismatchError({ data: { message: 'Server error' } })).toBe(false);
  });

  it('returns false for non-object errors', () => {
    expect(isPaymentMethodMismatchError(null)).toBe(false);
    expect(isPaymentMethodMismatchError('string')).toBe(false);
    expect(isPaymentMethodMismatchError(undefined)).toBe(false);
  });
});

describe('getPaymentErrorMessage', () => {
  it('returns mismatch message for mismatch errors', () => {
    const result = getPaymentErrorMessage({ data: { code: '30021' } });
    expect(result).toContain('different payment processor');
  });

  it('extracts message from error data', () => {
    expect(getPaymentErrorMessage({ data: { message: 'Card declined' } })).toBe('Card declined');
  });

  it('extracts error field when message is missing', () => {
    expect(getPaymentErrorMessage({ data: { error: 'Insufficient funds' } })).toBe('Insufficient funds');
  });

  it('returns fallback when no message is available', () => {
    expect(getPaymentErrorMessage({ data: {} })).toBe('Failed to submit payment. Please try again.');
  });

  it('uses custom fallback message', () => {
    expect(getPaymentErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});
