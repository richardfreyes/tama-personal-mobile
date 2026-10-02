export interface SnackbarPayload {
  message: string;
  variant: 'success' | 'error';
}

export interface SnackbarState {
  visible: boolean;
  message: string;
  variant: 'success' | 'error';
}

export const initialState: SnackbarState = {
  visible: false,
  message: '',
  variant: 'success',
};