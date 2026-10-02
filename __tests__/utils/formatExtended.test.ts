import { describe, expect, it } from '@jest/globals';
import {
  formatAmount,
  formatCurrencyAmount,
  formatCustomerMobile,
  formatEnrollmentAmount,
  formatExpiryDate,
  formatLineItemFee,
  formatMoney,
  formatWithSpaces,
  getFirstString,
  getSearchParam,
  isValidLineItemFee,
  maskCardNumber,
  normalizeMerchantFieldValue,
  normalizeName,
  removeCurrencySeparators,
  resolveDisplayValue,
} from '@/utils/format';

describe('removeCurrencySeparators', () => {
  it('strips commas from formatted numbers', () => {
    expect(removeCurrencySeparators('1,000,000.50')).toBe('1000000.50');
  });

  it('coerces null and undefined to empty string', () => {
    expect(removeCurrencySeparators(null)).toBe('');
    expect(removeCurrencySeparators(undefined)).toBe('');
  });

  it('converts numbers to strings', () => {
    expect(removeCurrencySeparators(1234)).toBe('1234');
  });
});

describe('formatCurrencyAmount', () => {
  it('formats with currency prefix and locale separators', () => {
    const result = formatCurrencyAmount('PHP', 1234567.89);
    expect(result).toContain('PHP');
    expect(result).toContain('1,234,567.89');
  });

  it('treats falsy amount as zero', () => {
    expect(formatCurrencyAmount('USD', 0)).toContain('0');
  });

  it('applies Intl options when provided', () => {
    const result = formatCurrencyAmount('PHP', 1000, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(result).toContain('1,000.00');
  });
});

describe('formatAmount', () => {
  it('prepends peso sign and formats the value', () => {
    expect(formatAmount('1000000')).toBe('₱1,000,000');
  });

  it('returns empty string for falsy input', () => {
    expect(formatAmount('')).toBe('');
  });
});

describe('formatMoney', () => {
  it('formats a [currency, amount] tuple with two decimal places', () => {
    expect(formatMoney(['PHP', 13000])).toContain('PHP');
    expect(formatMoney(['PHP', 13000])).toContain('13,000.00');
  });

  it('returns N/A for non-array input', () => {
    expect(formatMoney(undefined)).toBe('N/A');
  });
});

describe('getSearchParam', () => {
  it('returns the string directly', () => {
    expect(getSearchParam('hello')).toBe('hello');
  });

  it('returns the first element of an array', () => {
    expect(getSearchParam(['first', 'second'])).toBe('first');
  });

  it('returns empty string for undefined', () => {
    expect(getSearchParam(undefined)).toBe('');
  });

  it('returns empty string for an empty array', () => {
    expect(getSearchParam([])).toBe('');
  });
});

describe('getFirstString', () => {
  it('returns the first non-empty string', () => {
    expect(getFirstString(null, undefined, '', '  ', 'valid')).toBe('valid');
  });

  it('returns empty string when all values are falsy', () => {
    expect(getFirstString(null, undefined, 0, false)).toBe('');
  });

  it('skips whitespace-only strings', () => {
    expect(getFirstString('   ', 'real')).toBe('real');
  });
});

describe('formatEnrollmentAmount', () => {
  it('formats currency and amount with two decimals', () => {
    expect(formatEnrollmentAmount('PHP', 13000)).toContain('PHP');
    expect(formatEnrollmentAmount('PHP', 13000)).toContain('13,000.00');
  });

  it('returns N/A when currency or amount is missing', () => {
    expect(formatEnrollmentAmount(undefined, 1000)).toBe('N/A');
    expect(formatEnrollmentAmount('PHP', undefined)).toBe('N/A');
  });
});

describe('resolveDisplayValue', () => {
  it('returns the trimmed string value', () => {
    expect(resolveDisplayValue('  hello  ')).toBe('hello');
  });

  it('returns N/A for null, undefined, or empty string', () => {
    expect(resolveDisplayValue(null)).toBe('N/A');
    expect(resolveDisplayValue(undefined)).toBe('N/A');
    expect(resolveDisplayValue('   ')).toBe('N/A');
  });

  it('stringifies numbers', () => {
    expect(resolveDisplayValue(42)).toBe('42');
  });
});

describe('normalizeMerchantFieldValue', () => {
  it('returns strings as-is', () => {
    expect(normalizeMerchantFieldValue('hello')).toBe('hello');
  });

  it('converts numbers and booleans to strings', () => {
    expect(normalizeMerchantFieldValue(123)).toBe('123');
    expect(normalizeMerchantFieldValue(true)).toBe('true');
  });

  it('returns empty string for null and undefined', () => {
    expect(normalizeMerchantFieldValue(null)).toBe('');
    expect(normalizeMerchantFieldValue(undefined)).toBe('');
  });
});

describe('formatCustomerMobile', () => {
  it('prepends country code when number lacks a plus prefix', () => {
    expect(formatCustomerMobile('9170001234', '63')).toBe('+639170001234');
  });

  it('returns as-is when number already has a plus prefix', () => {
    expect(formatCustomerMobile('+639170001234', '63')).toBe('+639170001234');
  });

  it('returns empty string for empty input', () => {
    expect(formatCustomerMobile('', '63')).toBe('');
  });
});

describe('normalizeName', () => {
  it('trims and lowercases names', () => {
    expect(normalizeName('  Ada Lovelace  ')).toBe('ada lovelace');
  });

  it('returns empty string for null or undefined', () => {
    expect(normalizeName(null)).toBe('');
    expect(normalizeName(undefined)).toBe('');
  });
});

describe('isValidLineItemFee', () => {
  it('validates a proper [string, number] tuple', () => {
    expect(isValidLineItemFee(['PHP', 100])).toBe(true);
  });

  it('rejects undefined, wrong types, and wrong lengths', () => {
    expect(isValidLineItemFee(undefined)).toBe(false);
    expect(isValidLineItemFee([100, 'PHP'] as any)).toBe(false);
    expect(isValidLineItemFee(['PHP'] as any)).toBe(false);
  });
});

describe('formatLineItemFee', () => {
  it('formats a fee tuple with up to 4 decimal places', () => {
    const result = formatLineItemFee(['PHP', 1234.5678]);
    expect(result).toContain('PHP');
    expect(result).toContain('1,234.5678');
  });

  it('pads to at least 2 decimal places', () => {
    const result = formatLineItemFee(['USD', 50]);
    expect(result).toContain('50.00');
  });
});

describe('formatExpiryDate', () => {
  it('formats month and year from digits', () => {
    expect(formatExpiryDate('1225')).toBe('12/25');
  });

  it('returns just the month when year digits are missing', () => {
    expect(formatExpiryDate('12')).toBe('12');
  });

  it('strips non-digit characters', () => {
    expect(formatExpiryDate('12/25')).toBe('12/25');
  });
});

describe('maskCardNumber', () => {
  it('masks all but the last 5 digits and formats with spaces', () => {
    const result = maskCardNumber('4111111111111111');
    expect(result).toBe('**** **** ***1 1111');
  });

  it('handles short numbers without negative masking', () => {
    const result = maskCardNumber('12345');
    expect(result).toBe('1234 5');
  });
});

describe('formatWithSpaces', () => {
  it('inserts a space every 4 characters', () => {
    expect(formatWithSpaces('1234567890123456')).toBe('1234 5678 9012 3456');
  });

  it('handles strings shorter than 4 characters', () => {
    expect(formatWithSpaces('123')).toBe('123');
  });
});
