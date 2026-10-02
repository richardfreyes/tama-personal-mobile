import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import OneTimePaymentMethodsScreen from '@/app/(app)/bills/one-time-payments/payment-methods';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const mockRouter = { push: jest.fn<(...args: any[]) => any>() };
const mockParams: Record<string, any> = {};

jest.mock('expo-router', () => ({
  router: { push: (...args: any[]) => mockRouter.push(...args) },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/components/payments/PaymentMethodCardComponent', () => (
  function PaymentMethodCardMock({ option, onPress }: any) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native');
    return <Pressable accessibilityRole="button" onPress={onPress}><Text>{`Method:${option.title}`}</Text></Pressable>;
  }
));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  function NavHeaderMock({ title }: any) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require('react-native');
    return <Text>{`Nav:${title}`}</Text>;
  }
));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

describe('one-time payment method selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    Object.assign(mockParams, {
      billingReferenceId: 'bill-1',
      baseAmount: '100',
      baseCurrency: 'PHP',
      returnTo: '/bills/one-time-payments/pay/bill-1',
      returnAmount: '100',
    });
  });

  it('offers card, PayPal, Philippine bank direct debit, and QR Ph for one-time payments', () => {
    render(<OneTimePaymentMethodsScreen />);
    expect(screen.getByText('Method:Credit/Debit Card')).toBeTruthy();
    expect(screen.getByText('Method:PayPal')).toBeTruthy();
    expect(screen.getByText('Method:Philippine Banks')).toBeTruthy();
    expect(screen.getByText('Method:QRPH')).toBeTruthy();
  });

  it('routes card selection to the one-time card form', () => {
    render(<OneTimePaymentMethodsScreen />);
    fireEvent.press(screen.getByText('Method:Credit/Debit Card'));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/payment-methods/form-details',
      params: expect.objectContaining({
        apiEnv: 'one-time',
        billingReferenceId: 'bill-1',
        baseAmount: '100',
      }),
    }));
  });

  it('routes PayPal selection to the hosted approval flow', () => {
    render(<OneTimePaymentMethodsScreen />);
    fireEvent.press(screen.getByText('Method:PayPal'));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/payment-methods/paypal',
      params: expect.objectContaining({
        billingReferenceId: 'bill-1',
        baseAmount: '100',
        baseCurrency: 'PHP',
      }),
    }));
  });

  it('routes direct debit selection to the bank link flow with the one-time context', () => {
    render(<OneTimePaymentMethodsScreen />);
    fireEvent.press(screen.getByText('Method:Philippine Banks'));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/payment-methods/direct-debit',
      params: expect.objectContaining({
        billingReferenceId: 'bill-1',
        returnAmount: '100',
      }),
    }));
  });

  it('routes QR Ph selection to the hosted payment flow', () => {
    render(<OneTimePaymentMethodsScreen />);
    fireEvent.press(screen.getByText('Method:QRPH'));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/payment-methods/qrph',
      params: expect.objectContaining({
        billingReferenceId: 'bill-1',
        baseAmount: '100',
        baseCurrency: 'PHP',
      }),
    }));
  });
});
