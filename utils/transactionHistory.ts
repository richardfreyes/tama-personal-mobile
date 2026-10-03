import { TRANSACTION_STATUS_BADGE_LABELS, TRANSACTION_STATUS_GROUPS, TRANSACTION_STATUS_TONE_COLORS } from '@/constants/transaction';
import type { TransactionDetail } from '@/redux/features/transactionDetail/transactionDetailTypes';
import type { TransactionsPage } from '@/redux/features/transactions/transactionTypes';
import type { EnrollmentTransactionHistory, Transaction, TransactionStatusTone, UnifiedTransaction } from '@/types';
import { formatMoney, formatPesoAmount } from '@/utils/format';

export const formatTransactionStatus = (status: string): string => (
  status
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
);

// Enrollment statuses are not normalised by the backend, so anything not failed or in flight counts
// as settled; for one-time payments an unrecognised status stays neutral instead of guessing.
export const getTransactionStatusTone = (
  { source, status }: Pick<UnifiedTransaction, 'source' | 'status'>,
): TransactionStatusTone => {
  const key = (status ?? '').toLowerCase();

  if (TRANSACTION_STATUS_GROUPS.FAILED.has(key)) return 'failed';
  if (TRANSACTION_STATUS_GROUPS.INCOMPLETE.has(key)) return 'pending';
  if (source === 'enrollment' || TRANSACTION_STATUS_GROUPS.SUCCESSFUL.has(key)) return 'success';
  return 'neutral';
};

// Settled transactions need no badge, so only the other tones render one.
export const getTransactionStatusBadge = (transaction: UnifiedTransaction) => {
  const tone = getTransactionStatusTone(transaction);
  if (tone === 'success') {
    return null;
  }

  const label = tone === 'neutral'
    ? formatTransactionStatus(transaction.statusLabel || transaction.status || 'Unknown')
    : TRANSACTION_STATUS_BADGE_LABELS[tone];

  return { ...TRANSACTION_STATUS_TONE_COLORS[tone], label };
};

export const formatTransactionDebitAmount = ({ amount, currency }: UnifiedTransaction): string => {
  const magnitude = Math.abs(Number(amount) || 0);
  const formatted = currency.toUpperCase() === 'PHP'
    ? formatPesoAmount(magnitude)
    : formatMoney([currency, magnitude]);

  return `−${formatted}`;
};

const enrollmentBillingName = (transaction: EnrollmentTransactionHistory): string | null => (
  transaction.enrollmentName ?? transaction.billingName ?? transaction.description
);

export const normalizeOneTimePaymentTransaction = ( transaction: Transaction ): UnifiedTransaction => {
  const transactionId = transaction.externalTransactionId || transaction.invoiceReferenceId;

  return {
    key: `oneTimePayment:${transactionId}`,
    source: 'oneTimePayment',
    typeLabel: 'One Time Payment',
    transactionId,
    externalTransactionId: transaction.externalTransactionId,
    detailReferenceId: transaction.invoiceReferenceId,
    invoiceReferenceId: transaction.invoiceReferenceId,
    enrollmentReferenceId: null,
    paymentReferenceId: null,
    billingName: transaction.billingName,
    customerName: transaction.customerName ?? null,
    merchantName: transaction.merchantName,
    merchantLogoUrl: transaction.merchantLogoUrl ?? null,
    amount: transaction.baseAmount,
    currency: transaction.baseCurrency,
    status: transaction.status,
    statusLabel: transaction.status,
    createdAt: transaction.createdAt,
  };
};

export const normalizeEnrollmentTransaction = ( transaction: EnrollmentTransactionHistory ): UnifiedTransaction => {
  const transactionId = transaction.externalTransactionId || String(transaction.enrollmentTransactionId);

  return {
    key: `enrollment:${transaction.enrollmentTransactionId}`,
    source: 'enrollment',
    typeLabel: 'Enrollment',
    transactionId,
    externalTransactionId: transaction.externalTransactionId,
    detailReferenceId: transaction.enrollmentReferenceId || transactionId,
    invoiceReferenceId: transaction.invoiceReferenceId,
    enrollmentReferenceId: transaction.enrollmentReferenceId,
    paymentReferenceId: transaction.paymentReferenceId,
    billingName: enrollmentBillingName(transaction),
    customerName: transaction.customerName ?? null,
    merchantName: transaction.merchantName,
    merchantLogoUrl: transaction.merchantLogoUrl ?? null,
    amount: transaction.baseAmount,
    currency: transaction.baseCurrency,
    status: transaction.paymentStatus,
    statusLabel: transaction.paymentStatusName || transaction.paymentStatus,
    createdAt: transaction.createdAt,
  };
};

const transactionIdentityMatches = (left: Transaction, right: Transaction): boolean => {
  if (left.externalTransactionId && right.externalTransactionId) {
    return left.externalTransactionId === right.externalTransactionId;
  }

  return Boolean(
    left.invoiceReferenceId
    && right.invoiceReferenceId
    && left.invoiceReferenceId === right.invoiceReferenceId
  );
};

const sortRawTransactionsNewestFirst = (transactions: Transaction[]): Transaction[] => (
  [...transactions].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    const safeLeftTime = Number.isNaN(leftTime) ? 0 : leftTime;
    const safeRightTime = Number.isNaN(rightTime) ? 0 : rightTime;
    const leftIdentity = left.externalTransactionId || left.invoiceReferenceId;
    const rightIdentity = right.externalTransactionId || right.invoiceReferenceId;

    return safeRightTime - safeLeftTime || leftIdentity.localeCompare(rightIdentity);
  })
);

export const transactionDetailToListTransaction = (
  detail: TransactionDetail,
  fallbackInvoiceReferenceId: string,
  merchantLogoUrl?: string | null,
): Transaction => {
  const invoiceReferenceId = detail.invoiceReferenceId || fallbackInvoiceReferenceId;

  return {
    externalTransactionId: detail.externalTransactionId || detail.transactionReferenceId || invoiceReferenceId,
    billingName: detail.billingName || detail.name || '',
    invoiceReferenceId,
    merchantName: detail.merchantName,
    merchantLogoUrl: merchantLogoUrl ?? null,
    customerName: detail.billingDetails?.customerName?.value ?? null,
    // Transaction history displays the amount charged to the payment method.
    // The detail endpoint exposes that as total*, while the list endpoint
    // returns the same values in its base* fields.
    baseAmount: detail.totalAmount,
    baseCurrency: detail.totalCurrency,
    status: detail.status,
    createdAt: detail.createdAt || detail.transactionDate,
  };
};

export const mergeCompletedTransactionIntoPage = (
  page: TransactionsPage,
  completedTransaction: Transaction,
  pageSize: number,
): TransactionsPage => {
  const alreadyInPage = page.items.some((item) => (
    transactionIdentityMatches(item, completedTransaction)
  ));
  const uniqueItems = [completedTransaction, ...page.items].filter((item, index, items) => (
    items.findIndex((candidate) => transactionIdentityMatches(candidate, item)) === index
  ));

  return {
    ...page,
    items: sortRawTransactionsNewestFirst(uniqueItems).slice(0, pageSize),
    totalCount: Math.max(
      page.items.length,
      alreadyInPage ? page.totalCount : page.totalCount + 1,
    ),
  };
};

export const mergeTransactions = (
  existing: UnifiedTransaction[],
  incoming: UnifiedTransaction[],
  replace = false,
): UnifiedTransaction[] => {
  const transactions = new Map<string, UnifiedTransaction>();

  if (!replace) {
    existing.forEach((transaction) => transactions.set(transaction.key, transaction));
  }
  incoming.forEach((transaction) => transactions.set(transaction.key, transaction));

  return Array.from(transactions.values());
};

export const sortTransactionsNewestFirst = ( transactions: UnifiedTransaction[] ): UnifiedTransaction[] => (
  [...transactions].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    const safeLeftTime = Number.isNaN(leftTime) ? 0 : leftTime;
    const safeRightTime = Number.isNaN(rightTime) ? 0 : rightTime;

    return safeRightTime - safeLeftTime || left.key.localeCompare(right.key);
  })
);

export const transactionMatchesSearch = ( transaction: UnifiedTransaction, searchQuery: string ): boolean => {
  const normalizedSearch = searchQuery.trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  return [
    transaction.transactionId,
    transaction.externalTransactionId,
    transaction.invoiceReferenceId,
    transaction.enrollmentReferenceId,
    transaction.paymentReferenceId,
    transaction.merchantName,
    transaction.billingName,
    transaction.customerName,
    transaction.status,
    transaction.statusLabel,
    transaction.typeLabel,
  ].some((value) => value != null && String(value).toLowerCase().includes(normalizedSearch));
};
