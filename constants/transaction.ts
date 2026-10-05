import { Colors } from '@/styles/common/colors';
import type { TransactionSource, TransactionStatusTone, TransactionStatusToneColors } from '@/types/transaction';
import type { FetchTransactionsParams } from '@/redux/features/transactions/transactionTypes';

export const TRANSACTION_HISTORY_PAGE_SIZE = 10;
export const PAYMENT_REQUEST_TIMEOUT_MS = 30_000;
export const PAYMENT_CANCEL_TIMEOUT_MS = 10_000;
export const QRPH_VERIFY_POLL_INTERVAL_MS = 1_000;
export const QRPH_VERIFY_MAX_ATTEMPTS = 6;
export const DEFAULT_TRANSACTION_LIST_ARGS: FetchTransactionsParams = { page: 1, count: TRANSACTION_HISTORY_PAGE_SIZE, searchQuery: '' };

export const TRANSACTION_STATUS_GROUPS = {
  SUCCESSFUL: new Set(['successful', 'paid', 'settled', 'captured']),
  INCOMPLETE: new Set(['incomplete', 'pending', 'uncaptured', 'processing', 'submitted']),
  FAILED: new Set(['declined', 'failed', 'cancelled', 'canceled']),
} as const;

export const TRANSACTION_STATUS_BADGE_LABELS = {
  pending: 'Pending',
  failed: 'Failed',
} as const;

export const TRANSACTION_STATUS_TONE_COLORS: Record<TransactionStatusTone, TransactionStatusToneColors> = {
  success: {
    backgroundColor: Colors.success01,
    textColor: Colors.dashboardSuccessText,
    dotColor: Colors.success09,
  },
  pending: {
    backgroundColor: Colors.amber02,
    textColor: Colors.maroon10,
    dotColor: Colors.amber10,
  },
  failed: {
    backgroundColor: Colors.error01,
    textColor: Colors.dashboardErrorText,
    dotColor: Colors.error08,
  },
  neutral: {
    backgroundColor: Colors.maroon01,
    textColor: Colors.maroon10,
    dotColor: Colors.maroon07,
  },
};

export const TRANSACTION_TYPE_OPTIONS: {
  label: string;
  value: TransactionSource;
}[] = [
  { label: 'One Time Payment', value: 'oneTimePayment' },
  { label: 'Enrollment', value: 'enrollment' },
];
