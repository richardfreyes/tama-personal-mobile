import { ENV_CONFIG } from '@/constants';
import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { router } from 'expo-router';
import { clearSession } from './features/login/loginApi';
import { showModal } from './features/modal/modalSlice';
import type { RootState } from './storeTypes';

console.info('Using API base URL:', ENV_CONFIG.base);

export const baseQuery = fetchBaseQuery({
  baseUrl: ENV_CONFIG.base,
  timeout: 30000,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).login.token;
    headers.set('x-tama-client', 'beta-mobile-app');

    headers.set('X-Client-Platform', 'mobile');
    headers.set('accept', 'application/json');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithAuth: typeof baseQuery = async (args, api, extraOptions) => {
  const endpoint = typeof args === 'string' ? args : args.url;
  const method = typeof args === 'string' ? 'GET' : (args.method || 'GET');
  const body = typeof args === 'string' ? undefined : args.body;

  if (__DEV__) {

  }

  let result = await baseQuery(args, api, extraOptions);

  if (__DEV__) {
    const status = result.meta?.response?.status ?? (result.error && 'status' in (result.error as any) ? (result.error as any).status : 'unknown');

    if (result.error) {
      const errorData = 'data' in (result.error as any) ? (result.error as any).data : result.error;
      const isPendingPayment = status === 409
        && typeof errorData === 'object'
        && errorData !== null
        && 'code' in errorData
        && errorData.code === 'PAYMENT_PENDING';

      if (isPendingPayment) {

        console.info(`[API Pending] ${method} ${endpoint}`);
      } else {
        console.error(
          `[API Error] ${method} ${endpoint}`,
          '\n  Status:', status,
          '\n  Error code:', typeof errorData === 'object' && errorData && 'code' in errorData ? errorData.code : 'unknown',
        );
      }
    } else {

    }
  }

  if (result.error && (result.error as FetchBaseQueryError).status === 401) {
    const token = (api.getState() as RootState).login.token;
    if(token) {
      await api.dispatch(clearSession());
      await api.dispatch(showModal({
        iconType: 'info',
        headerMessage: 'Logged Out',
        bodyMessage: 'For your security, we logged you out. Please log in again.',
        buttonConfig: {
          primaryLabel: 'OK',
          direction: 'row'
        }
      }));
      router.replace('/login');
    }
  }

  return result;
};

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'Transactions', 
    'PaymentMethods', 
    'Billers', 
    'Bills', 
    'BillerFormConfig', 
    'Profile', 
    'TransactionDetail', 
    'BillDetail', 
    'TransactionLast', 
    'Auth',
    'Merchants',
    'Enrollments',
  ],
  endpoints: () => ({}),
});
