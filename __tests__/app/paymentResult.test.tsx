import PaymentResult from '@/app/(app)/payment-methods/payment-result';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockReplace = jest.fn<(...args: any[]) => any>();
const mockCapturePayPal = jest.fn<(...args: any[]) => any>();
const mockCancelPayPal = jest.fn<(...args: any[]) => any>();
const mockVerifyQrph = jest.fn<(...args: any[]) => any>();
const mockCancelQrph = jest.fn<(...args: any[]) => any>();
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  router: { replace: (...args: any[]) => mockReplace(...args) },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/redux/hooks', () => ({ useAppDispatch: () => mockDispatch }));
jest.mock('@/redux/features/transactions/transactionApi', () => ({
  useCapturePayPalMutation: () => [mockCapturePayPal],
  useCancelPayPalMutation: () => [mockCancelPayPal],
  useVerifyQrphMutation: () => [mockVerifyQrph],
  useCancelQrphMutation: () => [mockCancelQrph],
}));
jest.mock('@/components/layout/NavHeaderComponent', () => () => null);

const resolved = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value) });
const rejected = (error: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue(error) });

describe('Payment result deep link screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCancelPayPal.mockReturnValue(resolved({ message: 'Cancelled' }));
    mockCancelQrph.mockReturnValue(resolved({ message: 'Cancelled' }));
  });

  it('verifies a QR Ph payment with the backend before showing the receipt', async () => {
    mockParams = { provider: 'qrph', outcome: 'success', transactionReferenceId: 'txn-1', invoiceReferenceId: 'inv-1' };
    mockVerifyQrph.mockReturnValue(resolved({ message: 'Payment successful', invoiceReferenceId: 'inv-1' }));

    render(<PaymentResult />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: { invoiceReferenceId: 'inv-1' },
    }));
    expect(mockVerifyQrph).toHaveBeenCalledWith('txn-1');
    expect(mockCapturePayPal).not.toHaveBeenCalled();
  });

  it('captures a PayPal payment even when the redirect said success', async () => {
    mockParams = { provider: 'paypal', outcome: 'success', transactionReferenceId: 'txn-2', invoiceReferenceId: 'inv-2' };
    mockCapturePayPal.mockReturnValue(resolved({ message: 'Payment successful', invoiceReferenceId: 'inv-2' }));

    render(<PaymentResult />);

    await waitFor(() => expect(mockCapturePayPal).toHaveBeenCalledWith('txn-2'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  });

  it('releases a cancelled payment that the backend did not complete', async () => {
    mockParams = { provider: 'paypal', outcome: 'cancelled', transactionReferenceId: 'txn-3' };
    mockCapturePayPal.mockReturnValue(rejected({ status: 409, data: { code: 'PAYMENT_NOT_APPROVED' } }));

    render(<PaymentResult />);

    await waitFor(() => expect(screen.getByText('Payment cancelled')).toBeTruthy());
    expect(mockCancelPayPal).toHaveBeenCalledWith('txn-3');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('offers a status re-check when the backend is still recording the payment', async () => {
    mockParams = { provider: 'qrph', outcome: 'success', transactionReferenceId: 'txn-4' };
    mockVerifyQrph
      .mockReturnValueOnce(rejected({ status: 409, data: { code: 'PAYMENT_PENDING' } }))
      .mockReturnValueOnce(resolved({ message: 'Payment successful', invoiceReferenceId: 'inv-4' }));

    render(<PaymentResult />);

    await waitFor(() => expect(screen.getByText('Payment processing')).toBeTruthy());
    fireEvent.press(screen.getByText('Check Payment Status'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: { invoiceReferenceId: 'inv-4' },
    }));
    expect(mockCancelQrph).not.toHaveBeenCalled();
  });

  it('reconciles again when a new return link reuses the open screen', async () => {
    mockParams = { provider: 'paypal', outcome: 'cancelled', transactionReferenceId: 'txn-5' };
    mockCapturePayPal.mockReturnValue(rejected({ status: 409, data: { code: 'PAYMENT_NOT_APPROVED' } }));
    const { rerender } = render(<PaymentResult />);
    await waitFor(() => expect(screen.getByText('Payment cancelled')).toBeTruthy());

    mockParams = { provider: 'qrph', outcome: 'success', transactionReferenceId: 'txn-6' };
    mockVerifyQrph.mockReturnValue(resolved({ message: 'Payment successful', invoiceReferenceId: 'inv-6' }));
    rerender(<PaymentResult />);

    await waitFor(() => expect(mockVerifyQrph).toHaveBeenCalledWith('txn-6'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: { invoiceReferenceId: 'inv-6' },
    }));
  });

  it('does not reconcile twice for the same link on re-render', async () => {
    mockParams = { provider: 'qrph', outcome: 'success', transactionReferenceId: 'txn-7' };
    mockVerifyQrph.mockReturnValue(rejected({ status: 409, data: { code: 'PAYMENT_PENDING' } }));
    const { rerender } = render(<PaymentResult />);
    await waitFor(() => expect(screen.getByText('Payment processing')).toBeTruthy());

    rerender(<PaymentResult />);

    expect(mockVerifyQrph).toHaveBeenCalledTimes(1);
  });

  it('shows an error when the link has no transaction to verify', async () => {
    mockParams = { provider: 'qrph', outcome: 'success' };

    render(<PaymentResult />);

    await waitFor(() => expect(screen.getByText('Payment status unavailable')).toBeTruthy());
    expect(mockVerifyQrph).not.toHaveBeenCalled();
  });
});
