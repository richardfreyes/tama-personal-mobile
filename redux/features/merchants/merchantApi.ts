import { API_PATHS } from "@/redux/apiPaths";
import { appApi, baseQueryWithAuth } from "@/redux/appApi";
import { CreateMerchantEnrollmentRequest, CreateMerchantTransactionRequest, MerchantEnrollmentDetailResponse, MerchantEnrollmentEnrollResponse, MerchantEnrollmentReceiptResponse, MerchantEnrollmentResponse, MerchantFormConfigResponse, MerchantLandingConfig, MerchantPaymentsResponse, MerchantPaymentTypesResponse, MerchantReceiptKeysResponse, MerchantReceiptResponse, MerchantsResponse, MerchantTransactionDetailResponse, MerchantTransactionPaymentBinResponse, MerchantTransactionPaymentCkoPayload, MerchantTransactionPaymentCkoResponse, MerchantTransactionPaymentVaultPayload, MerchantTransactionPaymentVaultResponse, MerchantTransactionResponse } from "./merchantTypes";

export const merchantApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getMerchants: builder.query<MerchantsResponse, string>({
      query: () => API_PATHS.merchant.get,
      providesTags: ['Merchants'],
    }),
    getMerchantPayment: builder.query<MerchantPaymentsResponse, string>({
      queryFn: async (merchantCode, api, extraOptions) => {
        const result = await baseQueryWithAuth(API_PATHS.merchant.getPayment(merchantCode), api, extraOptions);

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as MerchantPaymentsResponse };
      },
    }),
    createMerchantTransaction: builder.mutation<MerchantTransactionResponse, CreateMerchantTransactionRequest>({
      queryFn: async ({ merchantCode, body }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.postTransaction(merchantCode),
          method: 'POST',
          body,
        }, api, extraOptions);

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as MerchantTransactionResponse };
      },
    }),
    createMerchantEnrollment: builder.mutation<MerchantEnrollmentResponse, CreateMerchantEnrollmentRequest>({
      queryFn: async ({ merchantCode, body }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.postEnrollment(merchantCode),
          method: 'POST',
          body,
        }, api, extraOptions);

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as MerchantEnrollmentResponse };
      },
    }),
    getMerchantTransaction: builder.query<MerchantTransactionDetailResponse, { merchantCode: string; transactionId: string; xsrfKey?: string }>({
      queryFn: async ({ merchantCode, transactionId, xsrfKey }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.getTransaction(merchantCode, transactionId),
          method: 'GET',
          headers: { 'Qw-Merchant-Id': merchantCode, ...(xsrfKey ? { 'X-Xsrf-Token': xsrfKey } : {}) },
        }, api, extraOptions);

        if (result.error) { 
          return { error: result.error }; 
        }

        return { data: result.data as MerchantTransactionDetailResponse };
      },
    }),
    getMerchantEnrollment: builder.query<MerchantEnrollmentDetailResponse, { merchantCode: string; enrollmentId: string; xsrfKey?: string }>({
      queryFn: async ({ merchantCode, enrollmentId, xsrfKey }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.getEnrollment(merchantCode, enrollmentId),
          method: 'GET',
          headers: { 'Qw-Merchant-Id': merchantCode, ...(xsrfKey ? { 'X-Xsrf-Token': xsrfKey } : {}) },
        }, api, extraOptions);

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as MerchantEnrollmentDetailResponse };
      },
    }),
    getMerchantTransactionPaymentBin: builder.query<MerchantTransactionPaymentBinResponse, { merchantCode: string; transactionId: string; xsrfKey?: string; binNumber: string; }>({
      queryFn: async ({ merchantCode, transactionId, xsrfKey, binNumber }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.getTransactionPaymentBin(merchantCode, transactionId, binNumber),
          method: 'GET',
          headers: { 'Qw-Merchant-Id': merchantCode, ...(xsrfKey ? { 'X-Xsrf-Token': xsrfKey } : {})},
        }, api, extraOptions);

        if (result.error) { return { error: result.error }; }

        return { data: result.data as MerchantTransactionPaymentBinResponse };
      },
    }),
    getMerchantEnrollmentPaymentBin: builder.query<MerchantTransactionPaymentBinResponse, { merchantCode: string; transactionId: string; xsrfKey?: string; binNumber: string; }>({
      queryFn: async ({ merchantCode, transactionId, xsrfKey, binNumber }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.getEnrollmentPaymentBin(merchantCode, transactionId, binNumber),
          method: 'GET',
          headers: { 'Qw-Merchant-Id': merchantCode, ...(xsrfKey ? { 'X-Xsrf-Token': xsrfKey } : {})},
        }, api, extraOptions);

        if (result.error) { return { error: result.error }; }

        return { data: result.data as MerchantTransactionPaymentBinResponse };
      },
    }),
    getMerchantReceipt: builder.query<MerchantReceiptResponse, { merchantCode: string; referenceId: string; accessSignature?: string; accessType?: string; }>({
      queryFn: async ({ merchantCode, referenceId, accessSignature, accessType = 'view' }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.getReceipt(merchantCode, referenceId),
          method: 'GET',
          headers: { 'Qw-Merchant-Id': merchantCode, ...(accessSignature ? { accesssignature: accessSignature } : {}), ...(accessType ? { accesstype: accessType } : {})},
        }, api, extraOptions);

        if (result.error) { return { error: result.error }; }

        return { data: result.data as MerchantReceiptResponse };
      },
    }),
    getMerchantEnrollmentReceipt: builder.query<MerchantEnrollmentReceiptResponse, { merchantCode: string; referenceId: string; accessSignature?: string; accessType?: string; }>({
      queryFn: async ({ merchantCode, referenceId, accessSignature, accessType = 'view' }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.getEnrollmentReceipt(merchantCode, referenceId),
          method: 'GET',
          headers: { 'Qw-Merchant-Id': merchantCode, ...(accessSignature ? { accessSignature } : {}), ...(accessType ? { accessType } : {}) },
        }, api, extraOptions);

        if (result.error) { return { error: result.error }; }

        return { data: result.data as MerchantEnrollmentReceiptResponse };
      },
    }),
    getMerchantReceiptKeys: builder.query<MerchantReceiptKeysResponse, { merchantCode: string; transactionId: string }>({
      queryFn: async ({ merchantCode, transactionId }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.getReceiptKeys(merchantCode, transactionId),
          method: 'GET',
          headers: { 'Qw-Merchant-Id': merchantCode, },
        }, api, extraOptions);

        if (result.error) { return { error: result.error }; }

        return { data: result.data as MerchantReceiptKeysResponse };
      },
    }),
    createMerchantTransactionPaymentCko: builder.mutation<MerchantTransactionPaymentCkoResponse,{ merchantCode: string; transactionId: string; xsrfKey?: string; body: MerchantTransactionPaymentCkoPayload; idempotencyKey: string; }>({
      queryFn: async ({ merchantCode, transactionId, xsrfKey, body, idempotencyKey }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.postTransactionPaymentCko(merchantCode, transactionId),
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Qw-Merchant-Id': merchantCode, ...(xsrfKey ? { 'X-Xsrf-Token': xsrfKey } : {}), 'Idempotency-Key': idempotencyKey },
          body,
        }, api, extraOptions);

        if (result.error) { return { error: result.error }; }

        return {
          data: {
            ...(result.data as MerchantTransactionPaymentCkoResponse),
            httpStatus: result.meta?.response?.status,
          },
        };
      },
    }),
    createMerchantTransactionPaymentVault: builder.mutation<MerchantTransactionPaymentVaultResponse, { merchantCode: string; transactionId: string; xsrfKey?: string; body: MerchantTransactionPaymentVaultPayload; idempotencyKey: string; }>({
      queryFn: async ({ merchantCode, transactionId, xsrfKey, body, idempotencyKey }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.postTransactionPaymentVault(
            merchantCode,
            transactionId
          ),
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Qw-Merchant-Id': merchantCode, ...(xsrfKey ? { 'X-Xsrf-Token': xsrfKey } : {}), 'Idempotency-Key': idempotencyKey },
          body,
        }, api, extraOptions);

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: {
            ...(result.data as MerchantTransactionPaymentVaultResponse),
            httpStatus: result.meta?.response?.status,
          },
        };
      },
    }),
    createMerchantEnrollmentPaymentVault: builder.mutation<MerchantTransactionPaymentVaultResponse, { merchantCode: string; enrollmentId: string; xsrfKey?: string; body: MerchantTransactionPaymentVaultPayload; idempotencyKey: string; }>({
      queryFn: async ({ merchantCode, enrollmentId, xsrfKey, body, idempotencyKey }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.postEnrollmentPaymentVault(merchantCode, enrollmentId),
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Qw-Merchant-Id': merchantCode, ...(xsrfKey ? { 'X-Xsrf-Token': xsrfKey } : {}), 'Idempotency-Key': idempotencyKey },
          body,
        }, api, extraOptions);

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: {
            ...(result.data as MerchantTransactionPaymentVaultResponse),
            httpStatus: result.meta?.response?.status,
          },
        };
      },
    }),
    createMerchantEnrollmentEnroll: builder.mutation<MerchantEnrollmentEnrollResponse, { merchantCode: string; enrollmentId: string; xsrfKey?: string; idempotencyKey: string; }>({
      queryFn: async ({ merchantCode, enrollmentId, xsrfKey, idempotencyKey }, api, extraOptions) => {
        const result = await baseQueryWithAuth({
          url: API_PATHS.merchant.postEnrollmentEnroll(merchantCode, enrollmentId),
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Qw-Merchant-Id': merchantCode, ...(xsrfKey ? { 'X-Xsrf-Token': xsrfKey } : {}), 'Idempotency-Key': idempotencyKey },
        }, api, extraOptions);

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: {
            ...(result.data as MerchantEnrollmentEnrollResponse),
            httpStatus: result.meta?.response?.status,
          },
        };
      },
    }),
    getMerchantLandingConfig: builder.query<MerchantLandingConfig, string>({
      queryFn: async (merchantCode, api, extraOptions) => {
        const path = API_PATHS.merchant.getLandingConfig(merchantCode);
        const result = await baseQueryWithAuth(path, api, extraOptions);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data as MerchantLandingConfig };
      },
    }),
    getMerchantPaymentTypes: builder.query<MerchantPaymentTypesResponse, string>({
      queryFn: async (merchantCode, api, extraOptions) => {
        const path = API_PATHS.merchant.getPaymentTypes(merchantCode);
        const result = await baseQueryWithAuth(path, api, extraOptions);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data as MerchantPaymentTypesResponse };
      },
    }),
    getMerchantPaymentFormConfig: builder.query<MerchantFormConfigResponse, string>({
      queryFn: async (merchantCode, api, extraOptions) => {
        const path = API_PATHS.merchant.getPaymentFormConfig(merchantCode);
        const result = await baseQueryWithAuth(path, api, extraOptions);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data as MerchantFormConfigResponse };
      },
    }),
    getMerchantEnrollmentFormConfig: builder.query<MerchantFormConfigResponse, string>({
      queryFn: async (merchantCode, api, extraOptions) => {
        const path = API_PATHS.merchant.getEnrollmentFormConfig(merchantCode);
        const result = await baseQueryWithAuth(path, api, extraOptions);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data as MerchantFormConfigResponse };
      },
    }),
    getMerchantProjects: builder.query<any, string>({
      queryFn: async (merchantCode, api, extraOptions) => {
        const path = API_PATHS.merchant.getProjects(merchantCode);
        const result = await baseQueryWithAuth(path, api, extraOptions);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data };
      },
    }),
    getMerchantById: builder.query<any, string>({
      queryFn: async (merchantCode, api, extraOptions) => {
        const path = API_PATHS.merchant.getMerchantById(merchantCode);
        const result = await baseQueryWithAuth(path, api, extraOptions);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data };
      },
    }),
  }),
  overrideExisting: true,
});

export const { 
  useGetMerchantsQuery, 
  useGetMerchantPaymentQuery,
  useCreateMerchantTransactionMutation,
  useCreateMerchantEnrollmentMutation,
  useGetMerchantTransactionQuery,
  useLazyGetMerchantTransactionQuery,
  useLazyGetMerchantEnrollmentQuery,
  useLazyGetMerchantTransactionPaymentBinQuery,
  useLazyGetMerchantEnrollmentPaymentBinQuery,
  useGetMerchantReceiptQuery,
  useGetMerchantEnrollmentReceiptQuery,
  useLazyGetMerchantEnrollmentReceiptQuery,
  useGetMerchantReceiptKeysQuery,
  useLazyGetMerchantReceiptKeysQuery,
  useCreateMerchantTransactionPaymentCkoMutation,
  useCreateMerchantTransactionPaymentVaultMutation,
  useCreateMerchantEnrollmentPaymentVaultMutation,
  useCreateMerchantEnrollmentEnrollMutation,
  useGetMerchantLandingConfigQuery,
  useGetMerchantPaymentTypesQuery,
  useGetMerchantPaymentFormConfigQuery,
  useGetMerchantEnrollmentFormConfigQuery,
  useGetMerchantProjectsQuery,
  useGetMerchantByIdQuery,
} = merchantApi;
