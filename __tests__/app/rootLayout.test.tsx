import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import RootLayout from '@/app/_layout';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import { SplashScreen } from 'expo-router';
import React from 'react';
import { modalActions } from '../../utils/modalActions';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockRouter = { push: jest.fn<(...args: any[]) => any>(), replace: jest.fn<(...args: any[]) => any>() };
const mockFontState = { loaded: true, error: null as any };
const mockSnackbarState = { visible: true, message: 'Saved', variant: 'success' };
type EnrollmentResult = { outcome: string; message: string };
type EnrollmentCallbackHandler = (
  url: string,
  callback: (result: EnrollmentResult) => void,
) => boolean;
const mockHandleEnrollmentCallback = jest.fn<EnrollmentCallbackHandler>(() => false);
type DirectDebitResult = { outcome: string };
type DirectDebitCallbackHandler = (
  url: string,
  callback: (result: DirectDebitResult) => void,
) => boolean;
const mockHandleDirectDebitCallback = jest.fn<DirectDebitCallbackHandler>(() => false);
type PaymentResult = { provider: string; outcome: string; transactionReferenceId?: string };
type PaymentResultCallbackHandler = (
  url: string,
  callback: (result: PaymentResult) => void,
) => boolean;
const mockHandlePaymentResultCallback = jest.fn<PaymentResultCallbackHandler>(() => false);
let mockUrlListener: ((event: { url: string }) => void) | undefined;

jest.mock('@expo-google-fonts/poppins', () => ({
  Poppins_100Thin: 'thin',
  Poppins_200ExtraLight: 'extra-light',
  Poppins_300Light: 'light',
  Poppins_400Regular: 'regular',
  Poppins_500Medium: 'medium',
  Poppins_600SemiBold: 'semi-bold',
  Poppins_700Bold: 'bold',
  Poppins_800ExtraBold: 'extra-bold',
  Poppins_900Black: 'black',
  useFonts: () => [mockFontState.loaded, mockFontState.error],
}));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({
    snackbar: mockSnackbarState,
  }),
}));
jest.mock('@/redux/store', () => ({ store: {} }));
jest.mock('@/styles/theme', () => ({ customTheme: {} }));
jest.mock('@/redux/appApi', () => ({
  appApi: { util: {
    resetApiState: () => ({ type: 'appApi/reset' }),
    invalidateTags: (tags: string[]) => ({ type: 'appApi/invalidateTags', payload: tags }),
  } },
}));
jest.mock('react-redux', () => ({
  Provider: ({ children }: any) => children,
}));
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: ({ children }: any) => <View>{children}</View>,
  };
});
jest.mock('react-native-paper', () => {
  const { View } = require('react-native');
  return {
    PaperProvider: ({ children }: any) => <View>{children}</View>,
    Portal: { Host: ({ children }: any) => <View>{children}</View> },
  };
});
jest.mock('react-native-paper-dates', () => ({
  en: {},
  registerTranslation: jest.fn<(...args: any[]) => any>(),
}));
jest.mock('@/components/layout/ModalComponent', () => (
  () => {
    const { Text } = require('react-native');
    return <Text>Modal</Text>;
  }
));
jest.mock('@/components/layout/SnackBar', () => (
  ({ visible, message, variant, onDismiss }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onDismiss}>
        <Text>{`Snackbar:${visible}:${message}:${variant}`}</Text>
      </Pressable>
    );
  }
));
jest.mock('@/utils/enrollmentCallback', () => ({
  handleEnrollmentBrowserCallback: (
    url: string,
    callback: (result: EnrollmentResult) => void,
  ) => mockHandleEnrollmentCallback(url, callback),
}));
jest.mock('@/utils/directDebitCallback', () => ({
  handleDirectDebitBrowserCallback: (
    url: string,
    callback: (result: DirectDebitResult) => void,
  ) => mockHandleDirectDebitCallback(url, callback),
}));
jest.mock('@/utils/paymentResultCallback', () => ({
  handlePaymentResultBrowserCallback: (
    url: string,
    callback: (result: PaymentResult) => void,
  ) => mockHandlePaymentResultCallback(url, callback),
}));
jest.mock('expo-router', () => ({
  SplashScreen: {
    preventAutoHideAsync: jest.fn<(...args: any[]) => any>(),
    hideAsync: jest.fn<(...args: any[]) => any>(),
  },
  Stack: () => {
    const { Text } = require('react-native');
    return <Text>Stack</Text>;
  },
  useRouter: () => mockRouter,
  useSegments: () => ['(app)', 'dashboard'],
}));
jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn<(...args: any[]) => any>(() => Promise.resolve(null)),
  addEventListener: jest.fn<(...args: any[]) => any>((
    _event: string,
    listener: (event: { url: string }) => void,
  ) => {
    mockUrlListener = listener;
    return { remove: jest.fn<(...args: any[]) => any>() };
  }),
  parse: jest.fn<(...args: any[]) => any>(),
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFontState.loaded = true;
    mockFontState.error = null;
    mockHandleEnrollmentCallback.mockReturnValue(false);
    mockHandleDirectDebitCallback.mockReturnValue(false);
    mockHandlePaymentResultCallback.mockReturnValue(false);
    delete modalActions['enrollment-verification-declined'];
    (Linking.getInitialURL as jest.Mock<(...args: any[]) => any>).mockResolvedValue(null);
  });

  it('waits for fonts when there is no font error', () => {
    mockFontState.loaded = false;
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it('renders global UI, hides splash, and dismisses snackbar through Redux', async () => {
    render(<RootLayout />);
    expect(screen.getByText('Stack')).toBeTruthy();
    expect(screen.getByText('Modal')).toBeTruthy();
    expect(screen.getByText('Snackbar:true:Saved:success')).toBeTruthy();
    await waitFor(() => expect(SplashScreen.hideAsync).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Snackbar:true:Saved:success'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'snackbar/hideSnackbar' });
  });

  it('renders after a font error and still hides splash', async () => {
    mockFontState.loaded = false;
    mockFontState.error = new Error('font unavailable');
    render(<RootLayout />);
    expect(screen.getByText('Stack')).toBeTruthy();
    await waitFor(() => expect(SplashScreen.hideAsync).toHaveBeenCalled());
  });

  it('routes enrollment callbacks through the normalized result screen', () => {
    mockHandleEnrollmentCallback.mockImplementation((_url, callback) => {
      callback({ outcome: 'success', message: 'Verified' });
      return true;
    });
    render(<RootLayout />);
    mockUrlListener?.({ url: 'personaldashboardmob://enrollment-callback' });
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/bills/enrollments/result',
      params: { outcome: 'success', message: 'Verified' },
    });
  });

  it('routes direct debit callbacks through the result screen and refreshes the list', () => {
    mockHandleDirectDebitCallback.mockImplementation((_url, callback) => {
      callback({ outcome: 'success' });
      return true;
    });
    render(<RootLayout />);
    mockUrlListener?.({ url: 'personaldashboardmob://mobile/direct-debit-result?outcome=success' });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'appApi/invalidateTags', payload: ['PaymentMethods'] });
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/payment-methods/direct-debit-result',
      params: { outcome: 'success' },
    });
  });

  it('routes PayPal / QR Ph payment result deep links to the reconciling result screen', () => {
    mockHandlePaymentResultCallback.mockImplementation((_url, callback) => {
      callback({ provider: 'qrph', outcome: 'success', transactionReferenceId: 'txn-1' });
      return true;
    });
    render(<RootLayout />);
    mockUrlListener?.({ url: 'personaldashboardmob://mobile/payment-result?provider=qrph&outcome=success' });
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/payment-methods/payment-result',
      params: { provider: 'qrph', outcome: 'success', transactionReferenceId: 'txn-1' },
    });
  });

  it('shows a declined-enrollment modal and routes its OK action to Payment Methods', () => {
    mockHandleEnrollmentCallback.mockImplementation((_url, callback) => {
      callback({ outcome: 'failure', message: 'Card verification failed' });
      return true;
    });
    render(<RootLayout />);

    mockUrlListener?.({ url: 'personaldashboardmob://enrollment-callback' });

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'modal/showModal',
      payload: expect.objectContaining({
        id: 'enrollment-verification-declined',
        dismissible: false,
        headerMessage: 'Enrollment Declined',
        buttonConfig: { primaryLabel: 'OK' },
      }),
    }));
    expect(mockRouter.replace).not.toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/bills/enrollments/result',
    }));

    modalActions['enrollment-verification-declined']();

    expect(mockRouter.replace).toHaveBeenCalledWith('/(app)/bills/enrollments/payment-method');
  });

  it('routes valid reset-password and change-email deep links', () => {
    (Linking.parse as jest.Mock<(...args: any[]) => any>)
      .mockReturnValueOnce({
        hostname: 'reset-password',
        queryParams: { token: 'TOKEN', code: 'CODE' },
      })
      .mockReturnValueOnce({
        hostname: 'change-email-confirm',
        queryParams: { Otoken: 'OLD', Ntoken: 'NEW', code: 'CODE' },
      });
    render(<RootLayout />);
    mockUrlListener?.({ url: 'personaldashboardmob://reset-password' });
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/(auth)/reset-password/create-new-password?token=TOKEN&code=CODE',
    );

    mockUrlListener?.({ url: 'personaldashboardmob://change-email-confirm' });
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/(auth)/change-email-confirm?Otoken=OLD&Ntoken=NEW&code=CODE',
    );
  });

  it('warns when deep links omit required credentials and removes the listener on cleanup', () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const remove = jest.fn<(...args: any[]) => any>();
    (Linking.addEventListener as jest.Mock<(...args: any[]) => any>).mockImplementationOnce((
      _event: string,
      listener: (event: { url: string }) => void,
    ) => {
      mockUrlListener = listener;
      return { remove };
    });
    (Linking.parse as jest.Mock<(...args: any[]) => any>).mockReturnValue({
      hostname: 'reset-password',
      queryParams: {},
    });
    const { unmount } = render(<RootLayout />);
    mockUrlListener?.({ url: 'personaldashboardmob://reset-password' });
    expect(warning).toHaveBeenCalledWith('Reset password link missing token or code');
    unmount();
    expect(remove).toHaveBeenCalled();
    warning.mockRestore();
  });
});
