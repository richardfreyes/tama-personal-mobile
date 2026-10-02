import { RootState } from '@/redux/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState, ShowModalPayload } from './modalTypes';

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<ShowModalPayload>) => {
      state.isVisible = true;
      state.dismissible = action.payload.dismissible;
      state.iconType = action.payload.iconType;
      state.headerMessage = action.payload.headerMessage;
      state.bodyMessage = action.payload.bodyMessage;
      state.bodyType = action.payload.bodyType;
      state.buttonConfig = action.payload.buttonConfig;
      state.id = action.payload.id;
    },
    hideModal: (state) => {
      state.isVisible = false;
      state.dismissible = undefined;
      state.iconType = undefined;
      state.headerMessage = undefined;
      state.bodyMessage = undefined;
      state.bodyType = undefined;
      state.buttonConfig = undefined;
      state.id = undefined;
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;
export const selectModal = (state: RootState) => state.modal;
export const { reducer: modalReducer } = modalSlice;
export default modalReducer;
