import { describe, expect, it } from '@jest/globals';
import { getNativeIntentPath } from '@/utils/nativeIntent';

describe('getNativeIntentPath', () => {
  it('maps a QR Ph payment-result deep link to the payment-result route', () => {
    expect(getNativeIntentPath(
      'personaldashboardmob://mobile/payment-result?provider=qrph&outcome=success&transactionReferenceId=txn_1&invoiceReferenceId=inv_1',
    )).toBe('/payment-methods/payment-result?provider=qrph&outcome=success&transactionReferenceId=txn_1&invoiceReferenceId=inv_1');
  });

  it('maps a PayPal cancel deep link and omits missing references', () => {
    expect(getNativeIntentPath('personaldashboardmob://mobile/payment-result?provider=paypal&outcome=cancelled'))
      .toBe('/payment-methods/payment-result?provider=paypal&outcome=cancelled');
  });

  it('maps a bare path as well as a full URL', () => {
    expect(getNativeIntentPath('/mobile/payment-result?provider=qrph&outcome=error'))
      .toBe('/payment-methods/payment-result?provider=qrph&outcome=error');
  });

  it('maps a direct-debit-result deep link', () => {
    expect(getNativeIntentPath('personaldashboardmob://mobile/direct-debit-result?outcome=cancelled'))
      .toBe('/payment-methods/direct-debit-result?outcome=cancelled');
  });

  it('leaves unrelated and unsupported links unchanged', () => {
    const resetLink = 'personaldashboardmob://reset-password?token=a&code=b';
    expect(getNativeIntentPath(resetLink)).toBe(resetLink);
    expect(getNativeIntentPath('/dashboard')).toBe('/dashboard');
    const unsupported = 'personaldashboardmob://mobile/payment-result?provider=stripe&outcome=success';
    expect(getNativeIntentPath(unsupported)).toBe(unsupported);
  });
});
