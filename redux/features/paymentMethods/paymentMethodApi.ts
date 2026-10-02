import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { AddCardRequest, AddCardResponse, ChargeDirectDebitIntent, ChargeDirectDebitResponse, DeleteCardPaymentResponse, LinkDirectDebitRequest, LinkDirectDebitResponse, PaymentMethod, ResendDirectDebitOtpRequest, UpdateCardPaymentRequest, UpdateCardPaymentResponse, ValidateDirectDebitOtpRequest, ValidateDirectDebitOtpResponse } from "./paymentMethodTypes";

export const paymentMethodApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => API_PATHS.paymentMethods.get,
      providesTags: ['PaymentMethods'],
      transformResponse: (data: PaymentMethod[]) => data,
    }),
    addCardPayment: builder.mutation<AddCardResponse, AddCardRequest>({
      query: (body) => ({
        url: API_PATHS.paymentMethods.add,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result) => result?.redirect ? [] : ['PaymentMethods'],
    }),
    updateCardPayment: builder.mutation<UpdateCardPaymentResponse, { id: string; payload: UpdateCardPaymentRequest }>({
      query: ({ id, payload }) => ({
        url: API_PATHS.paymentMethods.update(id),
        method: 'PATCH',
        body: payload,
      }),
      async onQueryStarted({ id, payload }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          paymentMethodApi.util.updateQueryData('getPaymentMethods', undefined, (draft) => {
            draft.forEach((paymentMethod) => {
              if (payload.paymentIsPrimary) {
                paymentMethod.isPrimary = String(paymentMethod.referenceId) === String(id);
              } else if (String(paymentMethod.referenceId) === String(id)) {
                paymentMethod.isPrimary = false;
              }
            });
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteCardPayment: builder.mutation<DeleteCardPaymentResponse, { id: string }>({
      query: ({ id }) => ({
        url: API_PATHS.paymentMethods.delete(id),
        method: 'DELETE',
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          paymentMethodApi.util.updateQueryData('getPaymentMethods', undefined, (draft) => {
            const paymentMethodIndex = draft.findIndex(
              (paymentMethod) => String(paymentMethod.referenceId) === String(id),
            );
            if (paymentMethodIndex !== -1) {
              draft.splice(paymentMethodIndex, 1);
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    linkDirectDebit: builder.mutation<LinkDirectDebitResponse, LinkDirectDebitRequest>({
      query: ({ channelCode, isPrimary }) => ({
        url: API_PATHS.paymentMethods.directDebitLink(channelCode),
        method: 'POST',
        body: { isPrimary },
      }),
      // Direct debit is a one-time-payment method, hidden from the saved list, so there
      // is nothing to invalidate here — the charge flow follows the successful callback.
    }),
    chargeDirectDebit: builder.mutation<ChargeDirectDebitResponse, ChargeDirectDebitIntent>({
      query: ({ payload, idempotencyKey }) => ({
        url: API_PATHS.paymentMethods.directDebitCharge,
        method: 'POST',
        timeout: 30000,
        headers: {
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json',
        },
        body: payload,
      }),
    }),
    validateDirectDebitOtp: builder.mutation<ValidateDirectDebitOtpResponse, ValidateDirectDebitOtpRequest>({
      query: (body) => ({
        url: API_PATHS.paymentMethods.directDebitValidateOtp,
        method: 'POST',
        body,
      }),
    }),
    resendDirectDebitOtp: builder.mutation<{ message: string }, ResendDirectDebitOtpRequest>({
      query: (body) => ({
        url: API_PATHS.paymentMethods.directDebitResendOtp,
        method: 'POST',
        body,
      }),
    }),
  })
});

export const {
  useGetPaymentMethodsQuery,
  useAddCardPaymentMutation,
  useUpdateCardPaymentMutation,
  useDeleteCardPaymentMutation,
  useLinkDirectDebitMutation,
  useChargeDirectDebitMutation,
  useValidateDirectDebitOtpMutation,
  useResendDirectDebitOtpMutation,
} = paymentMethodApi;
