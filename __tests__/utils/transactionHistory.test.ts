import type { EnrollmentTransactionHistory, Transaction } from '@/types';
import { mergeCompletedTransactionIntoPage, mergeTransactions, normalizeEnrollmentTransaction, normalizeOneTimePaymentTransaction, sortTransactionsNewestFirst, transactionDetailToListTransaction, transactionMatchesSearch } from '@/utils/transactionHistory';
import { describe, expect, it } from '@jest/globals';

const oneTimePayment: Transaction = {
  externalTransactionId: 'payment-1',
  billingName: 'Electric Bill',
  invoiceReferenceId: 'invoice-1',
  merchantName: 'Electric Corp',
  customerName: 'Grace Hopper',
  baseAmount: 4000,
  baseCurrency: 'PHP',
  status: 'captured',
  createdAt: '2026-06-01T00:00:00Z',
};

const enrollment: EnrollmentTransactionHistory = {
  enrollmentTransactionId: 7,
  externalTransactionId: 'enrollment-7',
  enrollmentReferenceId: 'QW-E-7',
  enrollmentStatus: 'ONGOING',
  merchantId: 10,
  merchantCode: 'avida',
  merchantName: 'Avida Land',
  invoiceId: 107,
  invoiceReferenceId: null,
  paymentReferenceId: 'QW-P-7',
  paymentStatus: 'PAID',
  paymentStatusName: 'Paid',
  description: 'Monthly Amortization',
  customerName: 'Ada Lovelace',
  baseCurrency: 'PHP',
  baseAmount: 25000,
  convertedCurrency: null,
  convertedAmount: null,
  feeCurrency: 'PHP',
  feeAmount: 500,
  totalCurrency: 'PHP',
  totalAmount: 25500,
  processorCode: null,
  dueAt: null,
  submittedAt: null,
  paidAt: '2026-07-15T08:31:00+00:00',
  createdAt: '2026-07-01T00:00:00+00:00',
  updatedAt: '2026-07-15T08:31:00+00:00',
};

describe('transaction history normalization', () => {
  it('preserves one-time payment source values in the shared model', () => {
    expect(normalizeOneTimePaymentTransaction(oneTimePayment)).toMatchObject({
      source: 'oneTimePayment',
      typeLabel: 'One Time Payment',
      transactionId: oneTimePayment.externalTransactionId,
      detailReferenceId: oneTimePayment.invoiceReferenceId,
      billingName: oneTimePayment.billingName,
      customerName: oneTimePayment.customerName,
      merchantName: oneTimePayment.merchantName,
      amount: oneTimePayment.baseAmount,
      currency: oneTimePayment.baseCurrency,
      status: oneTimePayment.status,
      createdAt: oneTimePayment.createdAt,
    });
  });

  it('preserves enrollment source values and uses its immutable history ID for deduplication', () => {
    expect(normalizeEnrollmentTransaction(enrollment)).toMatchObject({
      key: 'enrollment:7',
      source: 'enrollment',
      typeLabel: 'Enrollment',
      transactionId: enrollment.externalTransactionId,
      detailReferenceId: enrollment.enrollmentReferenceId,
      enrollmentReferenceId: enrollment.enrollmentReferenceId,
      paymentReferenceId: enrollment.paymentReferenceId,
      billingName: enrollment.description,
      customerName: enrollment.customerName,
      merchantName: enrollment.merchantName,
      amount: enrollment.baseAmount,
      currency: enrollment.baseCurrency,
      status: enrollment.paymentStatus,
      statusLabel: enrollment.paymentStatusName,
      createdAt: enrollment.createdAt,
    });
  });

  it('deduplicates repeated pages without collapsing records from different sources', () => {
    const payment = normalizeOneTimePaymentTransaction(oneTimePayment);
    const repeatedPayment = normalizeOneTimePaymentTransaction({
      ...oneTimePayment,
      billingName: 'Updated Electric Bill',
    });
    const sameExternalIdEnrollment = normalizeEnrollmentTransaction({
      ...enrollment,
      externalTransactionId: oneTimePayment.externalTransactionId,
    });

    const merged = mergeTransactions(
      [payment],
      [repeatedPayment, sameExternalIdEnrollment],
    );

    expect(merged).toHaveLength(2);
    expect(merged.find(({ source }) => source === 'oneTimePayment')?.billingName)
      .toBe('Updated Electric Bill');
    expect(merged.find(({ source }) => source === 'enrollment')).toBeTruthy();
  });

  it('sorts newest to oldest and searches identifiers, names, customer, and type', () => {
    const payment = normalizeOneTimePaymentTransaction(oneTimePayment);
    const enrollmentTransaction = normalizeEnrollmentTransaction(enrollment);

    expect(sortTransactionsNewestFirst([payment, enrollmentTransaction]).map(({ key }) => key))
      .toEqual(['enrollment:7', 'oneTimePayment:payment-1']);
    expect(transactionMatchesSearch(enrollmentTransaction, 'Ada Lovelace')).toBe(true);
    expect(transactionMatchesSearch(enrollmentTransaction, 'QW-E-7')).toBe(true);
    expect(transactionMatchesSearch(enrollmentTransaction, 'Enrollment')).toBe(true);
    expect(transactionMatchesSearch(payment, 'Avida')).toBe(false);
  });

  it('matches an enrollment by its payment reference id shown as the detail Reference ID', () => {
    const enrollmentTransaction = normalizeEnrollmentTransaction(enrollment);

    // "QW-P-*" is the paymentReferenceId, distinct from the "QW-E-*" enrollment reference.
    expect(enrollmentTransaction.paymentReferenceId).toBe('QW-P-7');
    expect(transactionMatchesSearch(enrollmentTransaction, 'QW-P-7')).toBe(true);
    expect(transactionMatchesSearch(enrollmentTransaction, 'qw-p-7')).toBe(true);

    // One-time payments have no payment reference and must not match a payment-ref query.
    expect(normalizeOneTimePaymentTransaction(oneTimePayment).paymentReferenceId).toBeNull();
    expect(transactionMatchesSearch(normalizeOneTimePaymentTransaction(oneTimePayment), 'QW-P-7')).toBe(false);
  });

  it('carries the merchant logo url from both sources and defaults to null when absent', () => {
    expect(normalizeOneTimePaymentTransaction(oneTimePayment).merchantLogoUrl).toBeNull();
    expect(normalizeEnrollmentTransaction(enrollment).merchantLogoUrl).toBeNull();

    expect(
      normalizeOneTimePaymentTransaction({
        ...oneTimePayment,
        merchantLogoUrl: 'https://cdn.example.com/electric.png',
      }).merchantLogoUrl,
    ).toBe('https://cdn.example.com/electric.png');

    expect(
      normalizeEnrollmentTransaction({
        ...enrollment,
        merchantLogoUrl: 'https://cdn.example.com/avida.png',
      }).merchantLogoUrl,
    ).toBe('https://cdn.example.com/avida.png');
  });

  it('keeps two consecutive completed bill payments newest-first without duplicates', () => {
    const firstPayment = transactionDetailToListTransaction({
      baseAmount: 1232,
      baseCurrency: 'PHP',
      billingDetails: { customerName: { text: 'Customer', value: 'Ada Lovelace' } },
      billingName: 'May bill',
      externalTransactionId: 'payment-first',
      items: [],
      merchantName: 'Electric Corp',
      name: null,
      notes: null,
      paymentMethodNumber: '4242',
      paymentMethodProvider: 'visa',
      paymentMethodType: 'cc',
      paymentReferenceId: null,
      status: 'captured',
      totalAmount: 23.53,
      totalCurrency: 'USD',
      transactionDate: '2026-06-01T10:00:00Z',
      xrAmount: 1,
      xrBaseCurrency: 'PHP',
      xrTargetCurrency: 'PHP',
    }, 'invoice-first', 'https://cdn.example.com/electric.png');
    const secondPayment = {
      ...firstPayment,
      externalTransactionId: 'payment-second',
      // Multiple payments can share a bill/invoice reference. The backend
      // transaction ID is the authoritative identity in that case.
      invoiceReferenceId: 'invoice-first',
      billingName: 'June bill',
      createdAt: '2026-06-01T11:00:00Z',
    };
    const initialPage = {
      items: [oneTimePayment],
      totalCount: 1,
      currentPage: 1,
    };

    const afterFirstPayment = mergeCompletedTransactionIntoPage(initialPage, firstPayment, 10);
    const afterSecondPayment = mergeCompletedTransactionIntoPage(afterFirstPayment, secondPayment, 10);
    const afterDuplicateReceipt = mergeCompletedTransactionIntoPage(afterSecondPayment, secondPayment, 10);

    expect(afterFirstPayment.items[0]).toMatchObject({
      externalTransactionId: 'payment-first',
      invoiceReferenceId: 'invoice-first',
      customerName: 'Ada Lovelace',
      merchantLogoUrl: 'https://cdn.example.com/electric.png',
      baseAmount: 23.53,
      baseCurrency: 'USD',
    });
    expect(afterDuplicateReceipt.items.map(({ externalTransactionId }) => externalTransactionId))
      .toEqual(['payment-second', 'payment-first', 'payment-1']);
    expect(afterDuplicateReceipt.totalCount).toBe(3);
  });

  it('updates an existing transaction when its backend transaction ID matches', () => {
    const updatedPayment = {
      ...oneTimePayment,
      invoiceReferenceId: 'new-receipt-reference',
      status: 'failed',
    };
    const mergedPage = mergeCompletedTransactionIntoPage({
      items: [oneTimePayment],
      totalCount: 1,
      currentPage: 1,
    }, updatedPayment, 10);

    expect(mergedPage.items).toHaveLength(1);
    expect(mergedPage.items[0]).toMatchObject({
      externalTransactionId: 'payment-1',
      invoiceReferenceId: 'new-receipt-reference',
      status: 'failed',
    });
    expect(mergedPage.totalCount).toBe(1);
  });
});
