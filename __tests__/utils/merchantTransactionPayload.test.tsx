import { MerchantFormField } from '@/redux/features/merchants/merchantTypes';
import { buildDynamicPayloadFields, buildMerchantTransactionPayload, normalizeProjectForPayload, } from '@/utils/merchantTransactionPayload';
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

describe('merchantTransactionPayload utils', () => {
  describe('normalizeProjectForPayload', () => {
    it('returns null when project is missing', () => {
      expect(normalizeProjectForPayload(null)).toBeNull();
      expect(normalizeProjectForPayload(undefined)).toBeNull();
    });

    it('returns null when project contains empty strings', () => {
      expect(normalizeProjectForPayload({
        name: '',
        projectId: '',
        category: '',
      })).toBeNull();
    });

    it('returns null when any required project field is empty after trim', () => {
      expect(normalizeProjectForPayload({
        name: 'Alpha Project',
        projectId: '  ',
        category: 'Residential',
      })).toBeNull();
    });

    it('returns normalized project when all required fields are valid', () => {
      expect(normalizeProjectForPayload({
        name: ' Alpha Project ',
        projectId: ' 123 ',
        category: ' Condo ',
      })).toEqual({
        name: 'Alpha Project',
        projectId: '123',
        category: 'Condo',
      });
    });
  });

  describe('buildDynamicPayloadFields', () => {
    const payloadFieldExcludedKeys = new Set(['projectName', 'projectId', 'projectCategory', 'paymentType']);

    it('keeps optional fields and uses null for empty values', () => {
      const fields = buildDynamicPayloadFields({
        formData: {
          paymentOption: 'Monthly',
          month: '',
          guestMobileNo: '',
          guestMobileNo_callingCode: '+63',
          guestMobileNo_countryCode: 'PH',
        },
        inputFields: [
          createField({ key: 'paymentOption', label: 'Payment Option', isRequired: true, fieldType: 'lookup' }),
          createField({ key: 'month', label: 'Month', isRequired: false, fieldType: 'lookup' }),
          createField({ key: 'guestMobileNo', label: "Guests's Contact Number", isRequired: false, fieldType: 'tel' }),
        ],
        payloadFieldExcludedKeys,
      });

      expect(fields).toEqual([
        { name: 'paymentOption', text: 'Payment Option', value: 'Monthly' },
        { name: 'month', text: 'Month', value: null },
        {
          name: 'guestMobileNo',
          text: "Guests's Contact Number",
          value: null,
          countryPrefix: '63',
          countryIso2: 'ph',
        },
      ]);
    });

    it('uses null for required empty fields', () => {
      const fields = buildDynamicPayloadFields({
        formData: {
          requiredField: '',
        },
        inputFields: [
          createField({ key: 'requiredField', label: 'Required Field', isRequired: true, fieldType: 'text' }),
        ],
        payloadFieldExcludedKeys: new Set(),
      });

      expect(fields).toEqual([
        { name: 'requiredField', text: 'Required Field', value: null },
      ]);
    });

    it('normalizes formatted currency field values before payload assembly', () => {
      const fields = buildDynamicPayloadFields({
        formData: {
          reservationFee: '1,234,567.50',
        },
        inputFields: [
          createField({ key: 'reservationFee', label: 'Reservation Fee', isRequired: true, fieldType: 'currency' }),
        ],
        payloadFieldExcludedKeys: new Set(),
      });

      expect(fields).toEqual([
        { name: 'reservationFee', text: 'Reservation Fee', value: '1234567.50' },
      ]);
    });
  });

  describe('buildMerchantTransactionPayload', () => {
    it('builds payload with null project for one-time payment submission when project is invalid', () => {
      const payload = buildMerchantTransactionPayload({
        merchantId: 'alphalandbalesin',
        paymentType: 'AF',
        project: {
          name: '',
          projectId: '',
          category: '',
        },
        customer: {
          name: 'Richard Frey Reyes',
          email: 'richardfrey.reyes@gmail.com',
          mobile: '+639770884111',
          countryPrefix: '+63',
          countryIso2: 'PH',
        },
        bill: {
          amount: '10000.00',
          currency: 'PHP',
        },
        transactionType: 'payment',
        fields: [
          { name: 'month', text: 'Month', value: null },
          { name: 'paymentOption', text: 'Payment Option', value: 'Annually' },
        ],
      });

      expect(payload.project).toBeNull();
      expect(payload.fields).toEqual([
        { name: 'month', text: 'Month', value: null },
        { name: 'paymentOption', text: 'Payment Option', value: 'Annually' },
      ]);
      expect(payload.customer.countryPrefix).toBe('63');
      expect(payload.customer.countryIso2).toBe('ph');
    });

    it('builds payload with project object when project is valid', () => {
      const payload = buildMerchantTransactionPayload({
        merchantId: 'alphalandbalesin',
        paymentType: 'MBD',
        project: {
          name: 'Balesin Project',
          projectId: 'PRJ-100',
          category: 'Membership',
        },
        clientNotes: 'Test note',
        customer: {
          name: 'Customer Name',
          email: 'customer@email.com',
          mobile: '9770884111',
          countryPrefix: '63',
          countryIso2: 'ph',
        },
        bill: {
          amount: '10,000.00',
          currency: 'PHP',
        },
        transactionType: 'payment',
        fields: [],
      });

      expect(payload.project).toEqual({
        name: 'Balesin Project',
        projectId: 'PRJ-100',
        category: 'Membership',
      });
      expect(payload.bill.base.amount).toBe('10000.00');
      expect(payload.adminNotes).toBe('Test note');
    });
  });
});
