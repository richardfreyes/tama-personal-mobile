import type { EnrollmentTransactionHistory } from '@/types/transaction';

export interface EnrollmentTransactionHistoryPagination {
  offset: number;
  limit: number;
  total: number;
}

export interface EnrollmentTransactionHistoryResponse {
  transactions: EnrollmentTransactionHistory[];
  pagination: EnrollmentTransactionHistoryPagination;
}

export interface GetEnrollmentTransactionHistoryParams {
  page?: number;
  count?: number;
  searchQuery?: string;
}

export interface NormalizedEnrollmentTransactionHistoryParams {
  page: number;
  count: number;
  searchQuery?: string;
}

export interface EnrollmentTransactionHistoryBadRequestError {
  message: 'Invalid pagination parameters';
}
