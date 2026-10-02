import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { appApi } from './appApi';
import './features/billDetail/billDetailApi';
import './features/biller/billerApi';
import './features/billerForm/billerFormApi';
import './features/bills/billsApi';
import csrfReducer from './features/csrf/csrfSlice';
import './features/enrollments/enrollmentApi';
import enrollmentSelectionReducer from './features/enrollmentSelection/enrollmentSelectionSlice';
import './features/enrollmentTransactionHistory/enrollmentTransactionHistoryApi';
import loginReducer from './features/login/loginApi';
import modalReducer from './features/modal/modalSlice';
import oneTimePaymentReducer from './features/oneTimePayment/oneTimePaymentSlice';
import './features/paymentMethods/paymentMethodApi';
import enrollmentReviewReducer from './features/enrollments/review/reviewSlice';
import './features/profile/profileApi';
import snackbarReducer from './features/snackbar/snackbarSlice';
import './features/transactionDetail/transactionDetailApi';
import './features/transactionLast/transactionLastApi';
import './features/transactions/transactionApi';

const appReducer = combineReducers({
  login: loginReducer,
  csrf: csrfReducer,
  [appApi.reducerPath]: appApi.reducer,
  snackbar: snackbarReducer,
  modal: modalReducer,
  enrollmentReview: enrollmentReviewReducer,
  enrollmentSelection: enrollmentSelectionReducer,
  oneTimePayment: oneTimePaymentReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET_APP_STATE') {
    state = undefined;
  }
  return appReducer(state, action);
};

const reactotron: { createEnhancer?: () => any } | undefined = __DEV__ && Platform.OS !== 'web'
  ? require('../ReactotronConfig').default
  : undefined;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(appApi.middleware),
  enhancers: (getDefaultEnhancers) => {
    if (__DEV__ && reactotron?.createEnhancer) {
      return getDefaultEnhancers().concat(reactotron.createEnhancer());
    }
    return getDefaultEnhancers();
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;
