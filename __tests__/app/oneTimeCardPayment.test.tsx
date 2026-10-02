import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import FormDetails from '@/app/(app)/payment-methods/form-details';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockAddCard = jest.fn<(...args: any[]) => any>();
const mockPayWithCard = jest.fn<(...args: any[]) => any>();
const mockPayTransaction = jest.fn<(...args: any[]) => any>();
const mockUpdateAddress = jest.fn<(...args: any[]) => any>();
const mockRouter = {
  replace: jest.fn<(...args: any[]) => any>(),
  push: jest.fn<(...args: any[]) => any>(),
  navigate: jest.fn<(...args: any[]) => any>(),
  back: jest.fn<(...args: any[]) => any>(),
};
const mockParams: Record<string, any> = {};

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: any[]) => mockRouter.replace(...args),
    push: (...args: any[]) => mockRouter.push(...args),
    navigate: (...args: any[]) => mockRouter.navigate(...args),
    back: (...args: any[]) => mockRouter.back(...args),
  },
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (cb: any) => {
    const React = require('react');
    React.useEffect(() => cb(), []);
  },
}));
jest.mock('@/redux/hooks', () => ({ useAppDispatch: () => mockDispatch }));
jest.mock('@/redux/features/paymentMethods/paymentMethodApi', () => ({
  useAddCardPaymentMutation: () => [mockAddCard, { isLoading: false }],
  useGetPaymentMethodsQuery: () => ({ data: [], isSuccess: true }),
  paymentMethodApi: { util: { invalidateTags: () => ({ type: 'invalidate' }) } },
}));
jest.mock('@/redux/features/transactions/transactionApi', () => ({
  usePayWithCardMutation: () => [mockPayWithCard, { isLoading: false }],
  usePayTransactionMutation: () => [mockPayTransaction, { isLoading: false }],
}));
jest.mock('@/redux/features/enrollments/review/reviewSlice', () => ({
  setEnrollmentCardPayload: (payload: any) => ({ type: 'enrollment/setCard', payload }),
}));
jest.mock('@/redux/features/profile/profileApi', () => ({
  useGetProfileDataQuery: () => ({ data: {}, refetch: jest.fn() }),
  useUpdateAddressMutation: () => [mockUpdateAddress, { isLoading: false }],
}));
jest.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ firstName: 'Ada', lastName: 'Lovelace' }) }));
jest.mock('@/utils/card', () => ({
  detectCardProvider: () => 'visa',
}));
jest.mock('@/utils/paymentMethodForm', () => ({
  validatePaymentMethodForm: () => ({ errors: {}, isValid: true, touched: {} }),
  validatePaymentMethodInput: () => undefined,
  buildAddCardRequestPayload: () => ({
    creditCardNumber: '4242424242424242',
    expiryDate: '12/30',
    cardSecurityCode: '123',
    isPrimary: false,
    bin: '42424242',
    cardProvider: 'visa',
    cardholderName: 'Ada Lovelace',
    cardOrigin: 'PH',
    billingStreet: '1 St',
    billingCity: 'Makati',
    billingState: 'MM',
    billingCountry: 'PH',
    billingCountryCode: 'PH',
    billingPostalCode: '1200',
  }),
  buildEnrollmentCardPayload: () => ({}),
  buildAddressPayload: () => ({}),
  getNormalizedCardNumber: (value: string) => value || '4242424242424242',
  getPaymentOptionByTitle: () => undefined,
  getSavedBillingAddressFormValues: () => ({}),
  PAYMENT_METHOD_PRIORITY_COUNTRIES: ['PH'],
  formatPaymentMethodFieldValue: (_field: string, value: string, cardProvider: string) => ({ cardProvider, value }),
}));
jest.mock('country-state-city', () => ({
  Country: { getAllCountries: () => [] },
  State: { getStatesOfCountry: () => [] },
  City: { getCitiesOfState: () => [] },
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('@/components/layout/OtpWebView', () => ({
  OtpWebView: ({ visible, onSuccess, onComplete, onFailure }: any) => {
    if (!visible) return null;
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Pressable accessibilityRole="button" onPress={onSuccess}><Text>3DS Success</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onFailure}><Text>3DS Declined</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onComplete}><Text>3DS Cancel</Text></Pressable>
      </View>
    );
  },
}));
jest.mock('@/components/forms/NativePicker', () => () => null);
jest.mock('@/components/forms/InputValidationComponent', () => (
  ({ placeholder, value, setValue }: any) => {
    const { TextInput } = require('react-native');
    return <TextInput accessibilityLabel={placeholder} value={value} onChangeText={setValue} />;
  }
));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Nav:${title}`}</Text>;
  }
));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

const resolved = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value) });
const rejected = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue(value) });

describe('one-time card payment (form-details)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    Object.assign(mockParams, {
      apiEnv: 'one-time',
      methodTitle: 'Credit / Debit Card',
      billingReferenceId: 'bill-9',
      baseAmount: '100',
      baseCurrency: 'PHP',
    });
    mockPayWithCard.mockReturnValue(resolved({
      message: 'Payment processed',
      transactionReferenceId: 'txn-1',
      invoiceReferenceId: 'inv-1',
      computation: { totalCurrency: 'PHP', totalAmount: 110 },
    }));
    mockPayTransaction.mockReturnValue(resolved({ message: 'Payment processed' }));
  });

  it('shows the no-save notice and charges without saving (never offering to save)', async () => {
    render(<FormDetails />);
    expect(screen.getByText(/only for this payment/)).toBeTruthy();
    // this entry point never offers to save the card
    expect(screen.queryByRole('checkbox')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Pay Now' }));

    await waitFor(() => expect(mockPayWithCard).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({
        savePaymentMethod: false,
        billingReferenceId: 'bill-9',
        baseAmount: 100,
        baseCurrency: 'PHP',
        creditCardNumber: '4242424242424242',
      }),
    })));
    expect(mockRouter.replace).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: expect.objectContaining({ transactionReferenceId: 'txn-1', invoiceReferenceId: 'inv-1' }),
    }));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({ variant: 'success' }),
    }));
  });

  it('opens the provider 3DS challenge and completes the charge after authentication', async () => {
    mockPayWithCard.mockReturnValue(resolved({
      code: 'CARD_VERIFICATION_REQUIRED',
      redirect: 'https://3ds.example.com/challenge',
      transactionReferenceId: 'txn-1',
      invoiceReferenceId: 'inv-1',
      computation: { totalCurrency: 'PHP', totalAmount: 110 },
    }));
    render(<FormDetails />);

    fireEvent.press(screen.getByRole('button', { name: 'Pay Now' }));

    // the provider-hosted 3DS challenge is shown; success is not declared yet
    await waitFor(() => expect(screen.getByText('3DS Success')).toBeTruthy());
    expect(mockRouter.replace).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('3DS Success'));

    // a card verification only authenticates the card, so the charge runs after 3DS
    await waitFor(() => expect(mockPayTransaction).toHaveBeenCalledWith(expect.objectContaining({ transactionId: 'txn-1' })));
    expect(mockRouter.replace).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/bills/one-time-payments/pay/payment-success',
    }));
  });

  it('does not declare success when the 3DS challenge is cancelled', async () => {
    mockPayWithCard.mockReturnValue(resolved({
      code: 'PAYMENT_VERIFICATION_REQUIRED',
      redirect: 'https://3ds.example.com/challenge',
      transactionReferenceId: 'txn-1',
      invoiceReferenceId: 'inv-1',
      computation: { totalCurrency: 'PHP', totalAmount: 110 },
    }));
    render(<FormDetails />);

    fireEvent.press(screen.getByRole('button', { name: 'Pay Now' }));
    await waitFor(() => expect(screen.getByText('3DS Cancel')).toBeTruthy());

    fireEvent.press(screen.getByText('3DS Cancel'));

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({ variant: 'error' }),
    }));
    expect(mockPayTransaction).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/bills/one-time-payments/pay/payment-success',
    }));
  });

  it('dismisses a declined 3DS challenge and lets the user retry the saved bill payment', async () => {
    mockPayWithCard.mockReturnValue(resolved({
      code: 'CARD_VERIFICATION_REQUIRED',
      redirect: 'https://3ds.example.com/challenge',
      transactionReferenceId: 'txn-1',
      invoiceReferenceId: 'inv-1',
    }));
    render(<FormDetails />);

    fireEvent.press(screen.getByRole('button', { name: 'Pay Now' }));
    await waitFor(() => expect(screen.getByText('3DS Declined')).toBeTruthy());

    fireEvent.press(screen.getByText('3DS Declined'));

    await waitFor(() => expect(screen.queryByText('3DS Declined')).toBeNull());
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({
        message: 'Your card was declined. Please try another card.',
        variant: 'error',
      }),
    }));
    expect(mockPayTransaction).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Pay Now' })).toBeTruthy();
  });

  it('keeps the form and reports the error when a payment fails', async () => {
    mockPayWithCard.mockReturnValue(rejected({ data: { message: 'Card declined' } }));
    render(<FormDetails />);

    fireEvent.press(screen.getByRole('button', { name: 'Pay Now' }));

    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({ message: 'Card declined', variant: 'error' }),
    })));
    // form is preserved (not reset/navigated away) so the user can retry
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(screen.getByText(/only for this payment/)).toBeTruthy();
  });
});

describe('add-and-save payment method return navigation (form-details)', () => {
  const setSaveModeParams = (extra: Record<string, any>) => {
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    Object.assign(mockParams, { methodTitle: 'Credit / Debit Card', ...extra });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateAddress.mockReturnValue(resolved({}));
    mockAddCard.mockReturnValue(resolved({ message: 'Successfully saved card.', referenceId: 'instrument_new' }));
  });

  it('returns to the one-time Biller Details screen and preselects the new card on success', async () => {
    setSaveModeParams({ returnTo: '/bills/one-time-payments/pay/bill_9', billingReferenceId: 'bill_9', returnAmount: '150' });
    render(<FormDetails />);

    fireEvent.press(screen.getByRole('button', { name: 'Save Information' }));

    await waitFor(() => expect(mockAddCard).toHaveBeenCalled());
    expect(mockRouter.replace).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
      params: expect.objectContaining({
        billingReferenceId: 'bill_9',
        amount: '150',
        selectedPaymentMethodReferenceId: 'instrument_new',
      }),
    }));
  });

  it('uses the default destination when there is no return context (settings flow)', async () => {
    setSaveModeParams({});
    render(<FormDetails />);

    fireEvent.press(screen.getByRole('button', { name: 'Save Information' }));

    await waitFor(() => expect(mockAddCard).toHaveBeenCalled());
    expect(mockRouter.replace).toHaveBeenCalledWith('/payment-methods');
  });

  it('rejects an external return destination and uses the default', async () => {
    setSaveModeParams({ returnTo: 'https://evil.example.com', billingReferenceId: 'bill_9' });
    render(<FormDetails />);

    fireEvent.press(screen.getByRole('button', { name: 'Save Information' }));

    await waitFor(() => expect(mockAddCard).toHaveBeenCalled());
    expect(mockRouter.replace).toHaveBeenCalledWith('/payment-methods');
  });

  it('does not navigate away when saving fails', async () => {
    setSaveModeParams({ returnTo: '/bills/one-time-payments/pay/bill_9', billingReferenceId: 'bill_9' });
    mockAddCard.mockReturnValue(rejected({ data: { message: 'Card information already exist' } }));
    render(<FormDetails />);

    fireEvent.press(screen.getByRole('button', { name: 'Save Information' }));

    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({ variant: 'error' }),
    })));
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('leaves the enrollment flow navigation unchanged', () => {
    setSaveModeParams({ apiEnv: 'enrollments', returnTo: '/bills/one-time-payments/pay/bill_9', billingReferenceId: 'bill_9' });
    render(<FormDetails />);

    fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    expect(mockRouter.replace).toHaveBeenCalledWith('/(app)/bills/enrollments/confirm-payment');
    expect(mockAddCard).not.toHaveBeenCalled();
  });
});
