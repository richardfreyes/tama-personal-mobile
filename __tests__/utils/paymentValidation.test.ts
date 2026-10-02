import { COMMON } from '@/constants/common';
import { validatePaymentPreconditions } from '@/utils/paymentValidation';
import { describe, expect, it } from '@jest/globals';

describe('validatePaymentPreconditions', () => {
  const validInput = {
    merchantId: 'merchant-1',
    transactionId: 'txn-1',
    isPaymentMethodReady: true,
    hasAcceptedTerms: true,
  };

  it('returns null when all preconditions are met', () => {
    expect(validatePaymentPreconditions(validInput)).toBeNull();
  });

  it('rejects missing merchantId', () => {
    expect(validatePaymentPreconditions({ ...validInput, merchantId: '' })).toBe(COMMON.ERRORS.MISSING_DETAILS);
    expect(validatePaymentPreconditions({ ...validInput, merchantId: undefined })).toBe(COMMON.ERRORS.MISSING_DETAILS);
  });

  it('rejects missing transactionId', () => {
    expect(validatePaymentPreconditions({ ...validInput, transactionId: '' })).toBe(COMMON.ERRORS.MISSING_DETAILS);
  });

  it('rejects unready payment method', () => {
    expect(validatePaymentPreconditions({ ...validInput, isPaymentMethodReady: false })).toBe(COMMON.ERRORS.METHOD_NOT_READY);
  });

  it('rejects unaccepted terms', () => {
    expect(validatePaymentPreconditions({ ...validInput, hasAcceptedTerms: false })).toBe(COMMON.ERRORS.TERMS_NOT_ACCEPTED);
  });

  it('checks in priority order: details > method > terms', () => {
    expect(validatePaymentPreconditions({
      merchantId: '',
      transactionId: '',
      isPaymentMethodReady: false,
      hasAcceptedTerms: false,
    })).toBe(COMMON.ERRORS.MISSING_DETAILS);
  });
});
