import { thousandSeparator } from '@/utils/number';
import { describe, expect, it } from '@jest/globals';

describe('thousandSeparator', () => {
  it('formats numbers with comma separators', () => {
    expect(thousandSeparator(1000)).toBe('1,000');
    expect(thousandSeparator(1000000)).toBe('1,000,000');
  });

  it('accepts string values', () => {
    expect(thousandSeparator('1000')).toBe('1,000');
    expect(thousandSeparator('1,000,000')).toBe('1,000,000');
  });

  it('applies decimal places when specified', () => {
    expect(thousandSeparator(1000, 2)).toBe('1,000.00');
    expect(thousandSeparator(1234.5, 2)).toBe('1,234.50');
  });

  it('returns zero for empty or non-numeric strings', () => {
    expect(thousandSeparator('')).toBe('0');
    expect(thousandSeparator(0)).toBe('0');
  });

  it('handles values below 1000 without separators', () => {
    expect(thousandSeparator(999)).toBe('999');
    expect(thousandSeparator(1)).toBe('1');
  });
});
