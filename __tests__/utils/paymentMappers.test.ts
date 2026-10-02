import { COMMON } from '@/constants/common';
import type { MerchantEnrollmentDetailResponse } from '@/redux/features/merchants/merchantTypes';
import { buildEnrollmentPaymentDetails, buildScheduledPaymentInfo } from '@/utils/paymentMappers';
import { describe, expect, it } from '@jest/globals';

const getRowValue = (
  transaction: MerchantEnrollmentDetailResponse,
  label: string,
): string | undefined => (
  buildEnrollmentPaymentDetails(transaction).find((row) => row.label === label)?.value
);

describe('scheduled payment presentation', () => {
  it('derives the inclusive final payment month from startDate and monthSpan', () => {
    const schedule = buildScheduledPaymentInfo({
      currency: 'PHP',
      monthlyAmount: 12_500,
      months: 12,
      startDate: '2026-08-15',
    });

    expect(schedule?.rows).toContainEqual({
      label: 'Duration',
      value: 'August 15, 2026 to July 15, 2027',
    });
  });
});

describe('enrollment confirmation payment details', () => {
  it('uses nested bill amount and currency', () => {
    const transaction: MerchantEnrollmentDetailResponse = {
      bill: { amount: 1_250, currency: 'USD' },
      enrollmentMonths: 2,
    };

    expect(getRowValue(transaction, 'Amount Due')).toBe('USD 1,250.00');
    expect(getRowValue(transaction, 'Amount in USD')).toBe('USD 2,500.00');
    expect(getRowValue(transaction, 'Total Amount')).toBe('USD 2,500.00');
  });

  it('falls back to flat base amount and currency', () => {
    const transaction: MerchantEnrollmentDetailResponse = {
      baseAmount: 13_000,
      baseCurrency: 'PHP',
      enrollmentMonths: 12,
    };

    expect(getRowValue(transaction, 'Amount Due')).toBe('PHP 13,000.00');
    expect(getRowValue(transaction, 'Amount in PHP')).toBe('PHP 156,000.00');
    expect(getRowValue(transaction, 'Total Amount')).toBe('PHP 156,000.00');
  });

  it('prefers nested bill values when both response shapes are present', () => {
    const transaction: MerchantEnrollmentDetailResponse = {
      bill: { amount: 100, currency: 'USD' },
      baseAmount: 999,
      baseCurrency: 'PHP',
      enrollmentMonths: 2,
    };

    expect(getRowValue(transaction, 'Amount Due')).toBe('USD 100.00');
    expect(getRowValue(transaction, 'Total Amount')).toBe('USD 200.00');
  });

  it('preserves a nested zero amount instead of falling back to the flat amount', () => {
    const transaction: MerchantEnrollmentDetailResponse = {
      bill: { amount: 0, currency: 'USD' },
      baseAmount: 999,
      baseCurrency: 'PHP',
      enrollmentMonths: 2,
    };

    expect(getRowValue(transaction, 'Amount Due')).toBe('USD 0.00');
    expect(getRowValue(transaction, 'Total Amount')).toBe('USD 0.00');
  });

  it('falls back to zero when the amount is missing', () => {
    const transaction: MerchantEnrollmentDetailResponse = {
      baseCurrency: 'USD',
      enrollmentMonths: 12,
    };

    expect(getRowValue(transaction, 'Amount Due')).toBe('USD 0.00');
    expect(getRowValue(transaction, 'Total Amount')).toBe('USD 0.00');
  });

  it('falls back to the default currency when currency is missing', () => {
    const transaction: MerchantEnrollmentDetailResponse = {
      baseAmount: 500,
      enrollmentMonths: 1,
    };

    expect(getRowValue(transaction, 'Amount Due')).toBe(`${COMMON.DEFAULT_CURRENCY} 500.00`);
    expect(getRowValue(transaction, 'Total Amount')).toBe(`${COMMON.DEFAULT_CURRENCY} 500.00`);
  });

  it('calculates the total for multiple months plus the transaction fee', () => {
    const transaction: MerchantEnrollmentDetailResponse = {
      baseAmount: 1_000,
      baseCurrency: 'PHP',
      enrollmentMonths: 3,
      fields: [
        { name: 'lastAmount', text: 'Transaction Fee', value: '125.50' },
      ],
    };

    expect(getRowValue(transaction, 'Total Amount')).toBe('PHP 3,125.50');
  });
});
