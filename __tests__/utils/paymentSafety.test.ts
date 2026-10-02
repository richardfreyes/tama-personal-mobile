import { clearPaymentIntentKey, clearPaymentIntentKeys, getPaymentIntentKey } from '@/utils/paymentIntentKey';
import { isConfirmedPaymentStatus, isFailedPaymentStatus, isProcessingPaymentStatus } from '@/utils/paymentStatus';

let mockNextKey = 0;
jest.mock('expo-crypto', () => ({ randomUUID: () => `intent-key-${++mockNextKey}` }));

describe('payment safety helpers', () => {
  beforeEach(() => {
    mockNextKey = 0;
    clearPaymentIntentKeys();
  });

  it('reuses a key for retries of the same intent but not for another payment', () => {
    const first = getPaymentIntentKey('bill', 'bill-1');
    expect(getPaymentIntentKey('bill', 'bill-1')).toBe(first);
    expect(getPaymentIntentKey('bill', 'bill-2')).not.toBe(first);
    expect(getPaymentIntentKey('enrollment', 'bill-1')).not.toBe(first);
    clearPaymentIntentKey('bill', 'bill-1');
    expect(getPaymentIntentKey('bill', 'bill-1')).not.toBe(first);
    clearPaymentIntentKeys();
    expect(getPaymentIntentKey('bill', 'bill-1')).not.toBe(first);
  });

  it('only confirms settled or completed payment statuses', () => {
    for (const status of ['successful', 'DONE', 'settled', 'captured', 'paid']) {
      expect(isConfirmedPaymentStatus(status)).toBe(true);
    }
    for (const status of [null, undefined, 'pending', 'processing', 'failed', 'cancelled']) {
      expect(isConfirmedPaymentStatus(status)).toBe(false);
    }
  });

  it('treats an accepted but unfinished payment as processing', () => {
    for (const status of [null, undefined, 'pending', 'uncaptured', 'processing']) {
      expect(isProcessingPaymentStatus(status)).toBe(true);
      expect(isFailedPaymentStatus(status)).toBe(false);
    }
    expect(isProcessingPaymentStatus('successful')).toBe(false);
    expect(isFailedPaymentStatus('failed')).toBe(true);
    expect(isProcessingPaymentStatus('cancelled')).toBe(false);
  });
});
