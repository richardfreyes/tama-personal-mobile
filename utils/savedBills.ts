import { ENV_CONFIG } from '@/constants/env';
import { MOCK_SAVED_BILLS } from '@/__mocks__/data/mockSavedBills';
import { AMOUNT_FIELD_PATTERN, BILLER_SUMMARY_HIDDEN_KEYS, BILLER_SUMMARY_MOBILE_KEYS, BILLER_SUMMARY_PRIMARY_ROWS, BILLER_SUMMARY_SECONDARY_ROWS, INACTIVE_STATUS_PATTERN, INITIALS_IGNORED_WORDS, INITIALS_PUNCTUATION, PAID_STATUS_PATTERN, SAVED_BILL_CONTRACT_KEYS, SAVED_BILL_DATE_FORMAT, SAVED_BILL_NEVER_PAID_LABEL, SAVED_BILL_NO_AMOUNT_LABEL, SAVED_BILL_STATUS_ORDER } from '@/constants/savedBills';
import type { Biller } from '@/redux/features/biller/billerTypes';
import type { Bill } from '@/redux/features/bills/billsTypes';
import type { BillerDueSummary, BillerStatus, BillerSummaryRow, BillerSummaryRows, CustomFields, SavedBillStatusSource, SavedBillSummarySource } from '@/types/bill';
import { formatMobileNumber, formatMonetaryDisplayValue, formatPesoAmount, removeCurrencySeparators } from '@/utils/format';
import { differenceInCalendarDays, format, isValid } from 'date-fns';

export const getBillerLogoMap = (billers?: Biller[] | null): Map<number, string> => new Map<number, string>(
  (billers ?? [])
    .filter((biller) => Boolean(biller.merchant_logo_url))
    .map((biller) => [biller.merchant_id, biller.merchant_logo_url]),
);

const getCustomFieldValue = (bill: Pick<Bill, 'custom_fields'>, keys: readonly string[]): unknown => {
  for (const key of keys) {
    const field = bill.custom_fields?.[key];
    if (field?.value !== undefined && field?.value !== null && String(field.value).trim()) {
      return field.value;
    }
  }

  return undefined;
};

export const getSavedBillIdentity = (bill: Bill, fallbackIndex?: number): string => {
  if (bill.billing_reference_id) {
    return `reference:${bill.billing_reference_id}`;
  }

  if (bill.billing_id !== undefined && bill.billing_id !== null) {
    return `id:${bill.billing_id}`;
  }

  const fallback = `${bill.billing_name || ''}:${bill.merchant_name || ''}`.toLowerCase();
  return fallbackIndex === undefined ? fallback : `${fallback}:${fallbackIndex}`;
};

export const getUniqueSavedBills = (bills?: Bill[] | null): Bill[] => {
  const seen = new Set<string>();

  return (bills ?? []).filter((bill) => {
    const identity = getSavedBillIdentity(bill);
    if (seen.has(identity)) {
      return false;
    }

    seen.add(identity);
    return true;
  });
};

export const shouldUseMockSavedBills = (bills?: Bill[] | null): boolean => (
  ENV_CONFIG.enableMockMode && (bills?.length ?? 0) === 0
);

export const getSavedBillsForDisplay = (bills?: Bill[] | null): Bill[] => {
  if (shouldUseMockSavedBills(bills)) {
    return MOCK_SAVED_BILLS;
  }

  return bills ?? [];
};

export const getSavedMerchantIds = (bills?: Bill[] | null): Set<number> => new Set(
  getUniqueSavedBills(getSavedBillsForDisplay(bills)).map((bill) => bill.merchant_id),
);

export const getSavedBillStatus = (bill: SavedBillStatusSource): string => {
  const customStatus = getCustomFieldValue(bill, [
    'paymentStatus',
    'payment_status',
    'billingStatus',
    'billing_status',
    'status',
  ]);

  return String(
    bill.payment_status
      ?? bill.billing_status
      ?? bill.status
      ?? customStatus
      ?? '',
  ).trim();
};

export const isPaidSavedBill = (bill: SavedBillStatusSource): boolean => (
  Boolean(bill.date_paid || bill.paid_at) || PAID_STATUS_PATTERN.test(getSavedBillStatus(bill))
);

export const isActiveSavedBill = (bill: SavedBillStatusSource): boolean => {
  if (bill.is_active === false || isPaidSavedBill(bill)) {
    return false;
  }

  return !INACTIVE_STATUS_PATTERN.test(getSavedBillStatus(bill));
};

export const getActiveSavedBillCount = (bills?: Bill[] | null): number => (
  getUniqueSavedBills(bills).filter(isActiveSavedBill).length
);

export const getSavedBillInitials = (name: string): string => {
  const words = name
    .replace(INITIALS_PUNCTUATION, ' ')
    .split(/\s+/)
    .filter((word) => word && !INITIALS_IGNORED_WORDS.test(word));

  if (words.length === 0) {
    return 'SB';
  }

  if (words.length === 1) {
    const [word] = words;
    const digitsThenLetters = word.match(/^\d+([A-Za-z])/);
    return (digitsThenLetters ? `${word[0]}${digitsThenLetters[1]}` : word.slice(0, 2)).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const getSavedBillAmount = (bill: Pick<Bill, 'custom_fields'>): string => {
  const explicitAmount = getCustomFieldValue(bill, ['amount', 'amountDue', 'amount_due', 'balance']);
  if (explicitAmount !== undefined) {
    const matchingField = Object.values(bill.custom_fields ?? {}).find(
      (field) => field?.value === explicitAmount,
    );
    return formatMonetaryDisplayValue(explicitAmount, matchingField?.text || 'Amount');
  }

  const amountField = Object.values(bill.custom_fields ?? {}).find(
    (field) => AMOUNT_FIELD_PATTERN.test(field?.text || ''),
  );

  return amountField
    ? formatMonetaryDisplayValue(amountField.value, amountField.text)
    : '—';
};

const parsePesoAmount = (amount: string): number | null => {
  const isPesoAmount = /^(?:₱|PHP\s*)/i.test(amount);
  const isUnprefixedAmount = /^[\d,]+(?:\.\d+)?$/.test(amount);
  if (!isPesoAmount && !isUnprefixedAmount) {
    return null;
  }

  const value = Number(removeCurrencySeparators(amount.replace(/^(?:₱|PHP)\s*/i, '')));
  return Number.isFinite(value) ? value : null;
};

export const getSavedBillAmountValue = (bill: Pick<Bill, 'custom_fields'>): number | null => {
  const amount = getSavedBillAmount(bill).trim();
  return !amount || amount === '—' ? null : parsePesoAmount(amount);
};

export const getSavedBillAmountInput = (bill: Pick<Bill, 'custom_fields'>): string => {
  const value = getSavedBillAmountValue(bill);
  return value !== null && value > 0 ? value.toFixed(2) : '';
};

export const formatSavedBillAmount = (bill: Pick<Bill, 'custom_fields'>): string => {
  const amount = getSavedBillAmount(bill).trim();
  if (!amount || amount === '—') {
    return SAVED_BILL_NO_AMOUNT_LABEL;
  }

  const value = parsePesoAmount(amount);
  return value === null ? amount : formatPesoAmount(value);
};

const parseBillDate = (value?: unknown): Date | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const date = new Date(String(value));
  return isValid(date) ? date : null;
};

export const getSavedBillDueDate = (bill: SavedBillStatusSource): Date | null => (
  parseBillDate(bill.due_date ?? getCustomFieldValue(
    bill,
    ['dueDate', 'due_date', 'paymentDueDate', 'payment_due_date'],
  ))
);

const getSavedBillPaidDate = (bill: SavedBillStatusSource): Date | null => (
  parseBillDate(bill.date_paid || bill.paid_at)
);

export const getBillerStatus = (bill: SavedBillStatusSource, now = new Date()): BillerStatus | null => {
  if (isPaidSavedBill(bill)) {
    const paidDate = getSavedBillPaidDate(bill);
    return { tone: 'paid', label: paidDate ? `Paid ${format(paidDate, SAVED_BILL_DATE_FORMAT)}` : 'Paid' };
  }

  const dueDate = getSavedBillDueDate(bill);
  if (dueDate) {
    const daysOverdue = -differenceInCalendarDays(dueDate, now);
    return daysOverdue > 0
      ? { tone: 'overdue', label: `Overdue ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}`, dueDate }
      : { tone: 'due', label: `Due ${format(dueDate, SAVED_BILL_DATE_FORMAT)}`, dueDate };
  }

  if (bill.date_paid === null || bill.paid_at === null) {
    return { tone: 'none', label: SAVED_BILL_NEVER_PAID_LABEL };
  }

  return null;
};

export const getSavedBillCaption = (bill: SavedBillStatusSource, now = new Date()): string => {
  const status = getBillerStatus(bill, now);
  if (status?.tone === 'paid' || status?.tone === 'overdue' || status?.tone === 'none') {
    return status.label;
  }

  if (status?.dueDate) {
    const daysUntilDue = differenceInCalendarDays(status.dueDate, now);
    if (daysUntilDue === 0) {
      return 'Due today';
    }

    if (daysUntilDue === 1) {
      return 'Due tomorrow';
    }

    return `Due in ${daysUntilDue} days`;
  }

  return getSavedBillStatus(bill) || 'Ready to pay';
};

export const sortSavedBillsByUrgency = (bills: Bill[], now = new Date()): Bill[] => bills
  .map((bill, index) => ({ bill, index, status: getBillerStatus(bill, now) }))
  .sort((a, b) => (
    SAVED_BILL_STATUS_ORDER[a.status?.tone ?? 'none'] - SAVED_BILL_STATUS_ORDER[b.status?.tone ?? 'none']
    || (a.status?.dueDate?.getTime() ?? 0) - (b.status?.dueDate?.getTime() ?? 0)
    || a.index - b.index
  ))
  .map(({ bill }) => bill);

export const getSavedBillNickname = (bill: Pick<Bill, 'billing_name' | 'merchant_name'>): string => (
  bill.billing_name || bill.merchant_name
);

export const getBillerDueSummary = (bills: Bill[], now = new Date()): BillerDueSummary | null => {
  const urgent = sortSavedBillsByUrgency(bills, now)
    .map((bill) => ({ bill, status: getBillerStatus(bill, now) }))
    .filter(({ status }) => status?.tone === 'overdue' || status?.tone === 'due');

  if (urgent.length === 0) {
    return null;
  }

  const nextBill = urgent.find(({ status }) => status?.tone === 'due') ?? urgent[0];
  const nextDueDate = nextBill.status?.dueDate;
  const amounts = urgent.map(({ bill }) => getSavedBillAmountValue(bill));

  return {
    billCount: urgent.length,
    overdueCount: urgent.filter(({ status }) => status?.tone === 'overdue').length,
    total: amounts.reduce((sum: number, amount) => sum + (amount ?? 0), 0),
    knownAmountCount: amounts.filter((amount) => amount !== null).length,
    hasUnknownAmounts: amounts.some((amount) => amount === null),
    next: nextDueDate
      ? { nickname: getSavedBillNickname(nextBill.bill), dueDateLabel: format(nextDueDate, SAVED_BILL_DATE_FORMAT) }
      : null,
  };
};

const readFieldValue = (fields: CustomFields, key: string): string => String(fields?.[key]?.value ?? '').trim();

const getFieldValue = (fields: CustomFields, keys: readonly string[]): { key: string; value: string } | null => {
  const present = keys.filter((key) => fields?.[key] !== undefined && fields?.[key] !== null);
  const key = present.find((candidate) => readFieldValue(fields, candidate)) ?? present[0];
  return key === undefined ? null : { key, value: readFieldValue(fields, key) };
};

export const getSavedBillContractNumber = (bill: Pick<Bill, 'custom_fields'>): string => {
  const value = getCustomFieldValue(bill, SAVED_BILL_CONTRACT_KEYS);
  return value == null ? '' : String(value).trim();
};

export const getSavedBillSubtitle = (bill: SavedBillSummarySource): string => {
  const contractTail = getSavedBillContractNumber(bill).replace(/\W/g, '').slice(-4);
  return [bill.merchant_name, contractTail ? `Contract •••• ${contractTail}` : '']
    .filter(Boolean)
    .join(' · ');
};

export const getBillerSummaryRows = (bill: SavedBillSummarySource): BillerSummaryRows => {
  const fields = bill.custom_fields ?? {};
  const used = new Set<string>(BILLER_SUMMARY_HIDDEN_KEYS);
  const clientNotes = bill.client_notes?.trim() || getFieldValue(fields, ['clientNotes'])?.value || '';
  used.add('clientNotes');

  const fromFields = ({ id, label, keys }: { id: string; label: string; keys: readonly string[] }): BillerSummaryRow => {
    const hit = getFieldValue(fields, keys);
    keys.forEach((key) => used.add(key));
    return { id, label, value: hit?.value ?? '' };
  };

  const mobile = (() => {
    const [numberKey, codeKey, ownerKey] = BILLER_SUMMARY_MOBILE_KEYS;
    const number = getFieldValue(fields, [numberKey, ownerKey]);
    BILLER_SUMMARY_MOBILE_KEYS.forEach((key) => used.add(key));
    return number ? formatMobileNumber(number.value, getFieldValue(fields, [codeKey])?.value) : null;
  })();

  const primary = BILLER_SUMMARY_PRIMARY_ROWS.map(fromFields);
  const secondary = BILLER_SUMMARY_SECONDARY_ROWS.map((row): BillerSummaryRow => {
    switch (row.id) {
      case 'billName':
        return { id: row.id, label: row.label, value: bill.billing_name || getFieldValue(fields, ['billName'])?.value || '' };
      case 'payee':
        return { id: row.id, label: row.label, value: bill.merchant_name };
      case 'mobile':
        return { id: row.id, label: row.label, value: mobile ?? '' };
      case 'clientNotes':
        return { id: row.id, label: row.label, value: clientNotes };
      default:
        return fromFields({ id: row.id, label: row.label, keys: 'keys' in row ? row.keys : [] });
    }
  });
  used.add('billName');

  const extras = Object.entries(fields)
    .filter(([key, field]) => !used.has(key) && String(field?.value ?? '').trim())
    .map(([key, field]): BillerSummaryRow => ({ id: key, label: field.text || key, value: String(field.value).trim() }));

  return { primary, secondary: [...secondary, ...extras] };
};
