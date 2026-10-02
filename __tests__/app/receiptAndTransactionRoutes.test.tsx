import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import EnrollmentPaymentSuccessScreen from '@/app/(app)/bills/enrollments/payment-success';
import TransactionDetailScreen from '@/app/(app)/transactions/[invoiceReferenceId]';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const mockRouter = { back: jest.fn<(...args: any[]) => any>(), replace: jest.fn<(...args: any[]) => any>() };
const mockParams: Record<string, any> = {};
const mockPaymentReceiptQuery = { data: undefined as any, isLoading: false, isError: false };
const mockEnrollmentReceiptQuery = { data: undefined as any, isLoading: false, isError: false };
const mockTransactionQuery = {
  data: undefined as any,
  currentData: undefined as any,
  isLoading: false,
  isFetching: false,
  isUninitialized: false,
  isError: false,
};
const mockEnrollmentTransactionHistoryQuery = {
  data: undefined as any,
  currentData: undefined as any,
  isLoading: false,
  isFetching: false,
  isUninitialized: false,
  isError: false,
  refetch: jest.fn<(...args: any[]) => any>().mockResolvedValue(undefined),
};

jest.mock('expo-router', () => ({
  router: {
    back: (...args: any[]) => mockRouter.back(...args),
    replace: (...args: any[]) => mockRouter.replace(...args),
  },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/redux/features/merchants/merchantApi', () => ({
  useGetMerchantReceiptQuery: () => mockPaymentReceiptQuery,
  useGetMerchantEnrollmentReceiptQuery: () => mockEnrollmentReceiptQuery,
}));
jest.mock('@/redux/features/transactionDetail/transactionDetailApi', () => ({
  useGetTransactionDetailQuery: () => mockTransactionQuery,
}));
jest.mock('@/redux/features/enrollmentTransactionHistory/enrollmentTransactionHistoryApi', () => ({
  useGetEnrollmentTransactionHistoryQuery: () => mockEnrollmentTransactionHistoryQuery,
}));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title, rightNav }: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>{`Nav:${title}`}</Text>
        {rightNav?.iconType ? <Pressable accessibilityRole="button" onPress={rightNav.onPress}><Text>Transaction actions</Text></Pressable> : null}
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
  ReceiptSkeleton: ({ label }: any) => {
    const { Text } = require('react-native');
    return <Text>{label}</Text>;
  },
  TransactionDetailSkeleton: ({ label }: any) => {
    const { Text } = require('react-native');
    return <Text>{label}</Text>;
  },
}));
jest.mock('@/components/common/ToggleOption', () => (
  ({ initialSelected, onOptionChange }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={() => onOptionChange('Invoices')}>
        <Text>{`Toggle:${initialSelected}`}</Text>
      </Pressable>
    );
  }
));
jest.mock('@/components/layout/FullScreenModal', () => (
  ({ isVisible, title, onClose }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onClose}>
        <Text>{`Modal:${title}:${isVisible}`}</Text>
      </Pressable>
    );
  }
));

describe('receipt and transaction-detail routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    Object.assign(mockPaymentReceiptQuery, { data: undefined, isLoading: false, isError: false });
    Object.assign(mockEnrollmentReceiptQuery, { data: undefined, isLoading: false, isError: false });
    Object.assign(mockTransactionQuery, {
      data: undefined,
      currentData: undefined,
      isLoading: false,
      isFetching: false,
      isUninitialized: false,
      isError: false,
    });
    Object.assign(mockEnrollmentTransactionHistoryQuery, {
      data: undefined,
      currentData: undefined,
      isLoading: false,
      isFetching: false,
      isUninitialized: false,
      isError: false,
    });
  });

  it('renders enrollment-receipt loading and failure states', () => {
    Object.assign(mockParams, { merchantId: 'M1', referenceId: 'receipt-1', receiptAccessSignature: 'signature' });
    mockPaymentReceiptQuery.isLoading = true;
    const loading = render(<EnrollmentPaymentSuccessScreen />);
    expect(screen.getByText('Loading payment receipt')).toBeTruthy();
    loading.unmount();

    mockPaymentReceiptQuery.isLoading = false;
    mockPaymentReceiptQuery.isError = true;
    render(<EnrollmentPaymentSuccessScreen />);
    expect(screen.getByText('Receipt unavailable')).toBeTruthy();
  });

  it('renders a normal enrollment receipt and returns home', () => {
    Object.assign(mockParams, { merchantId: 'M1', referenceId: 'receipt-1', receiptAccessSignature: 'signature' });
    mockPaymentReceiptQuery.data = {
      merchantName: 'Merchant One',
      referenceId: 'receipt-1',
      transactionId: 'transaction-1',
      projectName: 'Project One',
      paymentTypeName: 'Card',
      transactionFields: [{ text: 'Account', value: '12345' }],
      customerName: 'Ada Lovelace',
      customerEmail: 'ada@example.com',
      customerMobileNo: '+639171234567',
      billBase: ['PHP', 100],
      billConverted: ['USD', 2],
      billFee: ['PHP', 5],
      billTotal: ['PHP', 105],
      paymentStatusName: 'Paid',
      methodProvider: 'visa',
      createdAt: '2026-01-01T00:00:00Z',
    };
    render(<EnrollmentPaymentSuccessScreen />);
    expect(screen.getByText('Merchant One')).toBeTruthy();
    expect(screen.getByText('Account:12345')).toBeTruthy();
    expect(screen.getByText('Total Amount:PHP 105.00')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Back to Home' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('renders scheduled enrollment receipt information', () => {
    Object.assign(mockParams, {
      merchantId: 'M1',
      referenceId: 'enrollment-1',
      receiptAccessToken: 'signature',
      isEnrollment: 'true',
    });
    mockEnrollmentReceiptQuery.data = {
      merchantName: 'Merchant One',
      referenceId: 'enrollment-1',
      transactionId: 'transaction-1',
      projectName: 'Project One',
      paymentTypeName: 'Auto Debit',
      customerName: 'Ada Lovelace',
      bill: { currency: 'PHP', amount: 500 },
      enrollmentMonthlyInvoiceAmount: 100,
      enrollmentMonths: 5,
      enrollmentStartDate: '2026-02-01T00:00:00Z',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
    };
    render(<EnrollmentPaymentSuccessScreen />);
    expect(screen.getByText('Scheduled Payment')).toBeTruthy();
    expect(screen.getByText('Enrollment Duration:5 month(s)')).toBeTruthy();
  });

  it('handles transaction loading, errors, and absent details', () => {
    Object.assign(mockParams, { invoiceReferenceId: 'invoice-1' });
    mockTransactionQuery.isLoading = true;
    const loading = render(<TransactionDetailScreen />);
    expect(screen.getByText('Loading transaction details')).toBeTruthy();
    loading.unmount();

    mockTransactionQuery.isLoading = false;
    mockTransactionQuery.isError = true;
    const error = render(<TransactionDetailScreen />);
    expect(screen.getByText(/Error loading transaction/)).toBeTruthy();
    fireEvent.press(screen.getByText('Go Back'));
    expect(mockRouter.back).toHaveBeenCalled();
    error.unmount();

    mockTransactionQuery.isError = false;
    render(<TransactionDetailScreen />);
    expect(screen.getByText('Transaction details are unavailable.')).toBeTruthy();
  });

  it('keeps the loading state visible while transaction route parameters initialize', () => {
    const view = render(<TransactionDetailScreen />);

    expect(screen.getByText('Loading transaction details')).toBeTruthy();
    expect(screen.queryByText('Transaction details are unavailable.')).toBeNull();

    Object.assign(mockParams, { invoiceReferenceId: 'invoice-1' });
    mockTransactionQuery.data = {
      merchantName: 'Merchant One',
      status: 'paid',
      transactionDate: '2026-01-01T00:00:00Z',
      paymentReferenceId: 'payment-1',
      externalTransactionId: 'external-1',
      billingDetails: {},
      items: [],
    };
    mockTransactionQuery.currentData = mockTransactionQuery.data;
    view.rerender(<TransactionDetailScreen />);

    expect(screen.queryByText('Transaction details are unavailable.')).toBeNull();
    expect(screen.getByText('Status:Paid')).toBeTruthy();
  });

  it('stays on the skeleton during an arg transition instead of flashing the error state', () => {
    // RTK keeps the previously-viewed transaction's `data` while the newly tapped
    // one loads; `currentData` is undefined until the new result settles. The
    // screen must show the skeleton, not the stale detail or "unavailable" error.
    Object.assign(mockParams, { invoiceReferenceId: 'invoice-2' });
    mockTransactionQuery.data = {
      merchantName: 'Previously Viewed Merchant',
      status: 'paid',
      transactionDate: '2026-01-01T00:00:00Z',
      paymentReferenceId: 'payment-old',
      externalTransactionId: 'external-old',
      billingDetails: {},
      items: [],
    };
    mockTransactionQuery.currentData = undefined;

    render(<TransactionDetailScreen />);

    expect(screen.getByText('Loading transaction details')).toBeTruthy();
    expect(screen.queryByText('Transaction details are unavailable.')).toBeNull();
    expect(screen.queryByText('Nav:Previously Viewed Merchant')).toBeNull();
  });

  it('stays on the skeleton during an enrollment arg transition instead of flashing unavailable', () => {
    Object.assign(mockParams, {
      invoiceReferenceId: 'ENR-2',
      transactionId: 'ENR-2',
      transactionType: 'enrollment',
    });
    // Stale response from the previously-viewed enrollment transaction that does
    // not contain ENR-2; currentData is undefined until the new search settles.
    mockEnrollmentTransactionHistoryQuery.data = {
      transactions: [{ enrollmentTransactionId: 99, externalTransactionId: 'ENR-OLD' }],
      pagination: { offset: 0, limit: 10, total: 1 },
    };
    mockEnrollmentTransactionHistoryQuery.currentData = undefined;

    render(<TransactionDetailScreen />);

    expect(screen.getByText('Loading enrollment transaction details')).toBeTruthy();
    expect(screen.queryByText('Enrollment transaction details are unavailable.')).toBeNull();
  });

  it('renders transaction fields without an unfinished AutoPay action', () => {
    Object.assign(mockParams, { invoiceReferenceId: ['invoice-1'], isAutoPay: 'Autopay' });
    mockTransactionQuery.data = {
      merchantName: 'Merchant One',
      status: 'paid',
      transactionDate: '2026-01-01T00:00:00Z',
      paymentReferenceId: 'payment-1',
      externalTransactionId: 'external-1',
      billingDetails: { account: { text: 'Account', value: '12345' } },
      items: [
        { description: 'Bills payment', chargedCurrency: 'PHP', chargedAmount: 100 },
        { description: 'Fee', feeCurrency: 'PHP', feeAmount: 5 },
      ],
    };
    mockTransactionQuery.currentData = mockTransactionQuery.data;
    render(<TransactionDetailScreen />);
    expect(screen.getByText('Status:Paid')).toBeTruthy();
    expect(screen.getByText('Account:12345')).toBeTruthy();
    expect(screen.getByText('Bills payment:PHP 100.00')).toBeTruthy();
    expect(screen.queryByText('Transaction actions')).toBeNull();
    expect(screen.queryByText(/Modal:Cancel AutoPay/)).toBeNull();
    fireEvent.press(screen.getByText('Toggle:Details'));
    expect(screen.queryByText('Status:Paid')).toBeNull();
  });

  it('renders enrollment transaction details from enrollment history', () => {
    Object.assign(mockParams, {
      invoiceReferenceId: 'ENR-1',
      transactionId: 'ENR-1',
      transactionType: 'enrollment',
    });
    mockEnrollmentTransactionHistoryQuery.data = {
      transactions: [{
        enrollmentTransactionId: 1,
        externalTransactionId: 'ENR-1',
        enrollmentReferenceId: 'QW-E-1',
        enrollmentStatus: 'ONGOING',
        merchantId: 10,
        merchantCode: 'merchant-one',
        merchantName: 'Merchant One',
        invoiceId: 101,
        invoiceReferenceId: 'INV-1',
        paymentReferenceId: 'PAY-1',
        paymentStatus: 'PAID',
        paymentStatusName: 'Paid',
        description: 'Monthly Enrollment',
        customerName: 'Ada Lovelace',
        baseCurrency: 'PHP',
        baseAmount: 100,
        convertedCurrency: null,
        convertedAmount: null,
        feeCurrency: 'PHP',
        feeAmount: 5,
        totalCurrency: 'PHP',
        totalAmount: 105,
        processorCode: null,
        dueAt: null,
        submittedAt: null,
        paidAt: '2026-01-02T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      }],
      pagination: { offset: 0, limit: 10, total: 1 },
    };
    mockEnrollmentTransactionHistoryQuery.data.transactions = [
      {
        ...mockEnrollmentTransactionHistoryQuery.data.transactions[0],
        enrollmentTransactionId: 2,
        externalTransactionId: 'ENR-OTHER',
        customerName: 'Wrong Customer',
      },
      mockEnrollmentTransactionHistoryQuery.data.transactions[0],
    ];
    mockEnrollmentTransactionHistoryQuery.currentData = mockEnrollmentTransactionHistoryQuery.data;

    render(<TransactionDetailScreen />);

    expect(screen.getByText('Status:Paid')).toBeTruthy();
    expect(screen.getByText('Customer Name:Ada Lovelace')).toBeTruthy();
    expect(screen.queryByText('Customer Name:Wrong Customer')).toBeNull();
    expect(screen.getByText('Enrollment Reference ID:QW-E-1')).toBeTruthy();
    expect(screen.getByText('Total Amount:PHP 105.00')).toBeTruthy();
  });
});
