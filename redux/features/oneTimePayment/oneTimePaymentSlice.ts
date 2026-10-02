import { RootState } from '@/redux/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OneTimePaymentState {
  // Invoice of the last payment that reached the success screen. The pay and
  // confirm screens stay mounted between payments and reset when this changes.
  lastCompletedInvoiceReferenceId: string | null;
}

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
