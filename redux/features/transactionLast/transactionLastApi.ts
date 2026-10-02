import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { LastTransactionResponse, TransactionLastData } from "./transactionLastTypes";

export const transactionLastApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getLastTransaction: builder.query<TransactionLastData, string>({
      query: (billingReferenceId) => API_PATHS.transactions.last(billingReferenceId),
      providesTags: (result, error, billingReferenceId) => [
        { type: 'TransactionLast', id: billingReferenceId },
      ],
      transformResponse: (response: LastTransactionResponse) => {
        return {
          baseAmount: Number(response.transaction.base_amount), 
          baseCurrency: response.transaction.base_currency,
        } as TransactionLastData;
      },
    }),
  })
});

export const { useGetLastTransactionQuery } = transactionLastApi;
