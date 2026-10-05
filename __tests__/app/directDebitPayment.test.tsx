import DirectDebitOtp from '@/app/(app)/payment-methods/direct-debit-otp';
import DirectDebit from '@/app/(app)/payment-methods/direct-debit';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockLinkDirectDebit = jest.fn<(...args: any[]) => any>();
const mockChargeDirectDebit = jest.fn<(...args: any[]) => any>();
const mockValidateDirectDebitOtp = jest.fn<(...args: any[]) => any>();
const mockResendDirectDebitOtp = jest.fn<(...args: any[]) => any>();
const mockRouter = {
  replace: jest.fn<(...args: any[]) => any>(),
};
const mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: any[]) => mockRouter.replace(...args),
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/redux/features/paymentMethods/paymentMethodApi', () => ({
  useGetPaymentMethodsQuery: () => ({ data: [] }),
  useLinkDirectDebitMutation: () => [mockLinkDirectDebit, { isLoading: false }],
  useChargeDirectDebitMutation: () => [mockChargeDirectDebit, { isLoading: false }],
  useValidateDirectDebitOtpMutation: () => [mockValidateDirectDebitOtp, { isLoading: false }],
  useResendDirectDebitOtpMutation: () => [mockResendDirectDebitOtp, { isLoading: false }],
}));

jest.mock('@/components/layout/NavHeaderComponent', () => () => null);

jest.mock('@/components/payments/DirectDebitBankOption', () => {
  return function MockDirectDebitBankOption({ label, onPress }: { label: string; onPress: () => void }) {

    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    );
  };
});

jest.mock('@/components/layout/OtpWebView', () => ({
  OtpWebView: function MockOtpWebView({
    visible,
    isProcessing,
    processingLabel,
    onSuccess,
    onComplete,
  }: {
    visible: boolean;
    isProcessing: boolean;
    processingLabel: string;
    onSuccess: () => void;
    onComplete: () => void;
  }) {
    if (!visible) return null;

    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>Bank authorization open</Text>
        {isProcessing ? <Text>{processingLabel}</Text> : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void onSuccess();
            onComplete();
          }}
        >
          <Text>Complete bank authorization</Text>
        </Pressable>
      </View>
    );
  },
}));

const resolved = (value: any) => ({
  unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value),
});

describe('direct-debit payment completion notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    Object.assign(mockParams, {
      billingReferenceId: 'bill-1',
      returnAmount: '125',
    });
    mockLinkDirectDebit.mockReturnValue(resolved({
      referenceId: 'bank-ref-1',
      redirectUrl: 'https://bank.example/authorize',
    }));
  });

  it('shows a success snackbar when the direct-debit charge completes immediately', async () => {
    mockChargeDirectDebit.mockReturnValue(resolved({
      message: 'Direct-debit payment completed.',
      isOTPRequired: false,
      invoiceReferenceId: 'invoice-1',
    }));

    render(<DirectDebit />);
    fireEvent.press(screen.getByRole('button', { name: /Bank of the Philippine Islands/ }));

    await waitFor(() => expect(screen.getByText('Complete bank authorization')).toBeTruthy());
    fireEvent.press(screen.getByText('Complete bank authorization'));

    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        message: 'Direct-debit payment completed.',
        variant: 'success',
      },
    })));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: { billingReferenceId: 'bill-1', invoiceReferenceId: 'invoice-1' },
    });
  });

  it('keeps authorization covered until the OTP route is ready', async () => {
    let resolveCharge: ((value: any) => void) | undefined;
    mockChargeDirectDebit.mockReturnValue({
      unwrap: jest.fn(() => new Promise((resolve) => {
        resolveCharge = resolve;
      })),
    });

    render(<DirectDebit />);
    fireEvent.press(screen.getByRole('button', { name: /Bank of the Philippine Islands/ }));
    await waitFor(() => expect(screen.getByText('Complete bank authorization')).toBeTruthy());

    fireEvent.press(screen.getByText('Complete bank authorization'));

    await waitFor(() => expect(screen.getByText('Completing your payment')).toBeTruthy());
    expect(screen.getByText('Bank authorization open')).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();

    await act(async () => {
      resolveCharge?.({
        isOTPRequired: true,
        paymentId: 7,
        xenditPaymentId: 'xendit-1',
        otpMobileNumber: '+63992***104',
        invoiceReferenceId: 'invoice-2',
      });
    });

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/payment-methods/direct-debit-otp',
      params: {
        paymentId: '7',
        xenditPaymentId: 'xendit-1',
        otpMobileNumber: '+63992***104',
        billingReferenceId: 'bill-1',
        invoiceReferenceId: 'invoice-2',
      },
    });
    expect(screen.queryByText('Bank authorization open')).toBeNull();
  });

  it('shows a success snackbar after OTP confirmation completes the payment', async () => {
    Object.assign(mockParams, {
      paymentId: '7',
      xenditPaymentId: 'xendit-1',
      invoiceReferenceId: 'invoice-2',
    });
    mockValidateDirectDebitOtp.mockReturnValue(resolved({
      message: 'Payment confirmed.',
      transactionReferenceId: 'transaction-2',
    }));

    render(<DirectDebitOtp />);
    fireEvent.changeText(screen.getByTestId('text-input-outlined'), '123456');
    fireEvent.press(screen.getByRole('button', { name: 'Confirm Payment' }));

    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: {
        message: 'Payment confirmed.',
        variant: 'success',
      },
    })));
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: { billingReferenceId: 'bill-1', invoiceReferenceId: 'invoice-2' },
    });
  });
});
