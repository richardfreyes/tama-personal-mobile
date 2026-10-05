import type { RootState } from '@/redux/storeTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { OneTimePaymentState } from './oneTimePaymentTypes';

const initialState: OneTimePaymentState = {
  lastCompletedInvoiceReferenceId: null,
};

const oneTimePaymentSlice = createSlice({
  name: 'oneTimePayment',
  initialState,
  reducers: {
    oneTimePaymentCompleted: (state, action: PayloadAction<string>) => {
      state.lastCompletedInvoiceReferenceId = action.payload;
    },
  },
});

export const { oneTimePaymentCompleted } = oneTimePaymentSlice.actions;
export const selectLastCompletedInvoiceReferenceId = (state: RootState) => (
  state.oneTimePayment.lastCompletedInvoiceReferenceId
);
export default oneTimePaymentSlice.reducer;
