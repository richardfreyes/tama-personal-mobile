import { getCvcLength, validateCardNumber, validateCVC, validateExpiryDate, validateField, validateForm } from '@/utils/validators';
import { describe, expect, it } from '@jest/globals';

describe('validateCardNumber', () => {
  it('accepts a valid Visa number', () => {
    const result = validateCardNumber('4111111111111111');
    expect(result.isValid).toBe(true);
  });

  it('rejects obviously invalid numbers', () => {
    const result = validateCardNumber('0000000000000000');
    expect(result.isValid).toBe(false);
  });
});

describe('validateExpiryDate', () => {
  it('accepts a valid future expiry', () => {
    const result = validateExpiryDate('12/30');
    expect(result.isValid).toBe(true);
  });

  it('rejects invalid month', () => {
    const result = validateExpiryDate('13/30');
    expect(result.isValid).toBe(false);
  });
});

describe('validateCVC', () => {
  it('accepts a 3-digit CVC', () => {
    const result = validateCVC('123');
    expect(result.isValid).toBe(true);
  });

  it('accepts a 4-digit CVC when maxLength is 4', () => {
    const result = validateCVC('1234', 4);
    expect(result.isValid).toBe(true);
  });

  it('rejects too-short CVC', () => {
    const result = validateCVC('12');
    expect(result.isValid).toBe(false);
  });
});

describe('getCvcLength', () => {
  it('returns 4 for Amex cards', () => {
    expect(getCvcLength('340000000000009')).toBe(4);
  });

  it('returns 3 for standard cards', () => {
    expect(getCvcLength('4111111111111111')).toBe(3);
  });

  it('defaults to 3 for unrecognized cards', () => {
    expect(getCvcLength('')).toBe(3);
  });
});

describe('validateField', () => {
  it('validates required email', () => {
    expect(validateField('email', '')).toBe('Email is required.');
    expect(validateField('email', 'bad')).toBe('Please enter a valid email address.');
    expect(validateField('email', 'test@example.com')).toBe('');
  });

  it('validates newEmail cannot match current', () => {
    expect(validateField('newEmail', '', {})).toBe('New Email is required.');
    expect(validateField('newEmail', 'a@b.com', { currentValue: 'a@b.com' })).toBe('New email cannot be the same as the current email.');
    expect(validateField('newEmail', 'new@b.com', { currentValue: 'old@b.com' })).toBe('');
  });

  it('validates password fields', () => {
    expect(validateField('password', '')).toBe('Password is required.');
    expect(validateField('password', 'secret')).toBe('');
    expect(validateField('oldPassword', '')).toBe('Old password is required.');
  });

  it('validates confirmPassword matches', () => {
    expect(validateField('confirmPassword', '', {})).toBe('Password is required.');
    expect(validateField('confirmPassword', 'a', { passwordToMatch: 'b' })).toBe('Passwords do not match.');
    expect(validateField('confirmPassword', 'x', { passwordToMatch: 'x' })).toBe('');
  });

  it('validates name fields', () => {
    expect(validateField('firstName', '')).toBe('First Name is required.');
    expect(validateField('lastName', '')).toBe('Last Name is required.');
    expect(validateField('fullName', 'AB')).toBe('Full Name is required.');
    expect(validateField('fullName', 'John Doe')).toBe('');
  });

  it('validates address fields', () => {
    expect(validateField('streetAddress', '')).toBe('Street Address is required.');
    expect(validateField('country', '')).toBe('Country is required.');
    expect(validateField('city', '')).toBe('City is required.');
    expect(validateField('postalCode', '')).toBe('Postal Code is required.');
    expect(validateField('stateRegion', '')).toBe('State/Region is required.');
  });

  it('validates Amount field', () => {
    expect(validateField('Amount', '')).toBe('Amount is required.');
    expect(validateField('Amount', '0')).toBe('Please enter a valid amount greater than zero.');
    expect(validateField('Amount', '100.123')).toBe('Amount must have at most 2 decimal places.');
    expect(validateField('Amount', '100.50')).toBe('');
  });

  it('validates lookup field', () => {
    expect(validateField('lookup', '')).toBe('Please select an option.');
    expect(validateField('lookup', 'selected')).toBe('');
  });

  it('returns empty string for unknown field names', () => {
    expect(validateField('unknownField', 'value')).toBe('');
  });
});

describe('validateForm', () => {
  it('returns errors for invalid fields', () => {
    const errors = validateForm({ email: '', password: '' });
    expect(errors.email).toBe('Email is required.');
    expect(errors.password).toBe('Password is required.');
  });

  it('returns empty object for valid form', () => {
    const errors = validateForm({ email: 'test@example.com', password: 'secret' });
    expect(errors).toEqual({});
  });

  it('skips non-string fields', () => {
    const errors = validateForm({ email: 'test@example.com', count: 42 as any });
    expect(errors).toEqual({});
  });
});
