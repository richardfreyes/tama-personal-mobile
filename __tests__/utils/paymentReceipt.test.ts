import { describe, expect, it } from '@jest/globals';
import { buildCustomerDetails, buildReceiptDetails, extractReceiptAccessPayload, formatCurrencyAmount, getFirstString, getPaymentRedirectUrl, getReceiptReferenceId, getReferenceIdFromUrl, parseComputationResponse, } from '@/utils/paymentReceipt';

describe('paymentReceipt', () => {
  it('returns the first nonblank string', () => {
    expect(getFirstString(null, ' ', ' value ', 'later')).toBe('value');
    expect(getFirstString(null, 1)).toBe('');
  });

  it.each([
    ['https://example.test/path?referenceId=REF-1', 'REF-1'],
    ['https://example.test/path?reference_id=REF-2', 'REF-2'],
    ['https://example.test/receipt/REF%203', 'REF 3'],
    ['/receipt/REF%204', 'REF 4'],
    ['not-a-url?ref=REF-5', 'REF-5'],
    ['', ''],
  ])('extracts receipt references from %s', (url, expected) => {
    expect(getReferenceIdFromUrl(url)).toBe(expected);
  });

  it('normalizes redirect and receipt-reference aliases by priority', () => {
    expect(getPaymentRedirectUrl({ redirect_url: 'https://redirect' } as any)).toBe('https://redirect');
    expect(getReceiptReferenceId(
      { reference_id: 'payment-ref' } as any,
      { referenceId: 'transaction-ref' } as any,
      'https://example.test/?ref=url-ref',
    )).toBe('payment-ref');
    expect(getReceiptReferenceId(
      {} as any,
      { reference_id: 'transaction-ref' } as any,
      'https://example.test/?ref=url-ref',
    )).toBe('transaction-ref');
  });

  it('extracts flat and nested access keys with defaults', () => {
    expect(extractReceiptAccessPayload({
      data: {
        reference_id: 'REF',
        access_signature: 'SIG',
      },
    })).toEqual({
      referenceId: 'REF',
      receiptAccessSignature: 'SIG',
      receiptAccessType: 'view',
    });
    expect(extractReceiptAccessPayload({
      accesssignature: 'SIG',
      accesstype: 'download',
    }, 'FALLBACK')).toEqual({
      referenceId: 'FALLBACK',
      receiptAccessSignature: 'SIG',
      receiptAccessType: 'download',
    });
  });

  it.each([null, [], {}, { referenceId: 'REF' }, { accessSignature: 'SIG' }])(
    'rejects incomplete access payload %#',
    (value) => {
      expect(extractReceiptAccessPayload(value)).toBeNull();
    },
  );

  it('parses serialized computations and rejects malformed content', () => {
    expect(parseComputationResponse('{"totalAmount":10}')).toEqual({ totalAmount: 10 });
    expect(parseComputationResponse('')).toBeNull();
    expect(parseComputationResponse('{')).toBeNull();
  });

  it('formats finite currency amounts and uses a visible fallback otherwise', () => {
    expect(formatCurrencyAmount('PHP', 1234.5)).toContain('1,234.50');
    expect(formatCurrencyAmount(undefined, 10)).toBe('—');
    expect(formatCurrencyAmount('PHP', Number.NaN)).toBe('—');
  });

  it('builds receipt fields, sums fees, and preserves visible placeholders', () => {
    const details = buildReceiptDetails({
      transactionReferenceId: 'TRX-1',
      merchantName: 'Merchant',
      name: 'Ada',
      baseCurrency: 'PHP',
      baseAmount: 100,
      totalCurrency: 'PHP',
      totalAmount: 110,
      transactionDate: '2026-07-27T12:00:00Z',
      notes: '',
      items: [
        { feeAmount: 4, feeCurrency: 'PHP' },
        { feeAmount: 6, feeCurrency: 'PHP' },
      ],
    } as any);

    expect(details.transactionReference.value).toBe('TRX-1');
    expect(details.fees.value).toContain('10.00');
    expect(details.notes.value).toBe('—');
    expect(details.paidDate.value).not.toBe('—');
  });

  it('uses transaction billing details, removes duplicate labels, and supports fallbacks', () => {
    expect(buildCustomerDetails({
      billingDetails: {
        name: { text: 'Name', value: 'Ada' },
        duplicate: { text: ' name ', value: 'Ignored' },
      },
    } as any)).toEqual({
      'billing-name': { text: 'Name', value: 'Ada' },
    });

    expect(buildCustomerDetails({} as any, {
      email: { text: 'Email', value: 'ada@example.com' },
    })).toEqual({
      'billing-email': { text: 'Email', value: 'ada@example.com' },
    });
  });
});
