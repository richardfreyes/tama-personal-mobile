import { DEFAULT_ENROLLMENT_TRANSACTION_HISTORY_COUNT, MAX_ENROLLMENT_TRANSACTION_HISTORY_COUNT } from '@/constants/enrollment';
import { API_PATHS } from '@/redux/apiPaths';
import { appApi } from '@/redux/appApi';
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { EnrollmentTransactionHistoryBadRequestError, EnrollmentTransactionHistoryResponse, GetEnrollmentTransactionHistoryParams, NormalizedEnrollmentTransactionHistoryParams } from './enrollmentTransactionHistoryTypes';

const normalizeInteger = (value: number | undefined, fallback: number): number => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.trunc(value);
};

export const normalizeEnrollmentTransactionHistoryParams = (
  params?: GetEnrollmentTransactionHistoryParams | void,
): NormalizedEnrollmentTransactionHistoryParams => {
  const page = Math.max(0, normalizeInteger(params?.page, 0));
  const count = Math.min(
    MAX_ENROLLMENT_TRANSACTION_HISTORY_COUNT,
    Math.max(1, normalizeInteger(params?.count, DEFAULT_ENROLLMENT_TRANSACTION_HISTORY_COUNT)),
  );
  const searchQuery = params?.searchQuery?.trim();

  return {
    page,
    count,
    ...(searchQuery ? { searchQuery } : {}),
  };
};

export const enrollmentTransactionHistoryQueryKeys = {
  all: ['enrollmentTransactionHistory'] as const,
  list: (params?: GetEnrollmentTransactionHistoryParams | void) => {
    const normalized = normalizeEnrollmentTransactionHistoryParams(params);
    return [
      ...enrollmentTransactionHistoryQueryKeys.all,
      normalized.page,
      normalized.count,
      normalized.searchQuery ?? '',
    ] as const;
  },
};

export const buildGetEnrollmentTransactionHistoryRequest = (
  params?: GetEnrollmentTransactionHistoryParams | void,
): FetchArgs => {
  const normalized = normalizeEnrollmentTransactionHistoryParams(params);

  return {
    url: API_PATHS.enrollments.transactions,
    method: 'GET',
    params: normalized,
  };
};

export const transformEnrollmentTransactionHistoryResponse = (
  response: EnrollmentTransactionHistoryResponse,
): EnrollmentTransactionHistoryResponse => response;

export const normalizeEnrollmentTransactionHistoryError = (
  error: FetchBaseQueryError,
): FetchBaseQueryError | EnrollmentTransactionHistoryBadRequestError => {
  if (error.status === 400) {
    return { message: 'Invalid pagination parameters' };
  }

  return error;
};

export const enrollmentTransactionHistoryApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnrollmentTransactionHistory: builder.query<
      EnrollmentTransactionHistoryResponse,
      GetEnrollmentTransactionHistoryParams | void
    >({
      query: buildGetEnrollmentTransactionHistoryRequest,
      serializeQueryArgs: ({ queryArgs }) => enrollmentTransactionHistoryQueryKeys.list(queryArgs),
      transformResponse: transformEnrollmentTransactionHistoryResponse,
      transformErrorResponse: normalizeEnrollmentTransactionHistoryError,
      providesTags: ['Enrollments'],
    }),
  }),
});

export const { useGetEnrollmentTransactionHistoryQuery } = enrollmentTransactionHistoryApi;

export const getEnrollmentTransactionHistory = (
  params?: GetEnrollmentTransactionHistoryParams | void,
) => enrollmentTransactionHistoryApi.endpoints.getEnrollmentTransactionHistory.initiate(params);

export type {
  EnrollmentTransactionHistoryBadRequestError,
  EnrollmentTransactionHistoryPagination,
  EnrollmentTransactionHistoryResponse,
  GetEnrollmentTransactionHistoryParams,
  NormalizedEnrollmentTransactionHistoryParams
} from './enrollmentTransactionHistoryTypes';
