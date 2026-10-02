import QrphPayment from '@/app/(app)/payment-methods/qrph';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockPayWithQrph = jest.fn<(...args: any[]) => any>();
const mockVerifyQrph = jest.fn<(...args: any[]) => any>();
const mockCancelQrph = jest.fn<(...args: any[]) => any>();
const mockReplace = jest.fn<(...args: any[]) => any>();
const VERIFY_RETRY_WINDOW_MS = 5_000;
const params = {
  billingReferenceId: 'bill-1',
  baseAmount: '100',
  baseCurrency: 'PHP',
};

jest.mock('expo-crypto', () => ({ randomUUID: () => 'qrph-idempotency-key' }));
jest.mock('expo-router', () => ({
  router: { replace: (...args: any[]) => mockReplace(...args) },
  useLocalSearchParams: () => params,
  useFocusEffect: (callback: any) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('@/redux/hooks', () => ({ useAppDispatch: () => mockDispatch }));
jest.mock('@/redux/features/transactions/transactionApi', () => ({
  usePayWithQrphMutation: () => [mockPayWithQrph],
  useVerifyQrphMutation: () => [mockVerifyQrph],
  useCancelQrphMutation: () => [mockCancelQrph],
}));
jest.mock('@/components/layout/NavHeaderComponent', () => () => null);
jest.mock('@/components/layout/OtpWebView', () => ({
  OtpWebView: ({ visible, onSuccess, onComplete }: { visible: boolean; onSuccess: () => void; onComplete: () => void }) => {
    if (!visible) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Pressable accessibilityRole="button" onPress={onSuccess}>
          <Text>Complete QR Ph</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onComplete}>
          <Text>Close QR Ph</Text>
        </Pressable>
      </View>
    );
  },
}));

const resolved = (value: any) => ({
  abort: jest.fn(),
  unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value),
});

describe('QR Ph hosted payment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPayWithQrph.mockReturnValue(resolved({
      redirectUrl: 'https://maya.test/qr',
      transactionReferenceId: 'txn-1',
      invoiceReferenceId: 'inv-1',
    }));
    mockVerifyQrph.mockReturnValue(resolved({
      message: 'Payment successful',
      transactionReferenceId: 'txn-1',
      invoiceReferenceId: 'inv-1',
    }));
    mockCancelQrph.mockReturnValue(resolved({ message: 'Cancelled' }));
  });

  it('opens Maya, verifies the result, and shows a completion snackbar', async () => {
    render(<QrphPayment />);

    await waitFor(() => expect(screen.getByText('Complete QR Ph')).toBeTruthy());
    expect(mockPayWithQrph).toHaveBeenCalledWith({
      idempotencyKey: expect.any(String),
      payload: {
        billingReferenceId: 'bill-1',
        baseAmount: 100,
        baseCurrency: 'PHP',
        notes: null,
      },
    });
    fireEvent.press(screen.getByText('Complete QR Ph'));

    await waitFor(() => expect(mockVerifyQrph).toHaveBeenCalledWith('txn-1'));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Payment successful', variant: 'success' },
    }));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: { billingReferenceId: 'bill-1', invoiceReferenceId: 'inv-1' },
    });
  });

  it('verifies the payment when the page is closed before Maya redirects', async () => {
    render(<QrphPayment />);

    await waitFor(() => expect(screen.getByText('Close QR Ph')).toBeTruthy());
    fireEvent.press(screen.getByText('Close QR Ph'));

    await waitFor(() => expect(mockVerifyQrph).toHaveBeenCalledWith('txn-1'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: { billingReferenceId: 'bill-1', invoiceReferenceId: 'inv-1' },
    });
    expect(screen.queryByText(/page was closed/i)).toBeNull();
  });

  it('turns a pending verification into a retry action instead of an infinite loader', async () => {
    jest.useFakeTimers();
    mockVerifyQrph.mockReturnValue({
      abort: jest.fn(),
      unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue({ status: 409 }),
    });
    render(<QrphPayment />);

    await waitFor(() => expect(screen.getByText('Complete QR Ph')).toBeTruthy());
    fireEvent.press(screen.getByText('Complete QR Ph'));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(VERIFY_RETRY_WINDOW_MS);
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Check Payment Status' })).toBeTruthy());
    expect(screen.getByText(/still being recorded/i)).toBeTruthy();
    expect(screen.getByText('Payment processing')).toBeTruthy();
    expect(mockVerifyQrph).toHaveBeenCalledTimes(6);
    jest.useRealTimers();
  });

  it('automatically retries a pending verification and completes when recording catches up', async () => {
    jest.useFakeTimers();
    mockVerifyQrph
      .mockReturnValueOnce({
        abort: jest.fn(),
        unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue({
          status: 409,
          data: { code: 'PAYMENT_PENDING' },
        }),
      })
      .mockReturnValueOnce(resolved({
        message: 'Payment successful',
        transactionReferenceId: 'txn-1',
        invoiceReferenceId: 'inv-1',
      }));
    render(<QrphPayment />);

    await waitFor(() => expect(screen.getByText('Complete QR Ph')).toBeTruthy());
    fireEvent.press(screen.getByText('Complete QR Ph'));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1_000);
    });

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(mockVerifyQrph).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Payment successful', variant: 'success' },
    }));
    jest.useRealTimers();
  });
});
