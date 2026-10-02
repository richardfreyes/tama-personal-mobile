import type { RootState } from '@/redux/store';
import type { Enrollment } from '@/types/enrollment';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './enrollmentSelectionTypes';

const enrollmentSelectionSlice = createSlice({
  name: 'enrollmentSelection',
  initialState,
  reducers: {
    setSelectedEnrollment: (state, action: PayloadAction<Enrollment>) => {
      state.selectedEnrollment = action.payload;
    },
    clearSelectedEnrollment: (state) => {
      state.selectedEnrollment = null;
    },
  },
});

export const { clearSelectedEnrollment, setSelectedEnrollment } = enrollmentSelectionSlice.actions;
export const selectSelectedEnrollment = (state: RootState) => state.enrollmentSelection.selectedEnrollment;
export const { reducer: enrollmentSelectionReducer } = enrollmentSelectionSlice;
export default enrollmentSelectionReducer;
