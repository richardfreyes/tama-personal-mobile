import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { TransactionDetail } from "./transactionDetailTypes";

export const transactionDetailApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionDetail: builder.query<TransactionDetail, string>({
      query: (invoiceReferenceId) => API_PATHS.transactions.detail(invoiceReferenceId),
      providesTags: (result, error, invoiceReferenceId) => [
        { type: 'TransactionDetail', id: invoiceReferenceId },
      ],
      transformResponse: (data: TransactionDetail) => data,
    }),
  })
});

export const { useGetTransactionDetailQuery, useLazyGetTransactionDetailQuery } = transactionDetailApi;
