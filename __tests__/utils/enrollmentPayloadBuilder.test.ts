import { MerchantFormField } from '@/redux/features/merchants/merchantTypes';
import { flattenFields } from '@/utils/fieldVisibility';
import { buildEnrollmentFormPayloads } from '@/utils/enrollmentPayloadBuilder';
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

describe('enrollment payload builder', () => {
  it('submits nested schedule leaves through the generic enrollment payload mapping', () => {
    const inputFields = flattenFields([
      createField({
        fieldType: 'row',
        key: 'autoDebitDetails',
        fields: [
          createField({ key: 'startDate', label: 'Start Payment Date', fieldType: 'date', isRequired: true }),
          createField({ key: 'monthSpan', label: 'No. of Months to Pay', fieldType: 'number', isRequired: true }),
          createField({ key: 'amount', label: 'Monthly Amount Due in PHP', fieldType: 'currency', isRequired: true }),
        ],
      }),
    ]);

    const { enrollmentPayload } = buildEnrollmentFormPayloads({
      activeFormConfig: {
        currencies: [{ currency: 'PHP', minAmount: 1, maxAmount: 1_000_000 }],
        fields: [],
        hasScripts: null,
      },
      email: 'owner@example.com',
      firstName: 'Unit',
      lastName: 'Owner',
      formData: {
        startDate: '2026-08-15',
        monthSpan: '12',
        amount: '12,500.00',
        customerName: 'Unit Owner',
        customerEmail: 'owner@example.com',
      },
      inputFields,
      isEnrollmentSelected: true,
      merchantId: 'camella',
    });

    expect(enrollmentPayload.bill).toEqual({ amount: '12500.00', currency: 'PHP' });
    expect(enrollmentPayload.fields).toEqual([
      { name: 'startDate', text: 'Start Payment Date', value: '2026-08-15' },
      { name: 'monthSpan', text: 'No. of Months to Pay', value: '12' },
    ]);
    expect(enrollmentPayload.fields.some((field) => field.name === 'autoDebitDetails')).toBe(false);
    expect(enrollmentPayload.fields.some((field) => field.name === 'endDate')).toBe(false);
  });
});
