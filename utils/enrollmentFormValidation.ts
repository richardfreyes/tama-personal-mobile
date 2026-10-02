import { CurrencyConfig, MerchantFormField } from '@/redux/features/merchants/merchantTypes';
import { parseCurrencyInput } from '@/utils/format';
import { validateField } from '@/utils/validators';

export const removeHiddenKeys = <T extends Record<string, any>>(current: T, keys: Iterable<string>): T => {
  let next = current;
  let changed = false;

  for (const key of keys) {
    if (!(key in next)) {
      continue;
    }

    if (!changed) {
      next = { ...next };
      changed = true;
    }

    delete next[key];
  }

  return next;
};

export const parseEnrollmentAmount = (value: any) => {
  return parseCurrencyInput(value);
};

export const validateEnrollmentField = (
  fieldConfig: MerchantFormField,
  value: any,
  currencyConfig?: CurrencyConfig
) => {
  if (fieldConfig.fieldType === 'checkbox') {
    if (fieldConfig.isRequired && value !== true) {
      return `${fieldConfig.label} is required.`;
    }

    return undefined;
  }

  const textValue = String(value ?? '').trim();

  if (fieldConfig.isRequired && textValue.length === 0) {
    return `${fieldConfig.label} is required.`;
  }

  if (textValue.length === 0) { return undefined; }

  if (fieldConfig.key === 'monthSpan') {
    const monthSpanValue = Number(textValue);

    if (!Number.isFinite(monthSpanValue) || monthSpanValue <= 0) {
      return 'Please enter a valid month span.';
    }

    if (monthSpanValue > 60) {
      return 'Month span must not exceed 60.';
    }
  }

  if (fieldConfig.fieldType === 'currency') {
    const amount = parseEnrollmentAmount(textValue);
    const maxAmount = fieldConfig.maxLength || currencyConfig?.maxAmount;

    if (amount == null || !Number.isFinite(amount)) {
      return `Please enter a valid ${fieldConfig.label.toLowerCase()}.`;
    }

    if (currencyConfig?.minAmount !== undefined && amount < currencyConfig.minAmount) {
      return `${fieldConfig.label} must be at least ${currencyConfig.currency} ${currencyConfig.minAmount.toLocaleString()}.`;
    }

    if (maxAmount !== undefined && amount > maxAmount) {
      return `${fieldConfig.label} must not exceed ${currencyConfig?.currency ?? ''} ${maxAmount.toLocaleString()}`.trim() + '.';
    }
  } else if (fieldConfig.fieldType === 'number') {
    const numberValue = Number(textValue);

    if (!Number.isFinite(numberValue)) {
      return `Please enter a valid ${fieldConfig.label.toLowerCase()}.`;
    }

    if (numberValue <= 0) {
      return `${fieldConfig.label} must be greater than zero.`;
    }

    if (fieldConfig.maxLength && numberValue > fieldConfig.maxLength) {
      return `${fieldConfig.label} must not exceed ${fieldConfig.maxLength}.`;
    }
  } else {
    if (fieldConfig.minLength && textValue.length < fieldConfig.minLength) {
      return `${fieldConfig.label} must be at least ${fieldConfig.minLength} characters.`;
    }

    if (fieldConfig.maxLength && textValue.length > fieldConfig.maxLength) {
      return `${fieldConfig.label} must not exceed ${fieldConfig.maxLength} characters.`;
    }
  }

  if (fieldConfig.pattern) {
    try {
      const regex = new RegExp(`^${fieldConfig.pattern}$`);
      if (!regex.test(textValue)) {
        return `Please enter a valid ${fieldConfig.label.toLowerCase()}.`;
      }
    } catch {
      return validateField(fieldConfig.key, textValue) || undefined;
    }
  }

  return validateField(fieldConfig.key, textValue) || undefined;
};
