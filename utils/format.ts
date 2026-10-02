const addCommaSeparators = (value: string): string => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const removeCurrencySeparators = (value: unknown): string => String(value ?? '').replace(/,/g, '');

export const normalizeCurrencyInput = (value: unknown): string => {
  const raw = removeCurrencySeparators(value).replace(/[^0-9.]/g, '');

  if (!raw) {
    return '';
  }

  const hasDecimal = raw.includes('.');
  const [integer = '', ...decimalParts] = raw.split('.');
  const decimal = decimalParts.join('');
  const normalizedInteger = integer.replace(/^0+(?=\d)/, '') || (hasDecimal ? '0' : '');

  if (hasDecimal) {
    return `${normalizedInteger || '0'}.${decimal}`;
  }

  return normalizedInteger;
};

export const formatCurrencyInput = (value: unknown): string => {
  const normalized = normalizeCurrencyInput(value);

  if (!normalized) {
    return '';
  }

  const hasDecimal = normalized.includes('.');
  const [integer, decimal = ''] = normalized.split('.');
  const formattedInteger = addCommaSeparators(integer);

  return hasDecimal ? `${formattedInteger}.${decimal}` : formattedInteger;
};

export const parseCurrencyInput = (value: unknown): number | null => {
  const normalized = normalizeCurrencyInput(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

type CurrencyInputSelection = { start: number; end: number };

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, max));

const getDiffCursor = (previousText: string, nextText: string): number => {
  let prefixLength = 0;

  while (
    prefixLength < previousText.length &&
    prefixLength < nextText.length &&
    previousText[prefixLength] === nextText[prefixLength]
  ) {
    prefixLength += 1;
  }

  let previousSuffixIndex = previousText.length;
  let nextSuffixIndex = nextText.length;

  while (
    previousSuffixIndex > prefixLength &&
    nextSuffixIndex > prefixLength &&
    previousText[previousSuffixIndex - 1] === nextText[nextSuffixIndex - 1]
  ) {
    previousSuffixIndex -= 1;
    nextSuffixIndex -= 1;
  }

  return clamp(nextSuffixIndex, 0, nextText.length);
};

const getNativeCursorAfterCurrencyChange = ({
  nextText,
  previousFormattedValue,
  previousSelection,
  key,
}: {
  nextText: string;
  previousFormattedValue: string;
  previousSelection?: CurrencyInputSelection;
  key?: string;
}): number => {
  if (!previousSelection) {
    return getDiffCursor(previousFormattedValue, nextText);
  }

  const selectionStart = clamp(Math.min(previousSelection.start, previousSelection.end), 0, previousFormattedValue.length);
  const selectionEnd = clamp(Math.max(previousSelection.start, previousSelection.end), 0, previousFormattedValue.length);
  const selectedLength = selectionEnd - selectionStart;
  const nextLengthFromSelectionEdit = previousFormattedValue.length - selectedLength;
  const insertedLength = nextText.length - nextLengthFromSelectionEdit;

  if (selectedLength > 0) {
    return clamp(selectionStart + Math.max(insertedLength, 0), 0, nextText.length);
  }

  if (nextText.length > previousFormattedValue.length) {
    return clamp(selectionStart + (nextText.length - previousFormattedValue.length), 0, nextText.length);
  }

  if (nextText.length < previousFormattedValue.length) {
    const deletedLength = previousFormattedValue.length - nextText.length;

    if (key === 'Backspace') {
      return clamp(selectionStart - deletedLength, 0, nextText.length);
    }

    if (key === 'Delete') {
      return clamp(selectionStart, 0, nextText.length);
    }
  }

  return getDiffCursor(previousFormattedValue, nextText);
};

const getFormattedCurrencyCursor = (formattedValue: string, normalizedCursorLength: number): number => {
  if (normalizedCursorLength <= 0) {
    return 0;
  }

  let normalizedIndex = 0;

  for (let index = 0; index < formattedValue.length; index += 1) {
    if (/[0-9.]/.test(formattedValue[index])) {
      normalizedIndex += 1;
    }

    if (normalizedIndex >= normalizedCursorLength) {
      return index + 1;
    }
  }

  return formattedValue.length;
};

export const getCurrencyInputSelection = ({
  formattedValue,
  nextText,
  previousFormattedValue,
  previousSelection,
  key,
}: {
  formattedValue: string;
  nextText: string;
  previousFormattedValue: string;
  previousSelection?: CurrencyInputSelection;
  key?: string;
}): CurrencyInputSelection => {
  const nativeCursor = getNativeCursorAfterCurrencyChange({
    nextText,
    previousFormattedValue,
    previousSelection,
    key,
  });
  const normalizedCursorLength = normalizeCurrencyInput(nextText.slice(0, nativeCursor)).length;
  const cursor = getFormattedCurrencyCursor(formattedValue, normalizedCursorLength);

  return { start: cursor, end: cursor };
};

const CURRENCY_PREFIX_PATTERN = '(?:[A-Z]{3}|[$₱€£¥])';
const MONEY_LABEL_PATTERN = /\b(amount|fee|fees|price|total|balance|due|charge|charged)\b/i;

export const formatMonetaryDisplayValue = (value: unknown, label?: string): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const textValue = String(value).trim();

  if (!textValue) {
    return '';
  }

  const hasMoneyLabel = MONEY_LABEL_PATTERN.test(label || '');
  const match = textValue.match(new RegExp(`^(\\s*${CURRENCY_PREFIX_PATTERN}?\\s*)(\\d[\\d,]*(?:\\.\\d*)?|\\.\\d+)(\\s*)$`, 'i'));

  if (!match) {
    return textValue;
  }

  const [, prefix, amount, suffix] = match;

  if (!prefix.trim() && !hasMoneyLabel) {
    return textValue;
  }

  return `${prefix}${formatCurrencyInput(amount)}${suffix}`;
};

export const formatCurrencyAmount = (
  currency: string,
  amount: number,
  options?: Intl.NumberFormatOptions,
): string => `${currency} ${Number(amount || 0).toLocaleString(undefined, options)}`;

export const formatAmount = (value: string) => {
  if (!value) return '';
  return `₱${formatCurrencyInput(value)}`;
};

export const formatMoney = (value?: [string, number]) => {
  if (!Array.isArray(value)) { return 'N/A'; }

  const [currency, amount] = value;
  return formatCurrencyAmount(currency, amount, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getSearchParam = (value?: string | string[]) => {
  if (Array.isArray(value)) { return value[0] || ''; }
  return value || '';
};

export const getFirstString = (...values: any[]) => ( values.find((value) => typeof value === 'string' && value.trim()) as string | undefined ) || '';

export const formatEnrollmentAmount = (currency?: string, amount?: number) => {
  if (!currency || amount == null) { return 'N/A'; }
  return formatCurrencyAmount(currency, amount, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const resolveDisplayValue = (value: any): string => {
  if (value == null) { return 'N/A'; }
  const str = String(value).trim();
  return str || 'N/A';
};

export const normalizeMerchantFieldValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return String(value);
};

export const formatAmountEnrollments = (amount?: string): string => {
  const raw = normalizeCurrencyInput(amount);
  const parsed = parseCurrencyInput(raw);
  return parsed != null && Number.isFinite(parsed) ? parsed.toFixed(2) : raw;
};

export const formatCustomerMobile = (mobile: string, prefix: string): string => {
  if (!mobile) { return mobile; }
  return mobile.startsWith('+') ? mobile : `+${prefix}${mobile}`;
};

export const normalizeName = (name?: string | null): string => (name || '').trim().toLowerCase();

export const isValidLineItemFee = (fee?: readonly [string, number]): fee is readonly [string, number] =>
  Array.isArray(fee) && fee.length === 2 && typeof fee[0] === 'string' && typeof fee[1] === 'number';

export const formatLineItemFee = (fee: readonly [string, number]): string =>
  formatCurrencyAmount(fee[0], fee[1], { minimumFractionDigits: 2, maximumFractionDigits: 4 });

export const formatExpiryDate = (input: string) => {
  const digitsOnly = input.replace(/\D/g, '');
  const month = digitsOnly.slice(0, 2);
  const year = digitsOnly.slice(2, 4);

  let formatted = month;
  if (year.length) {
    formatted += '/' + year;
  }

  return formatted;
};

export const maskCardNumber = (num: string) => {
  const digits = num.replace(/\D/g, '');
  const visibleEnd = digits.slice(-5);
  const masked = '*'.repeat(Math.max(0, digits.length - 5));
  return formatWithSpaces(masked + visibleEnd);
};

export const formatWithSpaces = (num: string) => {
  return num.replace(/(.{4})/g, '$1 ').trim();
};
