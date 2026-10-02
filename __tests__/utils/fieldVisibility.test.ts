import { MerchantFormField } from '@/redux/features/merchants/merchantTypes';
import { evaluateFieldVisibility, evaluateVisibilityNode, extractFieldValue, flattenFields, resolveVisibilityState, sortFieldsByDisplayOrder } from '@/utils/fieldVisibility';
import { describe, expect, it } from '@jest/globals';

const createField = (overrides: Partial<MerchantFormField>): MerchantFormField => ({
  fieldType: 'text',
  fields: null,
  isAutoComplete: false,
  isRequired: false,
  key: 'defaultKey',
  label: 'Default Label',
  lookupReference: null,
  maxLength: 255,
  minLength: 0,
  pattern: null,
  placeholder: '',
  visibility: null,
  ...overrides,
});

const paymentFields: MerchantFormField[] = [
  createField({
    key: 'paymentType',
    label: 'Payment Type',
    fieldType: 'lookup',
    isRequired: true,
  }),
  createField({
    key: 'paymentOption',
    label: 'Payment Option',
    fieldType: 'lookup',
    isRequired: true,
    visibility: [{ lhs: 'paymentType', operator: 'equals', rhs: 'MBD' }],
  }),
  createField({
    key: 'month',
    label: 'Month',
    fieldType: 'lookup',
    isRequired: true,
    visibility: [{ lhs: 'paymentOption', operator: 'in', rhs: ['Monthly', 'Past Due'] }],
  }),
  createField({
    key: 'paymentYear',
    label: 'Year',
    fieldType: 'lookup',
    isRequired: true,
    visibility: [{ lhs: 'paymentOption', operator: 'in', rhs: ['Monthly', 'Past Due'] }],
  }),
  createField({
    key: 'paymentOthers',
    label: 'Please Specify',
    fieldType: 'text',
    isRequired: true,
    visibility: [{ lhs: 'paymentOption', operator: 'equals', rhs: 'Others' }],
  }),
];

describe('fieldVisibility utils', () => {
  it('flattens keyed row containers into their nested input fields', () => {
    const autoDebitRow = createField({
      fieldType: 'row',
      key: 'autoDebitDetails',
      fields: [
        createField({ key: 'startDate', fieldType: 'date' }),
        createField({ key: 'monthSpan', fieldType: 'number' }),
        createField({ key: 'amount', fieldType: 'currency' }),
      ],
    });

    expect(flattenFields([autoDebitRow]).map((field) => field.key)).toEqual([
      'startDate',
      'monthSpan',
      'amount',
    ]);
  });

  it('sorts the expected top-level and nested field sequence by displayOrder', () => {
    const fields = [
      createField({ key: 'terms', fieldType: 'checkbox', displayOrder: 9 }),
      createField({ key: 'customerName', displayOrder: 5 }),
      createField({ key: 'customerMobileNo', fieldType: 'tel', displayOrder: 7 }),
      createField({
        fieldType: 'row',
        key: 'autoDebitDetails',
        displayOrder: 4,
        fields: [
          createField({ key: 'amount', displayOrder: 3 }),
          createField({ key: 'startDate', displayOrder: 1 }),
          createField({ key: 'monthSpan', displayOrder: 2 }),
        ],
      }),
      createField({ key: 'unitNumber', displayOrder: 3 }),
      createField({ key: 'projectName', fieldType: 'lookup', displayOrder: 1 }),
      createField({ key: 'clientNotes', fieldType: 'longtext', displayOrder: 8 }),
      createField({ key: 'soNumber', displayOrder: 2 }),
      createField({ key: 'customerEmail', fieldType: 'email', displayOrder: 6 }),
    ];

    const orderedFields = sortFieldsByDisplayOrder(fields);

    expect(orderedFields.map((field) => field.key)).toEqual([
      'projectName',
      'soNumber',
      'unitNumber',
      'autoDebitDetails',
      'customerName',
      'customerEmail',
      'customerMobileNo',
      'clientNotes',
      'terms',
    ]);
    expect(orderedFields[3].fields?.map((field) => field.key)).toEqual([
      'startDate',
      'monthSpan',
      'amount',
    ]);
  });

  it('applies a row visibility condition to all nested fields', () => {
    const autoDebitRow = createField({
      fieldType: 'row',
      key: 'autoDebitDetails',
      visibility: [{ lhs: 'enrollmentType', operator: 'equals', rhs: 'autoDebit' }],
      fields: [
        createField({ key: 'startDate', fieldType: 'date' }),
        createField({ key: 'monthSpan', fieldType: 'number' }),
      ],
    });

    expect(resolveVisibilityState([autoDebitRow], { enrollmentType: 'manual' }).visibleFieldKeys.size).toBe(0);
    expect(resolveVisibilityState([autoDebitRow], { enrollmentType: 'autoDebit' }).visibleFieldKeys).toEqual(
      new Set(['startDate', 'monthSpan'])
    );
  });

  it('starts dependent fields hidden on initial state', () => {
    const state = resolveVisibilityState(paymentFields, {});

    expect(state.visibleFieldKeys.has('paymentType')).toBe(true);
    expect(state.visibleFieldKeys.has('paymentOption')).toBe(false);
    expect(state.visibleFieldKeys.has('month')).toBe(false);
    expect(state.visibleFieldKeys.has('paymentYear')).toBe(false);
    expect(state.visibleFieldKeys.has('paymentOthers')).toBe(false);
  });

  it('shows dependent field after dropdown select and compares using object val', () => {
    const paymentOptionField = paymentFields.find((field) => field.key === 'paymentOption');

    expect(paymentOptionField).toBeDefined();
    expect(extractFieldValue({ text: 'Membership Billing', val: 'MBD' }, 'paymentType')).toBe('MBD');
    expect(evaluateFieldVisibility(paymentOptionField, { paymentType: { text: 'Membership Billing', val: 'MBD' } })).toBe(true);
  });

  it('hides and clears values when condition fails', () => {
    const state = resolveVisibilityState(paymentFields, {
      paymentType: 'AF',
      paymentOption: 'Monthly',
      paymentOptionCode: 'Monthly',
      month: 'January',
      paymentYear: '2026',
      paymentOthers: 'Custom payment',
    });

    expect(state.visibleFieldKeys.has('paymentOption')).toBe(false);
    expect(state.visibleFieldKeys.has('month')).toBe(false);
    expect(state.visibleFieldKeys.has('paymentYear')).toBe(false);
    expect(state.visibleFieldKeys.has('paymentOthers')).toBe(false);
    expect(state.sanitizedValues.paymentOption).toBeUndefined();
    expect(state.sanitizedValues.paymentOptionCode).toBeUndefined();
    expect(state.sanitizedValues.month).toBeUndefined();
    expect(state.sanitizedValues.paymentYear).toBeUndefined();
    expect(state.sanitizedValues.paymentOthers).toBeUndefined();
    expect(state.clearedKeys.has('paymentOption')).toBe(true);
    expect(state.clearedKeys.has('month')).toBe(true);
  });

  it('supports the in operator for both arrays and stringified arrays', () => {
    const values = { paymentOption: 'Past Due' };

    expect(evaluateVisibilityNode(
      { lhs: 'paymentOption', operator: 'in', rhs: ['Monthly', 'Past Due'] },
      values
    )).toBe(true);

    expect(evaluateVisibilityNode(
      { lhs: 'paymentOption', operator: 'in', rhs: "['Monthly', 'Past Due']" },
      values
    )).toBe(true);
  });

  it('supports cascading visibility dependencies', () => {
    const state = resolveVisibilityState(paymentFields, {
      paymentType: 'AF',
      paymentOption: 'Past Due',
      month: 'January',
      paymentYear: '2026',
    });

    expect(state.visibleFieldKeys.has('paymentType')).toBe(true);
    expect(state.visibleFieldKeys.has('paymentOption')).toBe(false);
    expect(state.visibleFieldKeys.has('month')).toBe(false);
    expect(state.visibleFieldKeys.has('paymentYear')).toBe(false);
    expect(state.sanitizedValues.paymentOption).toBeUndefined();
    expect(state.sanitizedValues.month).toBeUndefined();
    expect(state.sanitizedValues.paymentYear).toBeUndefined();
  });

  it('supports nested AND / OR visibility trees', () => {
    const nestedNode = {
      OR: [
        {
          AND: [
            { lhs: 'paymentType', operator: 'equals', rhs: 'MBD' },
            { lhs: 'paymentOption', operator: 'equals', rhs: 'Others' },
          ],
        },
        { lhs: 'paymentType', operator: 'equals', rhs: 'VA' },
      ],
    };

    expect(evaluateVisibilityNode(nestedNode, { paymentType: 'MBD', paymentOption: 'Others' })).toBe(true);
    expect(evaluateVisibilityNode(nestedNode, { paymentType: 'VA', paymentOption: 'Monthly' })).toBe(true);
    expect(evaluateVisibilityNode(nestedNode, { paymentType: 'MBD', paymentOption: 'Monthly' })).toBe(false);
  });
});
