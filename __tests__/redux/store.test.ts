import { beforeEach, describe, expect, it, jest } from '@jest/globals';
jest.mock('@/ReactotronConfig', () => ({
  __esModule: true,
  default: undefined,
}));

import { store } from '@/redux/store';
import { setXsrfToken } from '@/redux/features/csrf/csrfSlice';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';

describe('application store', () => {
  beforeEach(() => {
    store.dispatch({ type: 'RESET_APP_STATE' });
  });

  it('combines application reducers and handles ordinary actions', () => {
    store.dispatch(setXsrfToken('csrf'));
    store.dispatch(showSnackbar({ message: 'Saved', variant: 'success' }));
    expect(store.getState()).toMatchObject({
      csrf: { xsrfToken: 'csrf' },
      snackbar: { visible: true, message: 'Saved', variant: 'success' },
      enrollmentReview: { cardPayload: null, transactionResponse: null, formResetKey: 0 },
      enrollmentSelection: { selectedEnrollment: null },
    });
  });

  it('resets all application state with RESET_APP_STATE', () => {
    store.dispatch(setXsrfToken('csrf'));
    store.dispatch(showSnackbar({ message: 'Error', variant: 'error' }));
    store.dispatch({ type: 'RESET_APP_STATE' });
    expect(store.getState().csrf.xsrfToken).toBeNull();
    expect(store.getState().snackbar).toEqual({
      visible: false,
      message: '',
      variant: 'success',
    });
  });
});
