import { TRANSACTION_STATUS_GROUPS } from '@/constants/transaction';

const normalizeStatus = (status?: string | null): string => status?.toLowerCase() || '';

export const isConfirmedPaymentStatus = (status?: string | null): boolean => (
  ['successful', 'done', 'settled', 'captured', 'paid'].includes(normalizeStatus(status))
);

export const isFailedPaymentStatus = (status?: string | null): boolean => (
  TRANSACTION_STATUS_GROUPS.FAILED.has(normalizeStatus(status))
);

export const isProcessingPaymentStatus = (status?: string | null): boolean => (
  !isConfirmedPaymentStatus(status) && !isFailedPaymentStatus(status)
);
