import PayPalPayment from '@/app/(app)/payment-methods/paypal';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockPayWithPayPal = jest.fn<(...args: any[]) => any>();
const mockCapturePayPal = jest.fn<(...args: any[]) => any>();
const mockCancelPayPal = jest.fn<(...args: any[]) => any>();
const mockReplace = jest.fn<(...args: any[]) => any>();
const params = {
  billingReferenceId: 'bill-1',
  baseAmount: '100',
  baseCurrency: 'PHP',
};

jest.mock('expo-crypto', () => ({ randomUUID: () => 'paypal-idempotency-key' }));
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
  usePayWithPayPalMutation: () => [mockPayWithPayPal],
  useCapturePayPalMutation: () => [mockCapturePayPal],
  useCancelPayPalMutation: () => [mockCancelPayPal],
}));
jest.mock('@/components/layout/NavHeaderComponent', () => () => null);
jest.mock('@/components/layout/OtpWebView', () => ({
  OtpWebView: ({ visible, onSuccess }: { visible: boolean; onSuccess: () => void }) => {
    if (!visible) return null;

    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onSuccess}>
        <Text>Approve PayPal</Text>
      </Pressable>
    );
  },
}));

const resolved = (value: any) => ({
  abort: jest.fn(),
  unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value),
});

describe('PayPal hosted payment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPayWithPayPal.mockReturnValue(resolved({
      redirectUrl: 'https://paypal.test/checkout',
      transactionReferenceId: 'txn-1',
      invoiceReferenceId: 'inv-1',
    }));
    mockCapturePayPal.mockReturnValue(resolved({
      message: 'Payment successful',
      transactionReferenceId: 'txn-1',
      invoiceReferenceId: 'inv-1',
    }));
    mockCancelPayPal.mockReturnValue(resolved({ message: 'Cancelled' }));
  });

  it('opens PayPal, captures the approved order, and shows completion feedback', async () => {
    render(<PayPalPayment />);

    await waitFor(() => expect(screen.getByText('Approve PayPal')).toBeTruthy());
    expect(mockPayWithPayPal).toHaveBeenCalledWith({
      idempotencyKey: expect.any(String),
      payload: {
        billingReferenceId: 'bill-1',
        baseAmount: 100,
        baseCurrency: 'PHP',
        notes: null,
      },
    });

    fireEvent.press(screen.getByText('Approve PayPal'));

    await waitFor(() => expect(mockCapturePayPal).toHaveBeenCalledWith('txn-1'));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Payment successful', variant: 'success' },
    }));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: { billingReferenceId: 'bill-1', invoiceReferenceId: 'inv-1' },
    });
  });

  it('stops loading and offers a status retry when capture fails', async () => {
    mockCapturePayPal.mockReturnValue({
      abort: jest.fn(),
      unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue({
        status: 409,
        data: {
          code: 'PAYMENT_NOT_APPROVED',
          message: 'Approve the payment in PayPal first',
        },
      }),
    });
    render(<PayPalPayment />);

    await waitFor(() => expect(screen.getByText('Approve PayPal')).toBeTruthy());
    fireEvent.press(screen.getByText('Approve PayPal'));

    await waitFor(() => expect(
      screen.getByRole('button', { name: 'Return to PayPal' }),
    ).toBeTruthy());
    expect(screen.getByText('Approve the payment in PayPal first')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Return to PayPal' }));
    expect(screen.getByText('Approve PayPal')).toBeTruthy();
  });
});
