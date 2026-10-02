import { formatAmountEnrollments, formatCurrencyInput, formatMonetaryDisplayValue, getCurrencyInputSelection, normalizeCurrencyInput, parseCurrencyInput } from '@/utils/format';
import { describe, expect, it } from '@jest/globals';

describe('currency formatting utilities', () => {
  it('formats display values with comma separators while preserving decimals', () => {
    expect(formatCurrencyInput('1000')).toBe('1,000');
    expect(formatCurrencyInput('10000.50')).toBe('10,000.50');
    expect(formatCurrencyInput('1000000')).toBe('1,000,000');
    expect(formatCurrencyInput('1000.')).toBe('1,000.');
    expect(formatCurrencyInput('0')).toBe('0');
    expect(formatCurrencyInput('')).toBe('');
  });

  it('normalizes typed or pasted currency values', () => {
    expect(normalizeCurrencyInput('PHP 1,000,000.50')).toBe('1000000.50');
    expect(normalizeCurrencyInput('10,000.50abc')).toBe('10000.50');
    expect(normalizeCurrencyInput('1.2.3')).toBe('1.23');
    expect(normalizeCurrencyInput('.50')).toBe('0.50');
  });

  it('parses comma-formatted values for calculations and payloads', () => {
    expect(parseCurrencyInput('1,000,000.50')).toBe(1000000.5);
    expect(parseCurrencyInput('')).toBeNull();
  });

  it('normalizes enrollment payload amounts without comma separators', () => {
    expect(formatAmountEnrollments('1,000,000.50')).toBe('1000000.50');
    expect(formatAmountEnrollments('10000')).toBe('10000.00');
  });

  it('formats monetary display strings without changing non-money values', () => {
    expect(formatMonetaryDisplayValue('PHP 1000000.50', 'Total Amount')).toBe('PHP 1,000,000.50');
    expect(formatMonetaryDisplayValue('1000', 'Amount')).toBe('1,000');
    expect(formatMonetaryDisplayValue('1234', 'Reference ID')).toBe('1234');
  });

  it('maps currency input cursor positions after inserting separators', () => {
    expect(getCurrencyInputSelection({
      formattedValue: '1,000',
      nextText: '1000',
      previousFormattedValue: '100',
      previousSelection: { start: 3, end: 3 },
    })).toEqual({ start: 5, end: 5 });
  });

  it('keeps the cursor at the end when appending to a formatted value', () => {
    expect(getCurrencyInputSelection({
      formattedValue: '10,001',
      nextText: '1,0001',
      previousFormattedValue: '1,000',
      previousSelection: { start: 5, end: 5 },
    })).toEqual({ start: 6, end: 6 });
  });

  it('keeps middle insertions near the edited digit after separators move', () => {
    expect(getCurrencyInputSelection({
      formattedValue: '15,000',
      nextText: '1,5000',
      previousFormattedValue: '1,000',
      previousSelection: { start: 2, end: 2 },
    })).toEqual({ start: 2, end: 2 });
  });

  it('handles backspace and delete without jumping to the end', () => {
    expect(getCurrencyInputSelection({
      formattedValue: '100',
      nextText: '1,00',
      previousFormattedValue: '1,000',
      previousSelection: { start: 4, end: 4 },
      key: 'Backspace',
    })).toEqual({ start: 2, end: 2 });

    expect(getCurrencyInputSelection({
      formattedValue: '100',
      nextText: '1,00',
      previousFormattedValue: '1,000',
      previousSelection: { start: 3, end: 3 },
      key: 'Delete',
    })).toEqual({ start: 2, end: 2 });
  });

  it('handles highlighted text replacement and decimal paste', () => {
    expect(getCurrencyInputSelection({
      formattedValue: '129',
      nextText: '12,9',
      previousFormattedValue: '12,345',
      previousSelection: { start: 3, end: 6 },
    })).toEqual({ start: 3, end: 3 });

    expect(getCurrencyInputSelection({
      formattedValue: '1,000.50',
      nextText: '1,000.50',
      previousFormattedValue: '1,000',
      previousSelection: { start: 5, end: 5 },
    })).toEqual({ start: 8, end: 8 });
  });
});
