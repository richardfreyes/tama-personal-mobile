import { ENROLLMENT_DETAIL_SECTION_ORDER } from '@/constants/enrollment';
import type { Enrollment, EnrollmentDetailField, EnrollmentDetailSection, EnrollmentDetailSectionTitle, EnrollmentDetailsViewModel, EnrollmentDisplayField, EnrollmentPaymentMethodDetails, EnrollmentPaymentMethodSummary } from '@/types/enrollment';
import { getProviderDisplay } from '@/utils/card';
import { formatApiDate } from '@/utils/date';
import { formatMoney } from '@/utils/format';

const isRecord = (value: any): value is Record<string, any> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const normalizeKey = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

const EMPTY_DISPLAY_VALUES = new Set(['n/a', 'na', 'none', 'null', 'undefined', 'nan']);

const toDisplayString = (value: any): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed && !EMPTY_DISPLAY_VALUES.has(trimmed.toLowerCase()) ? trimmed : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return null;
};

const getPathValue = (source: Record<string, any>, path: string): any => (
  path.split('.').reduce<any>((current, key) => (
    isRecord(current) ? current[key] : undefined
  ), source)
);

const findNamedValue = (
  value: any,
  names: Set<string>,
  depth = 0,
): string | null => {
  if (depth > 5) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findNamedValue(item, names, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const descriptor = toDisplayString(value.key) || toDisplayString(value.label) || toDisplayString(value.name);
  if (descriptor && names.has(normalizeKey(descriptor))) {
    const describedValue = toDisplayString(value.value);
    if (describedValue) return describedValue;
  }

  for (const [key, childValue] of Object.entries(value)) {
    if (names.has(normalizeKey(key))) {
      const directValue = toDisplayString(childValue);
      if (directValue) return directValue;

      if (isRecord(childValue)) {
        const nestedName = toDisplayString(childValue.name) || toDisplayString(childValue.title);
        if (nestedName) return nestedName;
      }
    }
  }

  for (const childValue of Object.values(value)) {
    const found = findNamedValue(childValue, names, depth + 1);
    if (found) return found;
  }

  return null;
};

const getFirstEnrollmentValue = (enrollment: Enrollment, paths: string[]): string | null => {
  const source = enrollment as Record<string, any>;

  for (const path of paths) {
    const value = getPathValue(source, path);
    const displayValue = toDisplayString(value);
    if (displayValue) return displayValue;
  }

  const fallbackNames = paths
    .filter((path) => !path.endsWith('.name'))
    .map((path) => normalizeKey(path.split('.').pop() || path));

  return findNamedValue(source, new Set(fallbackNames));
};

export const getEnrollmentTitle = (enrollment: Enrollment): string => (
  getFirstEnrollmentValue(enrollment, [
    'enrollmentTitle',
    'propertyName',
    'projectName',
    'property.name',
    'project.name',
    'customFields.propertyName',
    'customFields.projectName',
    'unitName',
    'accountName',
  ]) || 'Auto Debit Enrollment'
);

export const getEnrollmentReferenceId = (enrollment: Enrollment): string => (
  getFirstEnrollmentValue(enrollment, [
    'referenceId',
    'reference_id',
    'enrollmentReferenceId',
    'enrollment_reference_id',
    'enrollment.referenceId',
  ]) || 'Not available'
);

export const getEnrollmentMerchantCode = (enrollment: Enrollment): string => (
  getFirstEnrollmentValue(enrollment, [
    'merchantCode',
    'merchant_code',
    'merchant.code',
    'merchant.pid',
    'merchantId',
    'merchant_id',
    'pid',
  ]) || 'Not available'
);

export const getEnrollmentMerchantName = (enrollment: Enrollment): string | null => (
  getFirstEnrollmentValue(enrollment, [
    'merchantName',
    'merchant_name',
    'merchant.name',
  ])
);

export const getEnrollmentMonthlyAmount = (enrollment: Enrollment): string => {
  const amountValue = getFirstEnrollmentValue(enrollment, [
    'monthlyAmount',
    'enrollmentMonthlyAmount',
    'enrollmentMonthlyInvoiceAmount',
    'amountDue',
    'upcomingBill.amountDue',
    'upcomingBill.amount',
    'bill.monthlyAmount',
    'bill.amount',
    'amount',
    'baseAmount',
  ]);
  const currency = getFirstEnrollmentValue(enrollment, [
    'baseCurrency',
    'currency',
    'monthlyCurrency',
    'upcomingBill.currency',
    'bill.currency',
  ]);
  const amount = amountValue === null ? Number.NaN : Number(amountValue.replace(/,/g, ''));

  if (!currency || !Number.isFinite(amount)) {
    return 'Not available';
  }

  return formatMoney([currency, amount]);
};

export const getEnrollmentNextDebitDateValue = (enrollment: Enrollment): string | null => (
  getFirstEnrollmentValue(enrollment, [
    'upcomingBill.dueDate',
    'upcomingBill.nextDebitDate',
    'upcomingBill.nextPaymentDate',
    'nextDebitDate',
    'enrollmentNextPaymentDate',
    'nextPaymentDate',
    'nextBillingDate',
    'dueDate',
    'schedule.nextDebitDate',
    'schedule.nextPaymentDate',
  ])
);

export const getEnrollmentNextDebitDate = (enrollment: Enrollment): string => {
  const date = getEnrollmentNextDebitDateValue(enrollment);

  return date ? formatApiDate(date, 'MMM dd, yyyy') : 'Not scheduled';
};

export const getEnrollmentBillTitle = (enrollment: Enrollment): string => (
  getFirstEnrollmentValue(enrollment, [
    'propertyName',
    'projectName',
    'property.name',
    'project.name',
    'customFields.propertyName',
    'customFields.projectName',
    'merchantName',
    'enrollmentTitle',
    'paymentTypeName',
  ]) || 'Auto Debit Bill'
);

const getLastFour = (value: string | null): string => {
  if (!value) return '';

  const digits = value.replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-4);

  const compact = value.replace(/\s/g, '');
  return compact.length >= 4 ? compact.slice(-4) : compact;
};

export const getEnrollmentPaymentMethod = (enrollment: Enrollment): EnrollmentPaymentMethodSummary => {
  const rawProvider = getFirstEnrollmentValue(enrollment, [
    'paymentMethodBrand',
    'paymentMethodProvider',
    'methodBrand',
    'methodProvider',
    'cardBrand',
    'paymentMethod.brand',
    'card.provider',
  ]);
  const rawLastFour = getFirstEnrollmentValue(enrollment, [
    'lastFourCardDigits',
    'paymentMethodLastFour',
    'cardLastFourDigits',
    'paymentMethod.lastFourCardDigits',
    'card.lastFourDigits',
    'methodCardNumber',
    'tokenizedCardNumber',
  ]);
  const provider = getProviderDisplay(rawProvider);
  const lastFour = getLastFour(rawLastFour);

  return {
    provider,
    lastFour,
    display: lastFour ? `${provider} ending in ${lastFour}` : provider,
  };
};

export const getEnrollmentStatusLabel = (status?: string | null): string => {
  const normalized = status?.trim().replace(/[_-]+/g, ' ');
  if (!normalized) return 'Status unavailable';

  const statusKey = normalized.toLowerCase();
  const customerStatusLabels: Record<string, string> = {
    ongoing: 'Active',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    expired: 'Expired',
    pending: 'Pending',
  };

  if (customerStatusLabels[statusKey]) {
    return customerStatusLabels[statusKey];
  }

  return normalized
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Home and Bills both report how many enrollments are running, so they share this one definition.
export const isActiveEnrollment = ({ status }: Pick<Enrollment, 'status'>): boolean => (
  getEnrollmentStatusLabel(status) === 'Active'
);

export const countActiveEnrollments = (enrollments: readonly Pick<Enrollment, 'status'>[] = []): number => (
  enrollments.filter(isActiveEnrollment).length
);

const getFirstEnrollmentNumber = (enrollment: Enrollment, paths: string[]): number | null => {
  const value = getFirstEnrollmentValue(enrollment, paths);
  if (value === null) return null;

  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatFriendlyEnum = (value: string | null): string | null => {
  if (!value) return null;

  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (character) => character.toUpperCase());
};

export const formatEnrollmentCurrency = (
  amount: number | null,
  currency: string | null,
  locale = 'en-PH',
): string | null => {
  if (amount === null || !Number.isFinite(amount) || !currency) return null;

  try {
    return new Intl.NumberFormat(locale, {
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
    }).format(amount);
  } catch {
    return null;
  }
};

const parseDisplayDate = (value: string | null): Date | null => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatEnrollmentDate = (
  value: string | null,
  locale = 'en-PH',
  timeZone = 'Asia/Manila',
): string | null => {
  const date = parseDisplayDate(value);
  if (!date) return null;

  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      timeZone,
      year: 'numeric',
    }).format(date);
  } catch {
    return null;
  }
};

export const formatEnrollmentPhone = (value: string | null): string | null => {
  if (!value) return null;

  const compact = value.replace(/[\s()-]/g, '');
  const philippineNumber = compact.match(/^\+?63(\d{3})(\d{3})(\d{4})$/);
  if (philippineNumber) {
    return `+63 ${philippineNumber[1]} ${philippineNumber[2]} ${philippineNumber[3]}`;
  }

  return value;
};

const formatEnrollmentExpiry = (value: string | null): string | null => {
  if (!value) return null;

  let month: number | null = null;
  let year: number | null = null;
  const trimmed = value.trim();
  const monthFirst = trimmed.match(/^(0?[1-9]|1[0-2])[\/-](\d{2}|\d{4})$/);
  const yearFirst = trimmed.match(/^(\d{4})-(0?[1-9]|1[0-2])$/);
  const compact = trimmed.match(/^(0[1-9]|1[0-2])(\d{2})$/);

  if (monthFirst) {
    month = Number(monthFirst[1]);
    year = Number(monthFirst[2]);
  } else if (yearFirst) {
    month = Number(yearFirst[2]);
    year = Number(yearFirst[1]);
  } else if (compact) {
    month = Number(compact[1]);
    year = Number(compact[2]);
  } else {
    const parsed = parseDisplayDate(trimmed);
    if (parsed) {
      month = parsed.getUTCMonth() + 1;
      year = parsed.getUTCFullYear();
    }
  }

  if (month === null || year === null || month < 1 || month > 12) return null;
  const fullYear = year < 100 ? 2000 + year : year;

  return `${new Intl.DateTimeFormat('en-PH', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(fullYear, month - 1, 1)))} ${fullYear}`;
};

const getEnrollmentFrequencyLabel = (value: string | null): string | null => {
  if (!value) return null;

  const normalized = normalizeKey(value);
  const labels: Record<string, string> = {
    annual: 'Annually',
    annually: 'Annually',
    biweekly: 'Every two weeks',
    daily: 'Daily',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    weekly: 'Weekly',
    yearly: 'Annually',
  };

  return labels[normalized] || formatFriendlyEnum(value);
};

const getEnrollmentTypeLabel = (value: string | null): string | null => {
  if (!value) return null;

  const normalized = normalizeKey(value);
  if (normalized.includes('fixed')) return 'Fixed monthly payment';
  if (normalized.includes('variable')) return 'Variable monthly payment';

  return formatFriendlyEnum(value);
};

const getPaymentMethodTypeLabel = (value: string | null): string | null => {
  if (!value) return null;

  const normalized = normalizeKey(value);
  if (normalized.includes('credit')) return 'Credit card';
  if (normalized.includes('debit')) return 'Debit card';
  if (normalized === 'card') return 'Card';

  return formatFriendlyEnum(value);
};

const buildDisplayField = (
  key: string,
  label: string,
  value: string | null,
): EnrollmentDisplayField | null => value ? { key, label, value } : null;

const compactFields = <T>(values: (T | null)[]): T[] => values.filter((value): value is T => value !== null);

const getDetailedPaymentMethod = (enrollment: Enrollment): EnrollmentPaymentMethodDetails | null => {
  const rawBrand = getFirstEnrollmentValue(enrollment, [
    'paymentMethodBrand',
    'methodBrand',
    'cardBrand',
    'paymentMethod.brand',
    'card.provider',
    'methodProvider',
  ]);
  const rawCardNumber = getFirstEnrollmentValue(enrollment, [
    'lastFourCardDigits',
    'paymentMethodLastFour',
    'cardLastFourDigits',
    'paymentMethod.lastFourCardDigits',
    'card.lastFourDigits',
    'methodCardNumber',
    'tokenizedCardNumber',
  ]);
  const givenName = getFirstEnrollmentValue(enrollment, ['methodCustomerGivenName']);
  const familyName = getFirstEnrollmentValue(enrollment, ['methodCustomerFamilyName']);
  const cardholder = getFirstEnrollmentValue(enrollment, [
    'cardholderName',
    'methodCustomerFullName',
    'paymentMethod.cardholderName',
  ]) || [givenName, familyName].filter(Boolean).join(' ') || null;
  const expiry = formatEnrollmentExpiry(getFirstEnrollmentValue(enrollment, [
    'methodExpiry',
    'paymentMethodExpiry',
    'cardExpiry',
    'paymentMethod.expiry',
  ]));
  const paymentMethodType = getPaymentMethodTypeLabel(getFirstEnrollmentValue(enrollment, [
    'methodType',
    'paymentMethodType',
    'paymentMethod.type',
    'card.type',
  ]));
  const lastFour = getLastFour(rawCardNumber);
  const cardType = rawBrand ? getProviderDisplay(rawBrand) : null;

  if (!cardType && !lastFour && !cardholder && !expiry && !paymentMethodType) return null;

  return {
    ...(cardType ? { cardType } : {}),
    ...(lastFour ? { maskedCard: `•••• ${lastFour}` } : {}),
    ...(cardholder ? { cardholder } : {}),
    ...(expiry ? { expiry } : {}),
    ...(paymentMethodType ? { paymentMethodType } : {}),
  };
};

export const buildEnrollmentDetailsViewModel = (enrollment: Enrollment): EnrollmentDetailsViewModel => {
  const currency = getFirstEnrollmentValue(enrollment, [
    'bill.currency',
    'baseCurrency',
    'currency',
    'monthlyCurrency',
  ]);
  const baseAmount = getFirstEnrollmentNumber(enrollment, [
    'bill.amount',
    'monthlyAmount',
    'enrollmentMonthlyAmount',
    'enrollmentMonthlyInvoiceAmount',
    'baseAmount',
    'amount',
  ]);
  const totalPaymentsValue = getFirstEnrollmentNumber(enrollment, [
    'enrollmentMonths',
    'numberOfPayments',
    'paymentDuration',
    'monthSpan',
    'fields.monthSpan',
  ]);
  const totalPayments = totalPaymentsValue !== null && totalPaymentsValue > 0
    ? Math.trunc(totalPaymentsValue)
    : null;
  const startDateValue = getFirstEnrollmentValue(enrollment, [
    'enrollmentStartDate',
    'startPaymentDate',
    'schedule.startDate',
    'fields.startPaymentDate',
  ]);
  const startDate = formatEnrollmentDate(startDateValue);
  const lastPaymentDateValue = getFirstEnrollmentValue(enrollment, [
    'enrollmentLastPaymentDate',
    'lastPaymentDate',
    'paymentHistory.lastPaymentDate',
  ]);
  const lastPaymentDate = formatEnrollmentDate(lastPaymentDateValue);
  const lastPaymentAmount = getFirstEnrollmentNumber(enrollment, [
    'enrollmentLastPaymentAmount',
    'lastPaymentAmount',
    'paymentHistory.lastPaymentAmount',
  ]);
  const formattedLastPaymentAmount = lastPaymentAmount !== null && lastPaymentAmount > 0
    ? formatEnrollmentCurrency(lastPaymentAmount, currency)
    : null;
  const explicitCompletedPayments = getFirstEnrollmentNumber(enrollment, [
    'completedPayments',
    'paymentsCompleted',
    'numberOfPaymentsCompleted',
    'successfulPaymentCount',
    'enrollmentPaidMonths',
  ]);
  const statusLabel = getEnrollmentStatusLabel(enrollment.status);
  const completedPayments = explicitCompletedPayments !== null
    ? Math.max(0, totalPayments === null ? Math.trunc(explicitCompletedPayments) : Math.min(totalPayments, Math.trunc(explicitCompletedPayments)))
    : statusLabel === 'Completed' && totalPayments !== null
      ? totalPayments
      : !lastPaymentDateValue
        ? 0
        : null;
  const progress = completedPayments !== null && totalPayments !== null
    ? Math.max(0, Math.min(1, completedPayments / totalPayments))
    : null;
  const frequency = getEnrollmentFrequencyLabel(getFirstEnrollmentValue(enrollment, [
    'enrollmentPeriod',
    'paymentFrequency',
    'frequency',
    'schedule.frequency',
  ]));
  const enrollmentTypeValue = getFirstEnrollmentValue(enrollment, [
    'enrollmentType',
    'amountType',
    'paymentPlanType',
    'schedule.amountType',
    'fields.enrollmentType',
  ]);
  const enrollmentType = getEnrollmentTypeLabel(enrollmentTypeValue);
  const canEstimateTotal = Boolean(
    enrollmentTypeValue &&
    normalizeKey(enrollmentTypeValue).includes('fixed') &&
    baseAmount !== null &&
    baseAmount > 0 &&
    totalPayments,
  );
  const formattedAmount = formatEnrollmentCurrency(baseAmount, currency);
  const estimatedTotal = canEstimateTotal && totalPayments !== null && baseAmount !== null
    ? formatEnrollmentCurrency(baseAmount * totalPayments, currency)
    : null;
  const paymentDuration = totalPayments === null
    ? null
    : `${totalPayments} month${totalPayments === 1 ? '' : 's'}`;
  const nextPaymentDate = formatEnrollmentDate(getEnrollmentNextDebitDateValue(enrollment));
  const merchantNameValue = getEnrollmentMerchantName(enrollment);
  const merchantName = merchantNameValue || 'Enrollment';
  const merchantContactName = merchantNameValue || 'the merchant';
  const lastPayment = lastPaymentDate
    ? [formattedLastPaymentAmount, lastPaymentDate].filter(Boolean).join(' · ')
    : 'No payments yet';
  const paymentMethod = getDetailedPaymentMethod(enrollment);
  const paymentTypeValue = getFirstEnrollmentValue(enrollment, [
    'paymentTypeName',
    'paymentType.name',
    'paymentPlanName',
  ]);
  const paymentType = paymentTypeValue && normalizeKey(paymentTypeValue) === 'monthlyamortization'
    ? 'Monthly Amortization'
    : formatFriendlyEnum(paymentTypeValue) || 'Auto debit enrollment';

  const enrollmentFields = compactFields<EnrollmentDisplayField>([
    buildDisplayField('so-number', 'SO Number', getFirstEnrollmentValue(enrollment, [
      'soNumber',
      'salesOrderNumber',
      'soNo',
      'fields.soNumber',
      'transactionFields.soNumber',
      'customFields.soNumber',
    ])),
    buildDisplayField('unit-number', 'Unit Number', getFirstEnrollmentValue(enrollment, [
      'unitNumber',
      'fields.unitNumber',
      'transactionFields.unitNumber',
      'customFields.unitNumber',
      'lotCode',
      'fields.lotCode',
      'transactionFields.lotCode',
    ])),
    buildDisplayField('start-payment-date', 'Start Payment Date', startDate),
    buildDisplayField('payment-duration', 'Payment Duration', paymentDuration),
    buildDisplayField('enrollment-type', 'Enrollment type', enrollmentType),
  ]);

  const customerFields = compactFields<EnrollmentDisplayField>([
    buildDisplayField('customer-name', 'Name', getFirstEnrollmentValue(enrollment, [
      'customerName',
      'customer.name',
    ])),
    buildDisplayField('customer-email', 'Email', getFirstEnrollmentValue(enrollment, [
      'customerEmail',
      'customer.email',
    ])),
    buildDisplayField('customer-mobile', 'Mobile number', formatEnrollmentPhone(getFirstEnrollmentValue(enrollment, [
      'customerMobileNo',
      'customerMobile',
      'customer.mobile',
      'customer.phone',
    ]))),
    buildDisplayField('customer-reference', 'Customer reference', getFirstEnrollmentValue(enrollment, [
      'customerReference',
      'customerReferenceId',
      'customer.referenceId',
      'customer.reference',
    ])),
  ]);

  const summaryMetrics = compactFields<EnrollmentDisplayField>([
    buildDisplayField('frequency', 'Payment frequency', frequency),
    buildDisplayField('duration', 'Number of payments', paymentDuration),
    buildDisplayField('start', 'Start date', startDate),
    buildDisplayField('last-payment', 'Last payment', lastPayment),
  ]);

  const paymentMethodFields = compactFields<EnrollmentDisplayField>([
    buildDisplayField('card-type', 'Card type', paymentMethod?.cardType ?? null),
    buildDisplayField('card', 'Card number', paymentMethod?.maskedCard ?? null),
    buildDisplayField('cardholder', 'Cardholder', paymentMethod?.cardholder ?? null),
    buildDisplayField('expiry', 'Expiry', paymentMethod?.expiry ?? null),
    buildDisplayField('payment-method-type', 'Payment method', paymentMethod?.paymentMethodType ?? null),
  ]);

  return {
    merchantName,
    merchantContactName,
    paymentType,
    referenceId: getFirstEnrollmentValue(enrollment, [
      'referenceId',
      'reference_id',
      'enrollmentReferenceId',
      'enrollment_reference_id',
    ]),
    statusLabel,
    monthlyAmount: formattedAmount || 'Amount unavailable',
    paymentFrequency: frequency,
    paymentDuration,
    startDate,
    lastPayment,
    lastPaymentRecord: lastPaymentDate || 'No payments recorded yet',
    estimatedTotal,
    completedPayments,
    totalPayments,
    progress,
    nextPaymentDate,
    summaryMetrics,
    paymentMethod,
    paymentMethodFields,
    enrollmentFields,
    customerFields,
    clientNotes: getFirstEnrollmentValue(enrollment, [
      'clientNotes',
      'customFields.clientNotes',
      'customerNotes',
      'customFields.customerNotes',
    ]),
  };
};

const humanizeKey = (value: string): string => value
  .replace(/\[(\d+)\]/g, ' $1')
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, (character) => character.toUpperCase());

const formatDetailValue = (path: string[], value: string): string => {
  const key = normalizeKey(path.join(' '));

  if ((key.includes('date') || key.includes('createdat') || key.includes('updatedat')) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return formatApiDate(value, 'MMM dd, yyyy, h:mm a');
  }

  return value;
};

const flattenDetailFields = (
  value: any,
  path: string[],
  fields: EnrollmentDetailField[],
): void => {
  const displayValue = toDisplayString(value);
  if (displayValue !== null) {
    fields.push({
      key: path.join('.'),
      label: path.map(humanizeKey).join(' '),
      value: formatDetailValue(path, displayValue),
    });
    return;
  }

  if (Array.isArray(value)) {
    const primitiveValues = value.map(toDisplayString);
    if (primitiveValues.length > 0 && primitiveValues.every((item) => item !== null)) {
      fields.push({
        key: path.join('.'),
        label: path.map(humanizeKey).join(' '),
        value: primitiveValues.join(', '),
      });
      return;
    }

    value.forEach((item, index) => flattenDetailFields(item, [...path, `[${index + 1}]`], fields));
    return;
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([key, childValue]) => {
      flattenDetailFields(childValue, [...path, key], fields);
    });
  }
};

const getDetailSection = (path: string): EnrollmentDetailSectionTitle => {
  const normalizedPath = normalizeKey(path);

  if (normalizedPath.includes('history') || normalizedPath.includes('event') || normalizedPath.includes('audit')) {
    return 'History';
  }

  if (
    normalizedPath.includes('note') ||
    normalizedPath.includes('customfield') ||
    normalizedPath.includes('customdata') ||
    normalizedPath.includes('metadata') ||
    normalizedPath.includes('created') ||
    normalizedPath.includes('updated') ||
    normalizedPath.includes('admin')
  ) {
    return 'Additional Information';
  }

  if (
    normalizedPath.includes('billing') ||
    normalizedPath.includes('customer') ||
    normalizedPath.includes('cardholder') ||
    normalizedPath.includes('address') ||
    normalizedPath.includes('email') ||
    normalizedPath.includes('mobile') ||
    normalizedPath.includes('phone')
  ) {
    return 'Billing Information';
  }

  if (
    normalizedPath.includes('property') ||
    normalizedPath.includes('project') ||
    normalizedPath.includes('merchant') ||
    normalizedPath.includes('unit') ||
    normalizedPath.includes('building') ||
    normalizedPath.includes('tower') ||
    normalizedPath.includes('phase') ||
    normalizedPath.includes('block') ||
    normalizedPath.includes('lot')
  ) {
    return 'Property Information';
  }

  if (
    normalizedPath.includes('schedule') ||
    normalizedPath.includes('start') ||
    normalizedPath.includes('end') ||
    normalizedPath.includes('month') ||
    normalizedPath.includes('period') ||
    normalizedPath.includes('date') ||
    normalizedPath.includes('debit') ||
    normalizedPath.includes('frequency')
  ) {
    return 'Schedule';
  }

  if (
    normalizedPath.includes('payment') ||
    normalizedPath.includes('card') ||
    normalizedPath.includes('amount') ||
    normalizedPath.includes('currency') ||
    normalizedPath.includes('token')
  ) {
    return 'Payment Information';
  }

  return 'Enrollment Information';
};

export const buildEnrollmentDetailSections = (enrollment: Enrollment): EnrollmentDetailSection[] => {
  const fields: EnrollmentDetailField[] = [];

  Object.entries(enrollment).forEach(([key, value]) => {
    flattenDetailFields(value, [key], fields);
  });

  const grouped = new Map<EnrollmentDetailSectionTitle, EnrollmentDetailField[]>();
  fields.forEach((field) => {
    const title = getDetailSection(field.key);
    grouped.set(title, [...(grouped.get(title) || []), field]);
  });

  return ENROLLMENT_DETAIL_SECTION_ORDER.flatMap((title) => {
    const sectionFields = grouped.get(title);
    return sectionFields?.length ? [{ title, fields: sectionFields }] : [];
  });
};
