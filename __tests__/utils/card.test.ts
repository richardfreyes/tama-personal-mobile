import type { PaymentMethod } from '@/redux/features/paymentMethods/paymentMethodTypes';
import { detectCardProvider, formatLastFourDigits, getCardIcon, getProviderDisplay, getSavedPaymentMethods } from '@/utils/card';
import { describe, expect, it } from '@jest/globals';

describe('detectCardProvider', () => {
  it('detects Visa cards', () => {
    expect(detectCardProvider('4111111111111111')).toBe('visa');
    expect(detectCardProvider('4 242 4242 4242 4242')).toBe('visa');
  });

  it('detects Mastercard cards', () => {
    expect(detectCardProvider('5500000000000004')).toBe('mastercard');
    expect(detectCardProvider('5100000000000000')).toBe('mastercard');
  });

  it('detects Amex cards', () => {
    expect(detectCardProvider('340000000000009')).toBe('amex');
    expect(detectCardProvider('370000000000000')).toBe('amex');
  });

  it('detects Discover cards', () => {
    expect(detectCardProvider('6011000000000004')).toBe('discover');
    expect(detectCardProvider('6500000000000002')).toBe('discover');
  });

  it('returns unknown for unrecognized patterns', () => {
    expect(detectCardProvider('0000000000000000')).toBe('unknown');
  });
});

describe('getCardIcon', () => {
  it('returns an icon object for known providers', () => {
    expect(getCardIcon('visa')).toEqual({ uri: 'SvgMock' });
    expect(getCardIcon('mastercard')).toEqual({ uri: 'SvgMock' });
    expect(getCardIcon('amex')).toEqual({ uri: 'SvgMock' });
    expect(getCardIcon('gcash')).toEqual({ uri: 'SvgMock' });
  });

  it('returns default credit card icon for null or undefined', () => {
    expect(getCardIcon(null)).toEqual({ uri: 'SvgMock' });
    expect(getCardIcon(undefined)).toEqual({ uri: 'SvgMock' });
  });

  it('normalizes provider names with mixed case and special chars', () => {
    expect(getCardIcon('American Express')).toEqual({ uri: 'SvgMock' });
    expect(getCardIcon('VISA')).toEqual({ uri: 'SvgMock' });
  });
});

describe('getProviderDisplay', () => {
  it('capitalizes first letter', () => {
    expect(getProviderDisplay('visa')).toBe('Visa');
    expect(getProviderDisplay('MASTERCARD')).toBe('Mastercard');
  });

  it('returns Card for null, undefined, or empty string', () => {
    expect(getProviderDisplay(null)).toBe('Card');
    expect(getProviderDisplay(undefined)).toBe('Card');
    expect(getProviderDisplay('')).toBe('Card');
    expect(getProviderDisplay('  ')).toBe('Card');
  });
});

describe('formatLastFourDigits', () => {
  it('returns the last four digits', () => {
    expect(formatLastFourDigits('1234')).toBe('1234');
  });

  it('returns dashes for null, undefined, or empty', () => {
    expect(formatLastFourDigits(null)).toBe('----');
    expect(formatLastFourDigits(undefined)).toBe('----');
    expect(formatLastFourDigits('')).toBe('----');
    expect(formatLastFourDigits('  ')).toBe('----');
  });
});

describe('getSavedPaymentMethods', () => {
  const method = (referenceId: string, paymentMethodName: string) => ({ referenceId, paymentMethodName }) as PaymentMethod;

  it('keeps saved cards and drops linked bank accounts used for direct debit', () => {
    const methods = getSavedPaymentMethods([
      method('card-1', 'card'),
      method('bank-1', 'directdebit'),
      method('card-2', 'card'),
    ]);

    expect(methods.map(({ referenceId }) => referenceId)).toEqual(['card-1', 'card-2']);
  });

  it('matches the direct debit name whatever its casing', () => {
    expect(getSavedPaymentMethods([method('bank-1', 'DirectDebit'), method('bank-2', 'DIRECTDEBIT')])).toEqual([]);
  });

  it('lists a card once when the API returns it more than once', () => {
    const methods = getSavedPaymentMethods([method('card-1', 'card'), method('card-1', 'card'), method('card-2', 'card')]);

    expect(methods.map(({ referenceId }) => referenceId)).toEqual(['card-1', 'card-2']);
  });

  it('copes with methods that are missing a name or have not loaded', () => {
    const unnamed = { referenceId: 'card-1' } as PaymentMethod;

    expect(getSavedPaymentMethods([unnamed])).toEqual([unnamed]);
    expect(getSavedPaymentMethods(undefined)).toEqual([]);
    expect(getSavedPaymentMethods(null)).toEqual([]);
  });
});
