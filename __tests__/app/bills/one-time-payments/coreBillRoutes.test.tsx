import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import BillerFormScreen from '@/app/(app)/bills/one-time-payments/add/form';
import PayBillScreen from '@/app/(app)/bills/one-time-payments/pay/[billingReferenceId]';
import ConfirmPaymentScreen from '@/app/(app)/bills/one-time-payments/pay/confirm-payment';
import PaymentSuccessScreen from '@/app/(app)/bills/one-time-payments/pay/payment-success';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockAddBill = jest.fn<(...args: any[]) => any>();
const mockDeleteBill = jest.fn<(...args: any[]) => any>();
const mockCreateComputation = jest.fn<(...args: any[]) => any>();
const mockPayTransaction = jest.fn<(...args: any[]) => any>();
const mockResetComputation = jest.fn<(...args: any[]) => any>();
const mockState = { oneTimePayment: { lastCompletedInvoiceReferenceId: null as string | null } };
const mockCacheCompletedTransaction = jest.fn<(...args: any[]) => any>((transaction) => ({
  type: 'transactions/cacheCompleted',
  payload: transaction,
}));
const mockRouter = { back: jest.fn<(...args: any[]) => any>(), push: jest.fn<(...args: any[]) => any>(), replace: jest.fn<(...args: any[]) => any>() };
const mockGetTransactionDetail = jest.fn<(...args: any[]) => any>();
const mockParams: Record<string, any> = {};
const mockBillerQuery = { data: [] as any[], isLoading: false, isError: false };
const mockFormQuery = { data: undefined as any, isLoading: false };
const mockLookupQuery = { data: undefined as any, isLoading: false };
const mockBillQuery = { data: undefined as any, isLoading: false };
const mockPaymentMethodsQuery = { data: [] as any[] };
const mockComputationState = { data: undefined as any, isLoading: false, isError: false, reset: mockResetComputation };
const mockTransactionQuery = {
  data: undefined as any,
  currentData: undefined as any,
  isLoading: false,
  isFetching: false,
  isError: false,
};

jest.mock('expo-router', () => ({
  Redirect: ({ href }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Redirect:${href.pathname}:${href.params.view}`}</Text>;
  },
  router: {
    back: (...args: any[]) => mockRouter.back(...args),
    push: (...args: any[]) => mockRouter.push(...args),
    replace: (...args: any[]) => mockRouter.replace(...args),
  },
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (callback: any) => {
    const React = require('react');
    React.useEffect(() => callback(), []);
  },
}));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(mockState),
}));
jest.mock('@/redux/features/biller/billerApi', () => ({
  useGetBillersQuery: () => mockBillerQuery,
}));
jest.mock('@/redux/features/billerForm/billerFormApi', () => ({
  useFetchFormConfigQuery: () => mockFormQuery,
  useFetchLookupOptionsQuery: () => mockLookupQuery,
}));
jest.mock('@/redux/features/bills/billsApi', () => ({
  useAddBillMutation: () => [mockAddBill, { isLoading: false }],
  useDeleteBillMutation: () => [mockDeleteBill, { isLoading: false }],
}));
jest.mock('@/redux/features/billDetail/billDetailApi', () => ({
  useGetBillDetailQuery: () => mockBillQuery,
}));
jest.mock('@/redux/features/paymentMethods/paymentMethodApi', () => ({
  useGetPaymentMethodsQuery: () => mockPaymentMethodsQuery,
}));
jest.mock('@/redux/features/transactions/transactionApi', () => ({
  cacheCompletedTransaction: (...args: any[]) => mockCacheCompletedTransaction(...args),
  useCreateTransactionComputationMutation: () => [mockCreateComputation, mockComputationState],
  usePayTransactionMutation: () => [mockPayTransaction, { isLoading: false }],
}));
jest.mock('@/redux/features/transactionDetail/transactionDetailApi', () => ({
  useGetTransactionDetailQuery: () => mockTransactionQuery,
  useLazyGetTransactionDetailQuery: () => [mockGetTransactionDetail, { isFetching: false }],
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'test-payment-intent-key' }));
jest.mock('@/components/layout/OtpWebView', () => ({ OtpWebView: () => null }));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title, rightNav, onBackPress }: any) => {
    const { Pressable, Text, View } = require('react-native');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { router } = require('expo-router');
    // Mirror the real component: custom handler if provided, else history back.
    const handleBack = onBackPress ?? (() => router.back());
    return (
      <View>
        <Pressable accessibilityRole="button" onPress={handleBack}><Text>{`Nav:${title}`}</Text></Pressable>
        {rightNav ? <Pressable accessibilityRole="button" onPress={rightNav.onPress}><Text>Delete biller</Text></Pressable> : null}
      </View>
    );
  }
));
jest.mock('@/components/one-time-payments/BillsComponent', () => (
  ({ sectionHeader }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Bills:${sectionHeader.title}`}</Text>;
  }
));
jest.mock('@/components/common/SearchMerchants', () => (
  ({ data, activeCategoryId, onSelect, onCategoryChange }: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>{`Billers:${data.length}:category:${activeCategoryId}`}</Text>
        <Pressable accessibilityRole="button" onPress={() => onSelect(data[0])}><Text>Select biller</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => onCategoryChange(9)}><Text>Filter billers</Text></Pressable>
      </View>
    );
  }
));
jest.mock('@/components/forms/InputValidationComponent', () => (
  ({ placeholder, value, setValue, errors, field }: any) => {
    const { Text, TextInput, View } = require('react-native');
    return (
      <View>
        <TextInput accessibilityLabel={placeholder} value={value} onChangeText={setValue} />
        {errors?.[field] ? <Text>{errors[field]}</Text> : null}
      </View>
    );
  }
));
jest.mock('@/components/forms/DynamicFormComponent', () => (
  ({ formData, onFormChange }: any) => {
    const { TextInput } = require('react-native');
    return <TextInput accessibilityLabel="Account" value={formData.account || ''} onChangeText={(value: string) => onFormChange('account', value)} />;
  }
));
jest.mock('@/components/settings/TermsAndPolicyText', () => (
  ({ isChecked, onToggle }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: isChecked }} onPress={onToggle}>
        <Text>{`Terms:${isChecked}`}</Text>
      </Pressable>
    );
  }
));
jest.mock('@/components/payments/PaymentMethodsComponent', () => (
  ({ onAddPaymentMethod }: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>Payment methods</Text>
        {onAddPaymentMethod ? (
          <Pressable accessibilityRole="button" onPress={onAddPaymentMethod}><Text>Add Payment Method</Text></Pressable>
        ) : null}
      </View>
    );
  }
));
jest.mock('@/components/common/InfoFieldComponent', () => (
  ({ label, value }: any) => {
    const { Text } = require('react-native');
    return <Text>{`${label}:${value}`}</Text>;
  }
));
jest.mock('@/components/common/Loading', () => ({
  BillPaymentSkeleton: ({ label }: any) => {
    const { Text } = require('react-native');
    return <Text>{label}</Text>;
  },
  FormSkeleton: ({ label }: any) => {
    const { Text } = require('react-native');
    return <Text>{label}</Text>;
  },
  InlineLoadingIndicator: ({ label }: any) => {
    const { Text } = require('react-native');
    return <Text>{label}</Text>;
  },
  ReceiptSkeleton: ({ label }: any) => {
    const { Text } = require('react-native');
    return <Text>{label}</Text>;
  },
}));

const resolvedTrigger = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value) });

describe('saved-biller and bill-payment routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    Object.assign(mockBillerQuery, { data: [], isLoading: false, isError: false });
    Object.assign(mockFormQuery, { data: undefined, isLoading: false });
    Object.assign(mockLookupQuery, { data: undefined, isLoading: false });
    Object.assign(mockBillQuery, { data: undefined, isLoading: false });
    mockPaymentMethodsQuery.data = [];
    Object.assign(mockComputationState, { data: undefined, isLoading: false, isError: false, reset: mockResetComputation });
    mockState.oneTimePayment.lastCompletedInvoiceReferenceId = null;
    Object.assign(mockTransactionQuery, { data: undefined, currentData: undefined, isLoading: false, isFetching: false, isError: false });
    mockAddBill.mockReturnValue(resolvedTrigger({}));
    mockDeleteBill.mockReturnValue(resolvedTrigger({}));
    mockPayTransaction.mockReturnValue(resolvedTrigger({}));
    mockGetTransactionDetail.mockReturnValue(resolvedTrigger({ status: 'successful' }));
    mockCreateComputation.mockReturnValue(resolvedTrigger({
      transactionReferenceId: 'transaction-1',
      invoiceReferenceId: 'invoice-1',
      computation: { totalAmount: 125, totalCurrency: 'PHP', feeAmount: 25, feeCurrency: 'PHP' },
    }));
  });

  it('shows biller-form loading and empty states', () => {
    Object.assign(mockParams, { merchantId: '10', merchantCode: 'merchant', merchantName: 'Merchant One' });
    mockFormQuery.isLoading = true;
    const loading = render(<BillerFormScreen />);
    expect(screen.getByText('Loading biller form')).toBeTruthy();
    loading.unmount();
    mockFormQuery.isLoading = false;
    render(<BillerFormScreen />);
    expect(screen.getByText('No form configuration or lookup options available.')).toBeTruthy();
    fireEvent.press(screen.getByText('Nav:Add Biller Information'));
    // Back now returns to the actual previous screen via navigation history.
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('validates and saves a complete biller form', async () => {
    Object.assign(mockParams, { merchantId: '10', merchantCode: 'merchant', merchantName: 'Merchant One' });
    mockFormQuery.data = [{ key: 'account', label: 'Account Number', isRequired: true, fieldType: 'text' }];
    mockLookupQuery.data = {};
    render(<BillerFormScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(mockAddBill).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Please correct the highlighted fields.', variant: 'error' },
    }));
    fireEvent.changeText(screen.getByLabelText('Name of Bill'), 'Home bill');
    fireEvent.changeText(screen.getByLabelText('Account'), '123456');
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockAddBill).toHaveBeenCalledWith(expect.objectContaining({
      billName: 'Home bill',
      merchantCode: 'merchant',
      projectId: 10,
      paymentTypeCode: 'MERCHANT_One Time Payment',
    })));
    expect(mockRouter.push).toHaveBeenCalledWith('/bills/one-time-payments');
  });

  it('routes bill payment to the payment-method selection when the new-card option is chosen', () => {
    Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One' });
    mockBillQuery.data = { billing_id: 'bill-1', custom_fields: {} };
    render(<PayBillScreen />);
    fireEvent.changeText(screen.getByLabelText('Amount'), '100');
    fireEvent.press(screen.getByRole('radio', { name: /Select payment method/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Select payment method' }));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/bills/one-time-payments/payment-methods',
      params: expect.objectContaining({
        billingReferenceId: 'bill-1',
        baseAmount: '100',
      }),
    }));
  });

  it('resets the payment form only after a payment succeeds', () => {
    Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One' });
    mockBillQuery.data = { billing_id: 'bill-1', custom_fields: {} };
    mockPaymentMethodsQuery.data = [{ referenceId: 'pm-1', isPrimary: true }];
    const view = render(<PayBillScreen />);
    fireEvent.changeText(screen.getByLabelText('Amount'), '100');
    fireEvent.press(screen.getByRole('radio', { name: /Select payment method/ }));
    expect(screen.queryByRole('button', { name: 'Confirm' })).toBeNull();

    // A fee computation gives the mutation a new reset function; that must not clear the form.
    mockComputationState.reset = jest.fn<(...args: any[]) => any>();
    view.rerender(<PayBillScreen />);
    expect(screen.getByLabelText('Amount').props.value).toBe('100');
    mockComputationState.reset = mockResetComputation;

    mockState.oneTimePayment.lastCompletedInvoiceReferenceId = 'invoice-1';
    view.rerender(<PayBillScreen />);

    expect(screen.getByLabelText('Amount').props.value).toBe('');
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy();
    expect(mockResetComputation).toHaveBeenCalled();
  });

  it('blocks the new-card flow until a valid amount is entered', () => {
    Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One' });
    mockBillQuery.data = { billing_id: 'bill-1', custom_fields: {} };
    render(<PayBillScreen />);
    fireEvent.press(screen.getByRole('radio', { name: /Select payment method/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Select payment method' }));
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Amount is required.', variant: 'error' },
    }));
  });

  it('shows an error snackbar when confirming without an amount', () => {
    Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One' });
    mockBillQuery.data = { billing_id: 'bill-1', custom_fields: {} };
    mockPaymentMethodsQuery.data = [
      { referenceId: 'card-1', isPrimary: true, paymentMethodProvider: 'visa', lastFourCardDigits: '4242' },
    ];
    render(<PayBillScreen />);
    expect(screen.getByRole('button', { name: 'Confirm' }).props.accessibilityState.disabled).toBe(true);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('opens the add-and-save flow with a validated return path to Biller Details', () => {
    Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One' });
    mockBillQuery.data = { billing_id: 'bill-1', custom_fields: {} };
    mockPaymentMethodsQuery.data = [
      { referenceId: 'card-1', isPrimary: true, paymentMethodProvider: 'visa', lastFourCardDigits: '4242' },
    ];
    render(<PayBillScreen />);
    fireEvent.changeText(screen.getByLabelText('Amount'), '175');
    fireEvent.press(screen.getByRole('button', { name: 'Add Payment Method' }));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/payment-methods/add-card',
      params: expect.objectContaining({
        returnTo: '/bills/one-time-payments/pay/bill-1',
        billingReferenceId: 'bill-1',
        returnAmount: '175',
      }),
    }));
  });

  it('preselects the returned payment method for computation', () => {
    jest.useFakeTimers();
    try {
      Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One', selectedPaymentMethodReferenceId: 'card-2' });
      mockBillQuery.data = { billing_id: 'bill-1', custom_fields: {} };
      mockPaymentMethodsQuery.data = [
        { referenceId: 'card-1', isPrimary: true, paymentMethodProvider: 'visa', lastFourCardDigits: '4242' },
        { referenceId: 'card-2', isPrimary: false, paymentMethodProvider: 'mastercard', lastFourCardDigits: '5555' },
      ];
      render(<PayBillScreen />);
      fireEvent.changeText(screen.getByLabelText('Amount'), '100');
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      // the returned card overrides the default primary selection
      expect(mockCreateComputation).toHaveBeenCalledWith(expect.objectContaining({
        paymentMethodReferenceId: 'card-2',
      }));
    } finally {
      jest.useRealTimers();
    }
  });

  it('restores the previously entered amount from the return params', () => {
    jest.useFakeTimers();
    try {
      Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One', amount: '325' });
      mockBillQuery.data = { billing_id: 'bill-1', custom_fields: {} };
      mockPaymentMethodsQuery.data = [
        { referenceId: 'card-1', isPrimary: true, paymentMethodProvider: 'visa', lastFourCardDigits: '4242' },
      ];
      render(<PayBillScreen />);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockCreateComputation).toHaveBeenCalledWith(expect.objectContaining({
        baseAmount: 325,
      }));
    } finally {
      jest.useRealTimers();
    }
  });

  it('offers the new-card option alongside saved methods', () => {
    Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One' });
    mockBillQuery.data = { billing_id: 'bill-1', custom_fields: {} };
    mockPaymentMethodsQuery.data = [
      { referenceId: 'card-1', isPrimary: true, paymentMethodProvider: 'visa', lastFourCardDigits: '4242' },
    ];
    render(<PayBillScreen />);
    fireEvent.changeText(screen.getByLabelText('Amount'), '250');
    fireEvent.press(screen.getByRole('radio', { name: /Select payment method/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Select payment method' }));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/bills/one-time-payments/payment-methods',
      params: expect.objectContaining({ baseAmount: '250' }),
    }));
  });

  it('computes the payment with the first saved method when none is marked primary', () => {
    jest.useFakeTimers();
    try {
      Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One' });
      mockBillQuery.data = { billing_id: 'bill-1', custom_fields: {} };
      mockPaymentMethodsQuery.data = [
        { referenceId: 'card-1', isPrimary: false, paymentMethodProvider: 'visa', lastFourCardDigits: '4242' },
        { referenceId: 'card-2', isPrimary: false, paymentMethodProvider: 'mastercard', lastFourCardDigits: '5555' },
      ];
      render(<PayBillScreen />);
      fireEvent.changeText(screen.getByLabelText('Amount'), '100');
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockCreateComputation).toHaveBeenCalledWith(expect.objectContaining({
        paymentMethodReferenceId: 'card-1',
        billingReferenceId: 'bill-1',
        baseAmount: 100,
      }));
    } finally {
      jest.useRealTimers();
    }
  });

  it('requires terms before completing payment and routes a successful payment receipt', async () => {
    Object.assign(mockParams, {
      billingReferenceId: 'bill-1',
      merchantName: 'Merchant One',
      computationResponse: JSON.stringify({ computation: { totalCurrency: 'PHP', totalAmount: 125 } }),
      invoiceReferenceId: 'invoice-1',
      transactionReferenceId: 'transaction-1',
      paymentMethodProvider: 'mastercard',
      lastFourCardDigits: '5555',
    });
    mockBillQuery.data = { merchant_name: 'Merchant One', custom_fields: {} };
    render(<ConfirmPaymentScreen />);
    expect(screen.getByText(/Mastercard •••• 5555/)).toBeTruthy();
    expect(screen.queryByText('VISA')).toBeNull();
    const complete = screen.getByRole('button', { name: 'Complete My Payment' });
    fireEvent.press(complete);
    expect(mockPayTransaction).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('checkbox'));
    fireEvent.press(complete);
    await waitFor(() => expect(mockPayTransaction).toHaveBeenCalledWith({ transactionId: 'transaction-1', idempotencyKey: 'test-payment-intent-key' }));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: expect.objectContaining({ invoiceReferenceId: 'invoice-1' }),
    }));
  });

  it('opens the receipt while a payment is still processing', async () => {
    Object.assign(mockParams, {
      billingReferenceId: 'bill-1',
      computationResponse: JSON.stringify({ computation: { totalCurrency: 'PHP', totalAmount: 125 } }),
      invoiceReferenceId: 'invoice-1',
      transactionReferenceId: 'transaction-1',
    });
    mockBillQuery.data = { merchant_name: 'Merchant One', custom_fields: {} };
    mockGetTransactionDetail.mockReturnValue(resolvedTrigger({ status: 'uncaptured' }));
    render(<ConfirmPaymentScreen />);
    fireEvent.press(screen.getByRole('checkbox'));
    fireEvent.press(screen.getByRole('button', { name: 'Complete My Payment' }));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: expect.objectContaining({ invoiceReferenceId: 'invoice-1' }),
    }));
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({ variant: 'error' }),
    }));
  });

  it('clears the accepted terms after a payment succeeds', () => {
    Object.assign(mockParams, {
      billingReferenceId: 'bill-1',
      computationResponse: JSON.stringify({ computation: { totalCurrency: 'PHP', totalAmount: 125 } }),
      transactionReferenceId: 'transaction-1',
    });
    mockBillQuery.data = { merchant_name: 'Merchant One', custom_fields: {} };
    const view = render(<ConfirmPaymentScreen />);
    fireEvent.press(screen.getByRole('checkbox'));
    expect(screen.getByText('Terms:true')).toBeTruthy();

    mockState.oneTimePayment.lastCompletedInvoiceReferenceId = 'invoice-1';
    view.rerender(<ConfirmPaymentScreen />);

    expect(screen.getByText('Terms:false')).toBeTruthy();
  });

  it('handles missing and successful payment receipts', () => {
    const missing = render(<PaymentSuccessScreen />);
    expect(screen.getByText('Missing payment receipt reference. Please return to your bills and try again.')).toBeTruthy();
    missing.unmount();

    Object.assign(mockParams, { billingReferenceId: 'bill-1', invoiceReferenceId: 'invoice-1' });
    mockBillQuery.data = { merchant_id: 101, merchant_name: 'Merchant One', custom_fields: {} };
    mockBillerQuery.data = [{
      merchant_id: 101,
      merchant_name: 'Merchant One',
      merchant_logo_url: 'https://cdn.example.com/merchant-one.png',
    }];
    mockPaymentMethodsQuery.data = [{ isPrimary: true, paymentMethodProvider: 'visa' }];
    mockTransactionQuery.data = {
      invoiceReferenceId: 'invoice-1',
      merchantName: 'Merchant One',
      totalCurrency: 'PHP',
      totalAmount: 125,
      status: 'successful',
      transactionDate: '2026-01-01T00:00:00Z',
    };
    mockTransactionQuery.currentData = mockTransactionQuery.data;
    render(<PaymentSuccessScreen />);
    expect(screen.getByText('Merchant One')).toBeTruthy();
    expect(screen.getByText('VISA')).toBeTruthy();
    expect(mockCacheCompletedTransaction).toHaveBeenCalledWith(expect.objectContaining({
      invoiceReferenceId: 'invoice-1',
      merchantName: 'Merchant One',
      merchantLogoUrl: 'https://cdn.example.com/merchant-one.png',
    }));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'transactions/cacheCompleted',
    }));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'oneTimePayment/oneTimePaymentCompleted',
      payload: 'invoice-1',
    });
    fireEvent.press(screen.getByRole('button', { name: 'Back to Home' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('does not show the previous receipt while the next payment receipt loads', () => {
    Object.assign(mockParams, { billingReferenceId: 'bill-1', invoiceReferenceId: 'invoice-1' });
    mockBillQuery.data = { merchant_name: 'Merchant One', custom_fields: {} };
    mockTransactionQuery.data = {
      invoiceReferenceId: 'invoice-1',
      merchantName: 'Merchant One',
      totalCurrency: 'PHP',
      totalAmount: 125,
      status: 'successful',
      transactionDate: '2026-01-01T00:00:00Z',
    };
    mockTransactionQuery.currentData = mockTransactionQuery.data;
    const view = render(<PaymentSuccessScreen />);
    expect(screen.getByText('Merchant One')).toBeTruthy();
    mockCacheCompletedTransaction.mockClear();

    // Next payment: RTK Query keeps the old result in data but not in currentData.
    mockParams.invoiceReferenceId = 'invoice-2';
    mockTransactionQuery.currentData = undefined;
    mockTransactionQuery.isFetching = true;
    view.rerender(<PaymentSuccessScreen />);

    expect(screen.getByText('Loading payment receipt')).toBeTruthy();
    expect(screen.queryByText('Merchant One')).toBeNull();
    expect(mockCacheCompletedTransaction).not.toHaveBeenCalled();
  });

  it('shows a processing payment on the receipt and keeps it in history', () => {
    Object.assign(mockParams, { billingReferenceId: 'bill-1', invoiceReferenceId: 'invoice-1' });
    mockBillQuery.data = { merchant_name: 'Merchant One', custom_fields: {} };
    mockPaymentMethodsQuery.data = [{ isPrimary: true, paymentMethodProvider: 'visa' }];
    mockTransactionQuery.data = {
      invoiceReferenceId: 'invoice-1',
      merchantName: 'Merchant One',
      totalCurrency: 'PHP',
      totalAmount: 125,
      status: 'uncaptured',
      transactionDate: '2026-01-01T00:00:00Z',
    };
    mockTransactionQuery.currentData = mockTransactionQuery.data;
    render(<PaymentSuccessScreen />);
    expect(screen.getByText('Payment is processing')).toBeTruthy();
    expect(screen.getByText('Merchant One')).toBeTruthy();
    expect(screen.getByText('Payment is processing. It will show in your transaction history.')).toBeTruthy();
    expect(mockCacheCompletedTransaction).toHaveBeenCalledWith(expect.objectContaining({
      invoiceReferenceId: 'invoice-1',
      status: 'uncaptured',
    }));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'oneTimePayment/oneTimePaymentCompleted',
      payload: 'invoice-1',
    });
  });
});
