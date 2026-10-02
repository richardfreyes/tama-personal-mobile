import type { TransactionSource } from '@/types/transaction';

export const TRANSACTION_HISTORY_PAGE_SIZE = 10;
export const PAYMENT_REQUEST_TIMEOUT_MS = 30_000;
export const PAYMENT_CANCEL_TIMEOUT_MS = 10_000;
export const QRPH_VERIFY_POLL_INTERVAL_MS = 1_000;
export const QRPH_VERIFY_MAX_ATTEMPTS = 6;

export const TRANSACTION_STATUS_GROUPS = {
  SUCCESSFUL: new Set(['successful', 'paid', 'settled', 'captured']),
  INCOMPLETE: new Set(['incomplete', 'pending', 'uncaptured', 'processing', 'submitted']),
  FAILED: new Set(['declined', 'failed', 'cancelled', 'canceled']),
} as const;

export const TRANSACTION_TYPE_OPTIONS: {
  label: string;
  value: TransactionSource;
}[] = [
  { label: 'One Time Payment', value: 'oneTimePayment' },
  { label: 'Enrollment', value: 'enrollment' },
];
