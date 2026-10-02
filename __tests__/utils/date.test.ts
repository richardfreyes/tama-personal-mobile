import { formatApiDate, formatDateDisplay, formatDateForStorage, getStartOfDay, parseDateValue } from '@/utils/date';
import { describe, expect, it } from '@jest/globals';

describe('formatApiDate', () => {
  it('formats an ISO date string with the given format', () => {
    expect(formatApiDate('2026-03-15T10:00:00Z', 'MMMM dd, yyyy')).toBe('March 15, 2026');
    expect(formatApiDate('2026-01-01', 'yyyy-MM-dd')).toBe('2026-01-01');
  });

  it('returns empty string for null or undefined', () => {
    expect(formatApiDate(null, 'yyyy-MM-dd')).toBe('');
    expect(formatApiDate(undefined, 'yyyy-MM-dd')).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(formatApiDate('', 'yyyy-MM-dd')).toBe('');
  });

  it('returns original string for unparseable dates', () => {
    expect(formatApiDate('not-a-date', 'yyyy-MM-dd')).toBe('not-a-date');
  });
});

describe('getStartOfDay', () => {
  it('returns the timestamp at midnight for a given date string', () => {
    const result = getStartOfDay('2026-07-15');
    const date = new Date(result);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getMilliseconds()).toBe(0);
  });
});

describe('formatDateDisplay', () => {
  it('strips time portion from ISO strings', () => {
    expect(formatDateDisplay('2026-07-15T14:30:00Z')).toBe('2026-07-15');
  });

  it('returns the value as-is when there is no T separator', () => {
    expect(formatDateDisplay('2026-07-15')).toBe('2026-07-15');
  });

  it('returns empty string for undefined', () => {
    expect(formatDateDisplay(undefined)).toBe('');
    expect(formatDateDisplay('')).toBe('');
  });
});

describe('formatDateForStorage', () => {
  it('formats a Date object to yyyy-MM-dd', () => {
    const date = new Date(2026, 0, 5);
    expect(formatDateForStorage(date)).toBe('2026-01-05');
  });

  it('pads single-digit months and days', () => {
    const date = new Date(2026, 2, 3);
    expect(formatDateForStorage(date)).toBe('2026-03-03');
  });
});

describe('parseDateValue', () => {
  it('parses a valid date string into a Date', () => {
    const result = parseDateValue('2026-07-15');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2026);
  });

  it('returns undefined for undefined or empty input', () => {
    expect(parseDateValue(undefined)).toBeUndefined();
    expect(parseDateValue('')).toBeUndefined();
  });

  it('returns undefined for invalid date strings', () => {
    expect(parseDateValue('not-a-date')).toBeUndefined();
  });
});
