import { describe, expect, it } from '@jest/globals';
import { parsePaymentResultCallbackUrl } from '@/utils/paymentResultCallback';

const BASE = 'personaldashboardmob://mobile/payment-result';

describe('parsePaymentResultCallbackUrl', () => {
  it('parses a QR Ph success deep link with its references', () => {
    expect(parsePaymentResultCallbackUrl(
      `${BASE}?provider=qrph&outcome=success&transactionReferenceId=txn_1&invoiceReferenceId=inv_1&message=Returning`,
    )).toEqual({
      provider: 'qrph',
      outcome: 'success',
      transactionReferenceId: 'txn_1',
      invoiceReferenceId: 'inv_1',
    });
  });

  it('parses a PayPal cancel deep link', () => {
    expect(parsePaymentResultCallbackUrl(`${BASE}?provider=paypal&outcome=cancelled&transactionReferenceId=txn_2`))
      .toEqual({ provider: 'paypal', outcome: 'cancelled', transactionReferenceId: 'txn_2' });
  });

  it('treats unknown outcomes as errors', () => {
    expect(parsePaymentResultCallbackUrl(`${BASE}?provider=qrph&outcome=weird`)?.outcome).toBe('error');
  });

  it('ignores unsupported providers and other deep links', () => {
    expect(parsePaymentResultCallbackUrl(`${BASE}?provider=stripe&outcome=success`)).toBeNull();
    expect(parsePaymentResultCallbackUrl('personaldashboardmob://mobile/direct-debit-result?outcome=success')).toBeNull();
    expect(parsePaymentResultCallbackUrl('personaldashboardmob://reset-password?token=a&code=b')).toBeNull();
    expect(parsePaymentResultCallbackUrl('')).toBeNull();
  });
});
