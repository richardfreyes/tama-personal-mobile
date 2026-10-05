import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { configureStore } from '@reduxjs/toolkit';
import csrfReducer, { selectCsrf, setXsrfToken, } from '@/redux/features/csrf/csrfSlice';
import loginReducer, { logout, retrieveToken, setToken, } from '@/redux/features/login/loginApi';
import modalReducer, { hideModal, selectModal, showModal, } from '@/redux/features/modal/modalSlice';
import enrollmentReviewReducer, { clearEnrollmentCardPayload, clearEnrollmentTransactionResponse, selectEnrollmentReview, setEnrollmentCardPayload, setEnrollmentTransactionResponse, triggerEnrollmentFormReset, } from '@/redux/features/enrollments/review/reviewSlice';
import snackbarReducer, { hideSnackbar, selectSnackbar, showSnackbar, } from '@/redux/features/snackbar/snackbarSlice';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn<(...args: any[]) => any>(),
  setItem: jest.fn<(...args: any[]) => any>(),
  removeItem: jest.fn<(...args: any[]) => any>(),
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn<(...args: any[]) => any>(),
  setItemAsync: jest.fn<(...args: any[]) => any>(),
  deleteItemAsync: jest.fn<(...args: any[]) => any>(),
}));

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const secureStorage = SecureStore as jest.Mocked<typeof SecureStore>;
const makeJwt = (payload: object) => `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

describe('Redux state slices', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('sets and clears CSRF state and selects it', () => {
    expect(csrfReducer(undefined, { type: 'unknown' })).toEqual({ xsrfToken: null });
    const state = csrfReducer(undefined, setXsrfToken('csrf'));
    expect(state).toEqual({ xsrfToken: 'csrf' });
    expect(csrfReducer(state, setXsrfToken(null))).toEqual({ xsrfToken: null });
    expect(selectCsrf({ csrf: state } as any)).toBe(state);
  });

  it('shows a fully configured modal and resets every optional field on hide', () => {
    const shown = modalReducer(undefined, showModal({
      id: 'modal-1',
      iconType: 'warning',
      headerMessage: 'Header',
      bodyMessage: 'Body',
      bodyType: 'accountDeletion',
      buttonConfig: { primaryLabel: 'Continue', secondaryLabel: 'Cancel' },
    }));
    expect(shown).toEqual(expect.objectContaining({
      isVisible: true,
      id: 'modal-1',
      iconType: 'warning',
      headerMessage: 'Header',
    }));
    const hidden = modalReducer(shown, hideModal());
    expect(hidden).toEqual({
      isVisible: false,
      dismissible: undefined,
      iconType: undefined,
      headerMessage: undefined,
      bodyMessage: undefined,
      bodyType: undefined,
      buttonConfig: undefined,
      id: undefined,
    });
    expect(selectModal({ modal: shown } as any)).toBe(shown);
  });

  it('shows and hides snackbar while retaining its last message', () => {
    const shown = snackbarReducer(undefined, showSnackbar({
      message: 'Saved',
      variant: 'success',
    }));
    expect(shown).toEqual({ visible: true, message: 'Saved', variant: 'success' });
    const hidden = snackbarReducer(shown, hideSnackbar());
    expect(hidden).toEqual({ visible: false, message: 'Saved', variant: 'success' });
    expect(selectSnackbar({ snackbar: shown } as any)).toBe(shown);
  });

  it('sets, clears, selects, and increments enrollment review state', () => {
    const card = {
      creditCardNumber: '4111111111111111',
      expiryDate: '12/40',
      cardSecurityCode: '123',
      cardholderName: 'Ada Lovelace',
      cardOrigin: 'PH',
      billingStreet: 'Street',
      billingCity: 'City',
      billingState: 'State',
      billingCountry: 'Philippines',
      billingCountryCode: 'PH',
      billingPostalCode: '1200',
    };
    const transaction = {
      merchantId: 'merchant',
      message: 'Created',
      status: 'created',
      transactionId: 'transaction',
      xsrfKey: 'xsrf',
    };
    let state = enrollmentReviewReducer(undefined, setEnrollmentCardPayload(card));
    state = enrollmentReviewReducer(state, setEnrollmentTransactionResponse(transaction));
    state = enrollmentReviewReducer(state, triggerEnrollmentFormReset());
    state = enrollmentReviewReducer(state, triggerEnrollmentFormReset());
    expect(state).toEqual({ cardPayload: card, transactionResponse: transaction, formResetKey: 2 });
    expect(selectEnrollmentReview({ enrollmentReview: state } as any)).toBe(state);
    state = enrollmentReviewReducer(state, clearEnrollmentCardPayload());
    state = enrollmentReviewReducer(state, clearEnrollmentTransactionResponse());
    expect(state).toEqual({ cardPayload: null, transactionResponse: null, formResetKey: 2 });
  });

  it('sets decoded login state, persists the token, and logs out', () => {
    const token = makeJwt({
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: 'ada@example.com',
    });
    const loggedIn = loginReducer(undefined, setToken(token));
    expect(loggedIn).toMatchObject({
      loading: 'succeeded',
      token,
      user: {
        firstName: 'Ada',
        username: 'ada@example.com',
      },
      error: null,
    });
    expect(secureStorage.setItemAsync).toHaveBeenCalledWith('wiremo.token', token);

    expect(loginReducer(loggedIn, logout())).toMatchObject({
      token: null,
      user: null,
      loading: 'idle',
      error: null,
    });
    expect(secureStorage.deleteItemAsync).toHaveBeenCalledWith('wiremo.token');
  });

  it('handles token retrieval loading, success, empty, and storage failure', async () => {
    secureStorage.getItemAsync.mockResolvedValue(null);
    const store = configureStore({ reducer: loginReducer });
    const token = makeJwt({ username: 'ada@example.com' });
    let resolveStorage!: (value: string | null) => void;
    storage.getItem.mockReturnValueOnce(new Promise((resolve) => {
      resolveStorage = resolve;
    }) as any);
    const pending = store.dispatch(retrieveToken());
    expect(store.getState().loading).toBe('pending');
    resolveStorage(token);
    await pending;
    expect(store.getState()).toMatchObject({ token, loading: 'succeeded' });

    storage.getItem.mockResolvedValueOnce(null);
    await store.dispatch(retrieveToken());
    expect(store.getState()).toMatchObject({ token: null, user: null, loading: 'idle' });

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    storage.getItem.mockRejectedValueOnce(new Error('storage unavailable'));
    await store.dispatch(retrieveToken());
    expect(store.getState()).toMatchObject({ token: null, loading: 'idle' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('handles the rejected retrieve action branch', () => {
    const initial = {
      ...loginReducer(undefined, { type: 'unknown' }),
      token: 'stale',
      user: { username: 'stale@example.com' },
    } as any;
    const rejected = loginReducer(initial, retrieveToken.rejected(new Error('failed'), 'request'));
    expect(rejected).toMatchObject({
      loading: 'failed',
      token: null,
      user: null,
    });
  });
});
