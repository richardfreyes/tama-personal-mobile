import type { RootState } from '@/redux/storeTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState, SnackbarPayload } from './snackbarTypes';

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<SnackbarPayload>) => {
      state.visible = true;
      state.message = action.payload.message;
      state.variant = action.payload.variant;
    },
    hideSnackbar: (state) => {
      state.visible = false;
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;
export const selectSnackbar = (state: RootState) => state.snackbar;
export const { reducer: snackbarReducer } = snackbarSlice;
export default snackbarReducer;
