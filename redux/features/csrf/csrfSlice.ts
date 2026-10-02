import { RootState } from '@/redux/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CsrfState {
  xsrfToken: string | null;
}

const initialState: CsrfState = {
  xsrfToken: null,
};

const csrfSlice = createSlice({
  name: 'csrf',
  initialState,
  reducers: {
    setXsrfToken: (state, action: PayloadAction<string | null>) => {
      state.xsrfToken = action.payload;
    },
  },
});

export const { setXsrfToken } = csrfSlice.actions;
export const selectCsrf = (state: RootState) => state.csrf;
export const { reducer: csrfReducer } = csrfSlice;
export default csrfReducer;
