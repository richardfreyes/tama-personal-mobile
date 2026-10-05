import { describe, expect, it } from '@jest/globals';
import { buildAddCardRequestPayload, buildAddressPayload, buildEnrollmentCardPayload, formatPaymentMethodFieldValue, getNormalizedCardNumber, getPaymentOptionByTitle, getSavedBillingAddressFormValues, validatePaymentMethodForm, validatePaymentMethodInput, } from '@/utils/paymentMethodForm';

const validForm = {
  fullName: 'Ada Lovelace',
  cardNumber: '4111 1111 1111 1111',
  expiryDate: '12/40',
  securityCode: '123',
  streetAddress: '123 Main Street',
  country: 'PH',
  stateRegion: 'Metro Manila',
  city: 'Makati',
  postalCode: '1200',
  saveAsDefaultBilling: false,
  useAsPrimaryPayment: true,
  cardProvider: 'visa',
} as any;

describe('paymentMethodForm', () => {
  it('finds payment options and normalizes card numbers', () => {
    const options = [{ title: 'Credit Card' }, { title: 'Bank' }] as any;
    expect(getPaymentOptionByTitle('Bank', options)).toBe(options[1]);
    expect(getPaymentOptionByTitle('Missing', options)).toBeUndefined();
    expect(getNormalizedCardNumber('4111 1111')).toBe('41111111');
  });

  it('formats expiry and card input while preserving unrelated values', () => {
    expect(formatPaymentMethodFieldValue('expiryDate', '124099', 'unknown')).toEqual({
      cardProvider: 'unknown',
      value: '12/40',
    });
    expect(formatPaymentMethodFieldValue('cardNumber', '41111111111111119999', 'unknown')).toEqual({
      cardProvider: 'visa',
      value: '4111 1111 1111 1111',
    });
    expect(formatPaymentMethodFieldValue('city', 'Makati', 'visa')).toEqual({
      cardProvider: 'visa',
      value: 'Makati',
    });
  });

  it('hydrates saved billing values and falls back to empty strings', () => {
    expect(getSavedBillingAddressFormValues({
      customerAddress: 'Street',
      customerAddressCity: 'City',
      customerAddressState: 'State',
      customerAddressPostalCode: '1234',
      customerCountryIso2Code: 'PH',
    })).toEqual({
      streetAddress: 'Street',
      city: 'City',
      stateRegion: 'State',
      postalCode: '1234',
      country: 'PH',
    });
    expect(getSavedBillingAddressFormValues(null)).toEqual({
      streetAddress: '',
      city: '',
      stateRegion: '',
      postalCode: '',
      country: '',
    });
  });

  it('validates card-specific fields at completion thresholds', () => {
    expect(validatePaymentMethodInput('cardNumber', '1234567890123456789', validForm)).toBe('Invalid card number.');
    expect(validatePaymentMethodInput('cardNumber', '4111', validForm)).toBeUndefined();
    expect(validatePaymentMethodInput('expiryDate', '01/20', validForm)).toBe('Invalid or expired date.');
    expect(validatePaymentMethodInput('expiryDate', '1', validForm)).toBeUndefined();
    expect(validatePaymentMethodInput('securityCode', '12', validForm)).toBeUndefined();
    expect(validatePaymentMethodInput('securityCode', '999', { ...validForm, cardNumber: '378282246310005' })).toBeUndefined();
    expect(validatePaymentMethodInput('fullName', 'A', validForm)).toBe('Full Name is required.');
  });

  it('returns touched state and no errors for a valid form', () => {
    const result = validatePaymentMethodForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(Object.values(result.touched)).toEqual(Array(9).fill(true));
  });

  it('returns all meaningful errors for an invalid form', () => {
    const result = validatePaymentMethodForm({
      ...validForm,
      fullName: '',
      cardNumber: '123',
      expiryDate: '01/20',
      securityCode: '1',
      streetAddress: '',
      country: '',
      stateRegion: '',
      city: '',
      postalCode: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toMatchObject({
      fullName: 'Full Name is required.',
      cardNumber: 'Invalid card number.',
      expiryDate: 'Invalid expiration date.',
      securityCode: 'Invalid security code.',
      streetAddress: 'Street Address is required.',
      country: 'Country is required.',
      stateRegion: 'State/Region is required.',
      city: 'City is required.',
      postalCode: 'Postal Code is required.',
    });
  });

  it('builds enrollment, address, and saved-card API payloads', () => {
    expect(buildEnrollmentCardPayload({
      cardNumber: '4111111111111111',
      formData: validForm,
      user: {},
    })).toEqual({
      creditCardNumber: '4111111111111111',
      expiryDate: '12/40',
      cardSecurityCode: '123',
      cardholderName: 'Ada Lovelace',
      cardOrigin: 'PH',
      billingStreet: '123 Main Street',
      billingCity: 'Makati',
      billingState: 'Metro Manila',
      billingCountry: 'Philippines',
      billingCountryCode: 'PH',
      billingPostalCode: '1200',
    });

    expect(buildAddressPayload({
      firstName: 'Ada',
      lastName: 'Lovelace',
      formData: validForm,
    })).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      streetAddress: '123 Main Street',
      country: 'PH',
      state: 'Metro Manila',
      city: 'Makati',
      postalCode: '1200',
    });

    expect(buildAddCardRequestPayload({
      cardNumber: '4111111111111111',
      currentProvider: 'visa',
      formData: validForm,
      user: {},
    })).toMatchObject({
      bin: '41111111',
      cardProvider: 'visa',
      isPrimary: true,
      cardOrigin: 'PH',
      billingCountryCode: 'PH',
    });
  });

  it('forces isPrimary for the first card even when the toggle is off', () => {
    const args = {
      cardNumber: '4111111111111111',
      currentProvider: 'visa',
      formData: { ...validForm, useAsPrimaryPayment: false },
      user: {},
    };

    expect(buildAddCardRequestPayload(args).isPrimary).toBe(false);
    expect(buildAddCardRequestPayload({ ...args, forcePrimary: true }).isPrimary).toBe(true);
  });

  it('falls back to the user country when the form country is absent', () => {
    const result = buildEnrollmentCardPayload({
      cardNumber: '4111111111111111',
      formData: { ...validForm, country: '' },
      user: { customerCountryIso2Code: 'US' },
    });
    expect(result.cardOrigin).toBe('US');
    expect(result.billingCountry).toBe('United States');
  });
});
