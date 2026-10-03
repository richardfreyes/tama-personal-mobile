import { describe, expect, it } from '@jest/globals';
import type { Bill } from '@/redux/features/bills/billsTypes';
import type { Biller } from '@/redux/features/biller/billerTypes';
import {
  formatSavedBillAmount,
  getActiveSavedBillCount,
  getBillerLogoMap,
  getSavedBillAmount,
  getSavedBillCaption,
  getSavedBillInitials,
  getUniqueSavedBills,
  isActiveSavedBill,
} from '@/utils/savedBills';

const makeBill = (overrides: Partial<Bill> = {}): Bill => ({
  billing_id: 1,
  billing_name: 'Netflix',
  billing_reference_id: 'bill-1',
  billing_type: 'saved',
  client_notes: '',
  custom_fields: {
    amount: { text: 'Amount', value: '₱170' },
  },
  customer_id: 1,
  merchant_category_name: 'Entertainment',
  merchant_id: 1,
  merchant_name: 'Netflix International B.V.',
  payment_type_id: 1,
  project_id: 1,
  ...overrides,
});

describe('saved bills utilities', () => {
  it('deduplicates bills by reference and counts only active unpaid entries', () => {
    const active = makeBill();
    const duplicate = makeBill({ billing_id: 2 });
    const paid = makeBill({
      billing_id: 3,
      billing_reference_id: 'bill-3',
      payment_status: 'Paid',
    });
    const inactive = makeBill({
      billing_id: 4,
      billing_reference_id: 'bill-4',
      is_active: false,
    });

    expect(getUniqueSavedBills([active, duplicate, paid, inactive])).toHaveLength(3);
    expect(getActiveSavedBillCount([active, duplicate, paid, inactive])).toBe(1);
    expect(isActiveSavedBill(paid)).toBe(false);
  });

  it('formats initials for single and multi-word bill names', () => {
    expect(getSavedBillInitials('Netflix')).toBe('NE');
    expect(getSavedBillInitials('SSS Contribution')).toBe('SC');
    expect(getSavedBillInitials('')).toBe('SB');
  });

  it('derives amount and due captions from saved-bill fields', () => {
    const now = new Date('2026-07-31T08:00:00.000Z');
    const dueTomorrow = makeBill({ due_date: '2026-08-01T00:00:00.000Z' });
    const paid = makeBill({
      date_paid: '2026-07-15T00:00:00.000Z',
      payment_status: 'Paid',
    });

    expect(getSavedBillAmount(dueTomorrow)).toBe('₱170');
    expect(getSavedBillCaption(dueTomorrow, now)).toBe('Due tomorrow');
    expect(getSavedBillCaption(paid, now)).toBe('Paid Jul 15');
  });

  it('uses a useful payment status when the API has no due metadata', () => {
    expect(getSavedBillCaption(makeBill())).toBe('Ready to pay');
    expect(getSavedBillAmount(makeBill({ custom_fields: {} }))).toBe('—');
  });
});

describe('getBillerLogoMap', () => {
  const makeBiller = (merchant_id: number, merchant_logo_url: string): Biller => ({
    address_one: '',
    address_three: '',
    address_two: '',
    created_at: '',
    is_active: true,
    is_public: true,
    merchant_code: `m${merchant_id}`,
    merchant_id,
    merchant_logo_url,
    merchant_name: `Merchant ${merchant_id}`,
    merchant_status: 'active',
    merchant_timezone: 'Asia/Manila',
    updated_at: '',
  });

  it('maps merchant ids to their logos and skips billers without one', () => {
    const logos = getBillerLogoMap([
      makeBiller(1, 'https://example.com/one.png'),
      makeBiller(2, ''),
      makeBiller(3, 'https://example.com/three.png'),
    ]);

    expect(logos.get(1)).toBe('https://example.com/one.png');
    expect(logos.get(3)).toBe('https://example.com/three.png');
    expect(logos.has(2)).toBe(false);
    expect(logos.size).toBe(2);
  });

  it('returns an empty map before billers have loaded', () => {
    expect(getBillerLogoMap(undefined).size).toBe(0);
    expect(getBillerLogoMap(null).size).toBe(0);
    expect(getBillerLogoMap([]).size).toBe(0);
  });
});

describe('formatSavedBillAmount', () => {
  const withAmount = (value: string) => makeBill({ custom_fields: { amount: { text: 'Amount', value } } });

  it('shows peso amounts with a peso sign and two decimals', () => {
    expect(formatSavedBillAmount(withAmount('₱1,750'))).toBe('₱ 1,750.00');
    expect(formatSavedBillAmount(withAmount('PHP 1,750.5'))).toBe('₱ 1,750.50');
    expect(formatSavedBillAmount(withAmount('2500'))).toBe('₱ 2,500.00');
  });

  it('keeps foreign currencies as the bill reports them', () => {
    expect(formatSavedBillAmount(withAmount('USD 25.5'))).toBe('USD 25.5');
  });

  it('falls back to the no-amount label when the bill has no amount', () => {
    expect(formatSavedBillAmount(makeBill({ custom_fields: {} }))).toBe('No amount set');
  });
});
