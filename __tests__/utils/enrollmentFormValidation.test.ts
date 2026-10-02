import { MerchantFormField } from '@/redux/features/merchants/merchantTypes';
import { flattenFields } from '@/utils/fieldVisibility';
import { parseEnrollmentAmount, removeHiddenKeys, validateEnrollmentField } from '@/utils/enrollmentFormValidation';
import { describe, expect, it } from '@jest/globals';

const createField = (overrides: Partial<MerchantFormField>): MerchantFormField => ({
  fieldType: 'text',
  fields: null,
  isAutoComplete: false,
  isRequired: false,
  key: 'defaultKey',
  label: 'Default Label',
  lookupReference: null,
  maxLength: 0,
  minLength: 0,
  pattern: null,
  placeholder: '',
  visibility: null,
  ...overrides,
});

describe('enrollment form validation', () => {
  const autoDebitFields = flattenFields([
    createField({
      fieldType: 'row',
      key: 'autoDebitDetails',
      fields: [
        createField({ key: 'startDate', label: 'Start Payment Date', fieldType: 'date', isRequired: true }),
        createField({ key: 'monthSpan', label: 'No. of Months to Pay', fieldType: 'number', isRequired: true, maxLength: 60 }),
        createField({ key: 'amount', label: 'Monthly Amount Due in PHP', fieldType: 'currency', isRequired: true }),
      ],
    }),
  ]);

  it('validates required nested row values from their leaf configuration', () => {
    expect(autoDebitFields.map((field) => validateEnrollmentField(field, ''))).toEqual([
      'Start Payment Date is required.',
      'No. of Months to Pay is required.',
      'Monthly Amount Due in PHP is required.',
    ]);
  });

  it('accepts valid Auto-Debit Schedule values', () => {
    const values: Record<string, string> = {
      startDate: '2026-08-15',
      monthSpan: '12',
      amount: '12,500.00',
    };

    expect(autoDebitFields.map((field) => validateEnrollmentField(field, values[field.key], {
      currency: 'PHP',
      minAmount: 1,
      maxAmount: 1_000_000,
    }))).toEqual([undefined, undefined, undefined]);
  });

  it('removes hidden values without cloning when no requested key exists', () => {
    const current = { visible: 'yes', hidden: 'remove' };
    expect(removeHiddenKeys(current, ['missing'])).toBe(current);
    const cleaned = removeHiddenKeys(current, ['missing', 'hidden']);
    expect(cleaned).toEqual({ visible: 'yes' });
    expect(cleaned).not.toBe(current);
    expect(current).toEqual({ visible: 'yes', hidden: 'remove' });
  });

  it('parses formatted currency and rejects non-currency values', () => {
    expect(parseEnrollmentAmount('12,345.67')).toBe(12345.67);
    expect(parseEnrollmentAmount('not an amount')).toBeNull();
  });

  it('validates required and optional checkboxes', () => {
    expect(validateEnrollmentField(createField({
      fieldType: 'checkbox',
      isRequired: true,
      label: 'Authorization',
    }), false)).toBe('Authorization is required.');
    expect(validateEnrollmentField(createField({
      fieldType: 'checkbox',
      isRequired: false,
    }), false)).toBeUndefined();
  });

  it.each([
    ['not-a-number', 'Please enter a valid month span.'],
    ['0', 'Please enter a valid month span.'],
    ['61', 'Month span must not exceed 60.'],
  ])('validates month span %s', (value, expected) => {
    expect(validateEnrollmentField(createField({
      fieldType: 'number',
      key: 'monthSpan',
      label: 'Month Span',
    }), value)).toBe(expected);
  });

  it('enforces currency parsing, minimums, and maximums', () => {
    const field = createField({ fieldType: 'currency', key: 'amount', label: 'Amount' });
    const currency = { currency: 'PHP', minAmount: 100, maxAmount: 1_000 };
    expect(validateEnrollmentField(field, 'abc', currency)).toBe('Please enter a valid amount.');
    expect(validateEnrollmentField(field, '99', currency)).toBe('Amount must be at least PHP 100.');
    expect(validateEnrollmentField(field, '1,001', currency)).toBe('Amount must not exceed PHP 1,000.');
    expect(validateEnrollmentField({ ...field, maxLength: 500 }, '501', currency)).toBe('Amount must not exceed PHP 500.');
  });

  it('enforces numeric positivity and configured maxima', () => {
    const field = createField({ fieldType: 'number', label: 'Quantity', maxLength: 10 });
    expect(validateEnrollmentField(field, 'invalid')).toBe('Please enter a valid quantity.');
    expect(validateEnrollmentField(field, '0')).toBe('Quantity must be greater than zero.');
    expect(validateEnrollmentField(field, '11')).toBe('Quantity must not exceed 10.');
  });

  it('enforces text length and regex format constraints', () => {
    const field = createField({ label: 'Account', minLength: 3, maxLength: 5 });
    expect(validateEnrollmentField(field, 'ab')).toBe('Account must be at least 3 characters.');
    expect(validateEnrollmentField(field, 'abcdef')).toBe('Account must not exceed 5 characters.');
    expect(validateEnrollmentField({ ...field, minLength: 0, maxLength: 0, pattern: '\\d+' }, 'ABC'))
      .toBe('Please enter a valid account.');
    expect(validateEnrollmentField({ ...field, minLength: 0, maxLength: 0, pattern: '[' }, 'ABC'))
      .toBeUndefined();
  });

  it('accepts empty optional text fields without applying downstream validation', () => {
    expect(validateEnrollmentField(createField({
      key: 'email',
      label: 'Email',
      isRequired: false,
    }), '   ')).toBeUndefined();
  });
});
