import { ERRORS } from "@/constants";
import { COMMON } from "@/constants/common";
import { normalizeCurrencyInput, parseCurrencyInput } from "@/utils/format";
import type { CardValidationResult } from '@/types/payment';
import valid from 'card-validator';

export const validateCardNumber = (number: string): CardValidationResult => {
  const validation = valid.number(number);
  return {
    isValid: validation.isValid,
    isPotentiallyValid: validation.isPotentiallyValid,
  };
};

export const validateExpiryDate = (date: string): CardValidationResult => {
  const validation = valid.expirationDate(date);
  return {
    isValid: validation.isValid,
    isPotentiallyValid: validation.isPotentiallyValid,
  };
};

export const validateCVC = (cvc: string, maxLength: number = 3): CardValidationResult => {
  const validation = valid.cvv(cvc, maxLength);
  return {
    isValid: validation.isValid,
    isPotentiallyValid: validation.isPotentiallyValid,
  };
};

export const getCvcLength = (cardNumber: string): number => {
  const numberValidation = valid.number(cardNumber);
  return numberValidation.card?.code.size || 3;
};

export const validateField = (fieldName: string, value: string, extra?: { passwordToMatch?: string; [key: string]: any } ): string => {
  switch (fieldName) {
    case 'email':
      if (!value) return "Email is required.";
      if (!COMMON.VALIDATORS.REGEX.EMAIL.test(value)) return "Please enter a valid email address.";
      break;

    case 'newEmail':
      if (!value) {
        return "New Email is required.";
      }
      if (!COMMON.VALIDATORS.REGEX.EMAIL.test(value)) {
        return "Please enter a valid email address.";
      }
      if (extra?.currentValue) {
        if (value.trim().toLowerCase() === extra.currentValue.trim().toLowerCase()) {
          return "New email cannot be the same as the current email.";
        }
      }
      break;

    case 'password':
      if (!value) return "Password is required.";
      break;

    case 'oldPassword':
      if (!value) return "Old password is required.";
      break;

    case 'newPassword':
      if (!value) return "New password is required.";

    case 'confirmNewPassword':
      if (!value) return "Please confirm your new password.";
      if (extra?.passwordToMatch !== undefined && extra.passwordToMatch !== '') {
        if (value !== extra.passwordToMatch) return "Passwords do not match.";
      }
      break;

    case 'signupPassword':
    case 'createPassword':
      if (!value) return "Password is required.";
      break;

    case 'confirmPassword':
      if (!value) return "Password is required.";
      if (extra?.passwordToMatch !== undefined && extra.passwordToMatch !== '') {
        if (value !== extra?.passwordToMatch) return "Passwords do not match.";
      }
      break;

    case 'firstName':
    case 'lastName':
      if (!value) {
        return `${fieldName === 'firstName' ? 'First' : 'Last'} Name is required.`;
      }
      break;

    case 'fullName':
      if (value.trim().length < 3) return 'Full Name is required.';
      break;

    case 'cardNumber':
      if (!value) return 'Card Number is required.';
      const cardValidation = validateCardNumber(value);
      if (!cardValidation.isValid && !cardValidation.isPotentiallyValid) return 'Invalid card number.';
      break;

    case 'expiryDate':
      if (!value) return 'Expiry Date is required.';
      const expiryValidation = validateExpiryDate(value);
      if (!expiryValidation.isValid && !expiryValidation.isPotentiallyValid) return 'Invalid expiration date.';
      break;

    case 'securityCode':
      if (!value) return 'Security Code is required.';
      const currentCardNumber = extra?.currentCardNumber || '';
      const requiredLength = getCvcLength(currentCardNumber);
      const cvcValidation = validateCVC(value, requiredLength);

      if (!cvcValidation.isValid && !cvcValidation.isPotentiallyValid) return 'Invalid security code.';
      break;

    case 'streetAddress':
      if (value.trim().length === 0) return 'Street Address is required.';
      break;

    case 'country':
      if (!value || value.trim().length === 0) return 'Country is required.';
      break;

    case 'stateRegion':
    case 'state':
      if (!value || value.trim().length === 0) return 'State/Region is required.';
      break;

    case 'city':
      if (!value || value.trim().length === 0) return 'City is required.';
      break;

    case 'postalCode':
      if (value.trim().length === 0) return 'Postal Code is required.';
      break;

    case 'Amount':
      if (!value) return ERRORS.AMOUNT_REQUIRED;
      const normalizedAmount = normalizeCurrencyInput(value);
      const numValue = parseCurrencyInput(normalizedAmount);
      if (numValue == null || numValue <= 0) return "Please enter a valid amount greater than zero.";
      if (!/^\d+(\.\d{1,2})?$/.test(normalizedAmount)) return "Amount must have at most 2 decimal places.";
      break;

    case 'lookup':
      if (!value) return 'Please select an option.';
      break;

    case 'text':
    case 'longtext':
      if (!value || value.trim().length === 0) return `${fieldName} is required.`;
      break;
  }

  return "";
};

export const validateForm = <T extends Record<string, any>>(formData: T, extra?: { selected?: string }): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};
  (Object.keys(formData) as (keyof T)[]).forEach((key) => {
    if (typeof formData[key] === 'string') { 
      const msg = validateField(key as string, String(formData[key] || ""), extra);
      if (msg) errors[key] = msg;
    }
  });
  return errors;
};
