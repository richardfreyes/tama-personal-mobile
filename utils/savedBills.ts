import { ENV_CONFIG } from '@/constants/env';
import { MOCK_SAVED_BILLS } from '@/__mocks__/data/mockSavedBills';
import { AMOUNT_FIELD_PATTERN, AVATAR_COLORS, INACTIVE_STATUS_PATTERN, PAID_STATUS_PATTERN } from '@/constants/savedBills';
import type { Bill } from '@/redux/features/bills/billsTypes';
import { formatMonetaryDisplayValue } from '@/utils/format';
import { format, isValid, startOfDay } from 'date-fns';

const getCustomFieldValue = (bill: Bill, keys: string[]): any => {
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

export const getSavedBillStatus = (bill: Bill): string => {
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

export const isPaidSavedBill = (bill: Bill): boolean => (
  Boolean(bill.date_paid || bill.paid_at) || PAID_STATUS_PATTERN.test(getSavedBillStatus(bill))
);

export const isActiveSavedBill = (bill: Bill): boolean => {
  if (bill.is_active === false || isPaidSavedBill(bill)) {
    return false;
  }

  return !INACTIVE_STATUS_PATTERN.test(getSavedBillStatus(bill));
};

export const getActiveSavedBillCount = (bills?: Bill[] | null): number => (
  getUniqueSavedBills(bills).filter(isActiveSavedBill).length
);

export const getSavedBillInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return 'SB';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const getSavedBillAvatarColor = (bill: Bill): string => {
  const seed = `${bill.billing_name || ''}${bill.merchant_name || ''}`;
  const hash = Array.from(seed).reduce(
    (value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0,
    0,
  );

  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const getSavedBillAmount = (bill: Bill): string => {
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

const getSavedBillDueDate = (bill: Bill): Date | null => {
  const dueDateValue = bill.due_date ?? getCustomFieldValue(
    bill,
    ['dueDate', 'due_date', 'paymentDueDate', 'payment_due_date'],
  );

  if (!dueDateValue) {
    return null;
  }

  const date = new Date(String(dueDateValue));
  return isValid(date) ? date : null;
};

export const getSavedBillCaption = (bill: Bill, now = new Date()): string => {
  const paidDateValue = bill.date_paid || bill.paid_at;
  if (isPaidSavedBill(bill)) {
    if (paidDateValue) {
      const paidDate = new Date(paidDateValue);
      if (isValid(paidDate)) {
        return `Paid ${format(paidDate, 'MMM d')}`;
      }
    }

    return getSavedBillStatus(bill) || 'Paid';
  }

  const dueDate = getSavedBillDueDate(bill);
  if (dueDate) {
    const today = startOfDay(now);
    const dueDay = startOfDay(dueDate);
    const daysUntilDue = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);

    if (daysUntilDue < 0) {
      const daysOverdue = Math.abs(daysUntilDue);
      return `Overdue ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}`;
    }

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
