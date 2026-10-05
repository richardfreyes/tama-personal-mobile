import type { RootState } from '@/redux/storeTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState, EnrollmentCardPayload, EnrollmentTransactionResponse } from './reviewTypes';

const enrollmentReviewSlice = createSlice({
  name: 'enrollmentReview',
  initialState,
  reducers: {
    setEnrollmentCardPayload: (state, action: PayloadAction<EnrollmentCardPayload>) => {
      state.cardPayload = action.payload;
    },
    setEnrollmentTransactionResponse: (state, action: PayloadAction<EnrollmentTransactionResponse>) => {
      state.transactionResponse = action.payload;
    },
    clearEnrollmentCardPayload: (state) => {
      state.cardPayload = null;
    },
    clearEnrollmentTransactionResponse: (state) => {
      state.transactionResponse = null;
    },
    triggerEnrollmentFormReset: (state) => {
      state.formResetKey += 1;
    },
  },
});

export const { setEnrollmentCardPayload, setEnrollmentTransactionResponse, clearEnrollmentCardPayload, clearEnrollmentTransactionResponse, triggerEnrollmentFormReset } = enrollmentReviewSlice.actions;
export const selectEnrollmentReview = (state: RootState) => state.enrollmentReview;
export const { reducer: enrollmentReviewReducer } = enrollmentReviewSlice;
export default enrollmentReviewReducer;
