import { describe, expect, it } from '@jest/globals';
import { getEnrollmentKey } from '@/utils/enrollment';
import type { Enrollment } from '@/types/enrollment';

describe('getEnrollmentKey', () => {
  it('prefers referenceId when present', () => {
    const enrollment: Enrollment = {
      referenceId: 'ENR-001',
      transactionId: 'TXN-001',
      externalTransactionId: 'EXT-001',
    };
    expect(getEnrollmentKey(enrollment)).toBe('ENR-001');
  });

  it('falls back to transactionId when referenceId is absent', () => {
    const enrollment: Enrollment = {
      referenceId: null,
      transactionId: 'TXN-001',
      externalTransactionId: 'EXT-001',
    };
    expect(getEnrollmentKey(enrollment)).toBe('TXN-001');
  });

  it('falls back to externalTransactionId when earlier fields are absent', () => {
    const enrollment: Enrollment = {
      referenceId: null,
      transactionId: null,
      externalTransactionId: 'EXT-001',
    };
    expect(getEnrollmentKey(enrollment)).toBe('EXT-001');
  });

  it('generates a positional fallback key when all ID fields are absent', () => {
    const enrollment: Enrollment = {};
    expect(getEnrollmentKey(enrollment)).toBe('enrollment-0');
    expect(getEnrollmentKey(enrollment, 5)).toBe('enrollment-5');
  });

  it('uses index 0 when index is omitted and no IDs exist', () => {
    expect(getEnrollmentKey({})).toBe('enrollment-0');
  });

  it('skips empty-string IDs in the fallback chain', () => {
    const enrollment: Enrollment = {
      referenceId: '',
      transactionId: '',
      externalTransactionId: 'EXT-VALID',
    };
    expect(getEnrollmentKey(enrollment)).toBe('EXT-VALID');
  });
});
