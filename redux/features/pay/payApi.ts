import { appApi } from '@/redux/appApi';
import { PaymentResponse, PayMutationArgs } from './payTypes';

export const payApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    processPayment: builder.mutation<PaymentResponse, PayMutationArgs>({
      query: ({ transactionReferenceId, payload }) => ({
        url: `v1/transactions/${transactionReferenceId}/pay`, 
        method: 'POST',
        body: payload,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useProcessPaymentMutation } = payApi;