import { TRANSACTION_HISTORY_PAGE_SIZE } from '@/constants/transaction';
import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import type { AppThunk } from '@/redux/store';
import type { Transaction } from "@/types";
import { mergeCompletedTransactionIntoPage } from '@/utils/transactionHistory';
import type { CapturePayPalResponse, FetchTransactionsParams, PayTransactionRequest, PayTransactionResponse, PayWithCardPayload, PayWithCardResponse, PayWithPayPalRequest, PayWithPayPalResponse, PayWithQrphRequest, PayWithQrphResponse, RawTransaction, TransactionComputationPayload, TransactionComputationResponse, TransactionsPage, VerifyQrphResponse } from "./transactionTypes";

export const transactionApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<
      TransactionsPage,
      FetchTransactionsParams
    >({
      query: (params) => `${API_PATHS.transactions.base}?page=${Math.max(0, (params.page - 1) * params.count)}&count=${params.count}&searchQuery=${encodeURIComponent(params.searchQuery || '')}`,
      providesTags: ['Transactions'],
      transformResponse: (data: RawTransaction[], _, params) => {
        const totalCount = data.length > 0 ? (data[0].totalCount || data.length) : 0;
        return {
          items: data as Transaction[],
          totalCount: totalCount,
          currentPage: params.page,
        };
      },
    }),
    createTransactionComputation: builder.mutation<
      TransactionComputationResponse,
      TransactionComputationPayload
    >({
      query: (body) => ({
        url: API_PATHS.transactions.base,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Transactions'], 
    }),
    payTransaction: builder.mutation<PayTransactionResponse, PayTransactionRequest>({
      query: ({ transactionId, idempotencyKey }) => ({
        url: API_PATHS.transactions.pay(transactionId),
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json',
        },
      }),
      // The receipt/detail response reconciles the exact completed item into the
      // list cache. Refetching the eventually-consistent list here can cache the
      // previous page and leave transaction history one payment behind.
      invalidatesTags: ['TransactionLast', 'Bills', 'TransactionDetail'],
    }),
    payWithCard: builder.mutation<PayWithCardResponse, { payload: PayWithCardPayload; idempotencyKey: string }>({
      query: ({ payload, idempotencyKey }) => ({
        url: API_PATHS.transactions.payWithCard,
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json',
        },
        body: payload,
      }),
      invalidatesTags: ['TransactionLast', 'Bills', 'TransactionDetail', 'PaymentMethods'],
    }),
    payWithQrph: builder.mutation<PayWithQrphResponse, PayWithQrphRequest>({
      query: ({ payload, idempotencyKey }) => ({
        url: API_PATHS.transactions.payWithQrph,
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json',
        },
        body: payload,
      }),
      invalidatesTags: ['Transactions', 'TransactionLast', 'Bills', 'TransactionDetail'],
    }),
    verifyQrph: builder.mutation<VerifyQrphResponse, string>({
      query: (transactionId) => ({
        url: API_PATHS.transactions.verifyQrph(transactionId),
        method: 'POST',
      }),
      invalidatesTags: ['TransactionLast', 'Bills', 'TransactionDetail'],
    }),
    cancelQrph: builder.mutation<{ message: string }, string>({
      query: (transactionId) => ({
        url: API_PATHS.transactions.cancelQrph(transactionId),
        method: 'POST',
      }),
      invalidatesTags: ['Transactions', 'TransactionLast', 'Bills', 'TransactionDetail'],
    }),
    payWithPayPal: builder.mutation<PayWithPayPalResponse, PayWithPayPalRequest>({
      query: ({ payload, idempotencyKey }) => ({
        url: API_PATHS.transactions.payWithPayPal,
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json',
        },
        body: payload,
      }),
      invalidatesTags: ['Transactions', 'TransactionLast', 'Bills', 'TransactionDetail'],
    }),
    capturePayPal: builder.mutation<CapturePayPalResponse, string>({
      query: (transactionId) => ({
        url: API_PATHS.transactions.capturePayPal(transactionId),
        method: 'POST',
      }),
      invalidatesTags: ['TransactionLast', 'Bills', 'TransactionDetail'],
    }),
    cancelPayPal: builder.mutation<{ message: string }, string>({
      query: (transactionId) => ({
        url: API_PATHS.transactions.cancelPayPal(transactionId),
        method: 'POST',
      }),
      invalidatesTags: ['Transactions', 'TransactionLast', 'Bills', 'TransactionDetail'],
    }),
  })
});

export const {
  useGetTransactionsQuery,
  useCreateTransactionComputationMutation,
  usePayTransactionMutation,
  usePayWithCardMutation,
  usePayWithQrphMutation,
  useVerifyQrphMutation,
  useCancelQrphMutation,
  usePayWithPayPalMutation,
  useCapturePayPalMutation,
  useCancelPayPalMutation,
} = transactionApi;

const DEFAULT_TRANSACTION_LIST_ARGS: FetchTransactionsParams = {
  page: 1,
  count: TRANSACTION_HISTORY_PAGE_SIZE,
  searchQuery: '',
};

const isUnfilteredFirstPage = (params: FetchTransactionsParams): boolean => (
  params.page === 1
  && !params.searchQuery?.trim()
  && !params.statusFilters?.length
  && !params.startDate
  && !params.endDate
);

const transactionListArgsMatch = (
  left: FetchTransactionsParams,
  right: FetchTransactionsParams,
): boolean => (
  left.page === right.page
  && left.count === right.count
  && left.searchQuery === right.searchQuery
);

export const cacheCompletedTransaction = (completedTransaction: Transaction): AppThunk => (
  dispatch,
  getState,
) => {
  const cachedArgs = transactionApi.util.selectCachedArgsForQuery(
    getState(),
    'getTransactions',
  ).filter(isUnfilteredFirstPage);
  const targetArgs = [...cachedArgs];

  if (!targetArgs.some((params) => (
    transactionListArgsMatch(params, DEFAULT_TRANSACTION_LIST_ARGS)
  ))) {
    targetArgs.push(DEFAULT_TRANSACTION_LIST_ARGS);
  }

  targetArgs.forEach((params) => {
    const cachedPage = transactionApi.endpoints.getTransactions.select(params)(getState()).data;

    if (!cachedPage) {
      void dispatch(transactionApi.util.upsertQueryData(
        'getTransactions',
        params,
        mergeCompletedTransactionIntoPage(
          { items: [], totalCount: 0, currentPage: 1 },
          completedTransaction,
          params.count,
        ),
      ));
      return;
    }

    dispatch(transactionApi.util.updateQueryData('getTransactions', params, (draft) => {
      Object.assign(
        draft,
        mergeCompletedTransactionIntoPage(draft, completedTransaction, params.count),
      );
    }));
  });
};
