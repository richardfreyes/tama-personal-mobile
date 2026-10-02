import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import EnrollmentPaymentMethodScreen from '@/app/(app)/bills/enrollments/payment-method';
import AddCardScreen from '@/app/(app)/payment-methods/add-card';
import UpdateCardScreen from '@/app/(app)/payment-methods/update-card';
import { modalActions } from '@/utils/modalActions';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockUpdatePaymentMethod = jest.fn<(...args: any[]) => any>();
const mockDeletePaymentMethod = jest.fn<(...args: any[]) => any>();
let mockPaymentMethods: { data: any[] | undefined; isLoading: boolean; isFetching: boolean } = {
  data: [],
  isLoading: false,
  isFetching: false,
};
const mockRouter = {
  back: jest.fn<(...args: any[]) => any>(),
  canGoBack: jest.fn<(...args: any[]) => any>(() => true),
  navigate: jest.fn<(...args: any[]) => any>(),
  push: jest.fn<(...args: any[]) => any>(),
  replace: jest.fn<(...args: any[]) => any>(),
};
const mockParams: Record<string, any> = {};
const mockEnrollmentReview = { transactionResponse: null as any };

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const React = require('react');
    React.useEffect(() => {
      mockRouter.replace(href);
    }, [href]);
    return null;
  },
  router: {
    back: (...args: any[]) => mockRouter.back(...args),
    canGoBack: () => mockRouter.canGoBack(),
    navigate: (...args: any[]) => mockRouter.navigate(...args),
    push: (...args: any[]) => mockRouter.push(...args),
    replace: (...args: any[]) => mockRouter.replace(...args),
  },
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockEnrollmentReview,
}));
jest.mock('@/redux/features/paymentMethods/paymentMethodApi', () => ({
  useUpdateCardPaymentMutation: () => [mockUpdatePaymentMethod, { isLoading: false }],
  useDeleteCardPaymentMutation: () => [mockDeletePaymentMethod, { isLoading: false }],
  useGetPaymentMethodsQuery: () => mockPaymentMethods,
}));
jest.mock('@/utils/card', () => ({
  getCardIcon: () => ({
    uri: ({ width, height }: any) => {
      const { Text } = require('react-native');
      return <Text>{`CardIcon:${width}x${height}`}</Text>;
    },
  }),
  formatLastFourDigits: (lastFour?: string) => lastFour?.trim() || '----',
  getProviderDisplay: (provider: string) => provider.toUpperCase(),
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title, onBackPress }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onBackPress}>
        <Text>{`Nav:${title}`}</Text>
      </Pressable>
    );
  }
));
jest.mock('@/components/payments/PaymentMethodCardComponent', () => (
  ({ option, onPress }: any) => {
    const { Pressable, Text } = require('react-native');
    return <Pressable accessibilityRole="button" onPress={onPress}><Text>{`Method:${option.title}`}</Text></Pressable>;
  }
));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@/components/common/Loading', () => ({
  NativeLoadingIndicator: ({ label }: any) => {
    const { Text } = require('react-native');
    return <Text>{label}</Text>;
  },
}));

const resolvedTrigger = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value) });
const rejectedTrigger = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue(value) });

const cardOne = {
  referenceId: 'card-1',
  paymentMethodProvider: 'visa',
  lastFourCardDigits: '4242',
  paymentMethodExpiry: '12/30',
  billingCardholderName: 'Ada Lovelace',
  billingStreetAddress: '123 Main',
  billingCityAddress: 'Makati',
  billingStateAddress: 'NCR',
  billingPostalCode: '1200',
  billingCountryAddress: 'Philippines',
  isPrimary: false,
};

const cardTwo = {
  ...cardOne,
  referenceId: 'card-2',
  paymentMethodProvider: 'mastercard',
  lastFourCardDigits: '4444',
  billingCardholderName: 'Grace Hopper',
};

describe('payment-method route screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    mockEnrollmentReview.transactionResponse = null;
    mockRouter.canGoBack.mockReturnValue(true);
    mockUpdatePaymentMethod.mockReturnValue(resolvedTrigger({ message: 'Updated' }));
    mockDeletePaymentMethod.mockReturnValue(resolvedTrigger({ message: 'Removed' }));
    mockPaymentMethods = {
      data: [{ ...cardOne }, { ...cardTwo }],
      isLoading: false,
      isFetching: false,
    };
  });

  it('offers the supported add-card method and forwards its title', () => {
    render(<AddCardScreen />);
    fireEvent.press(screen.getByText(/Method:/));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/payment-methods/form-details',
      params: { methodTitle: expect.any(String) },
    });
  });

  it('shows an error without a enrollment transaction and selects a method when one exists', () => {
    const empty = render(<EnrollmentPaymentMethodScreen />);
    expect(screen.getByText('No transaction found. Please go back and try again.')).toBeTruthy();
    empty.unmount();

    mockEnrollmentReview.transactionResponse = { merchantId: 'merchant-1', merchantName: 'Merchant One' };
    render(<EnrollmentPaymentMethodScreen />);
    fireEvent.press(screen.getByText(/Method:/));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/payment-methods/form-details',
      params: { methodTitle: expect.any(String), apiEnv: 'enrollments' },
    });
    fireEvent.press(screen.getByText('Nav:Payment Methods'));
    expect(mockRouter.navigate).toHaveBeenCalledWith({
      pathname: '/(app)/bills/enrollments/form',
      params: { merchantId: 'merchant-1', merchantName: 'Merchant One' },
    });
  });

  it('exits an invalid detail route instead of loading forever', async () => {
    render(<UpdateCardScreen />);

    expect(screen.queryByText('Loading payment method')).toBeNull();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/payment-methods'));
  });

  it('sets a card as default and displays API success', async () => {
    Object.assign(mockParams, { referenceId: 'card-1' });
    render(<UpdateCardScreen />);
    expect(screen.getByText('Nav:VISA 4242')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Set As Default' }));
    await waitFor(() => expect(mockUpdatePaymentMethod).toHaveBeenCalledWith({
      id: 'card-1',
      payload: { paymentIsPrimary: true, paymentIsEnabled: true },
    }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/payment-methods');
    expect(mockRouter.push).not.toHaveBeenCalledWith('/payment-methods');
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Updated', variant: 'success' },
    }));
  });

  it('does not flash the primary-card delete hint while default navigation completes', async () => {
    let resolveUpdate: ((value: any) => void) | undefined;
    mockUpdatePaymentMethod.mockReturnValue({
      unwrap: jest.fn(() => new Promise((resolve) => {
        resolveUpdate = resolve;
      })),
    });
    Object.assign(mockParams, { referenceId: 'card-2' });
    const view = render(<UpdateCardScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Set As Default' }));
    mockPaymentMethods = {
      data: [{ ...cardOne, isPrimary: false }, { ...cardTwo, isPrimary: true }],
      isLoading: false,
      isFetching: false,
    };
    view.rerender(<UpdateCardScreen />);

    expect(screen.queryByText('Set another payment method as default before deleting this one.')).toBeNull();
    expect(screen.queryByText('Primary')).toBeNull();
    expect(screen.getByRole('button', { name: 'Set As Default in progress' }).props.accessibilityState.busy).toBe(true);

    await act(async () => {
      resolveUpdate?.({ message: 'Updated' });
    });
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/payment-methods'));
  });

  it('re-enables actions when the detail route is reused for another non-default card', async () => {
    Object.assign(mockParams, { referenceId: 'card-2' });
    const view = render(<UpdateCardScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Set As Default' }));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/payment-methods'));

    mockPaymentMethods = {
      data: [{ ...cardOne, isPrimary: false }, { ...cardTwo, isPrimary: true }],
      isLoading: false,
      isFetching: false,
    };
    Object.assign(mockParams, { referenceId: 'card-1' });
    view.rerender(<UpdateCardScreen />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Set As Default' }).props.accessibilityState.disabled).toBe(false);
      expect(screen.getByRole('button', { name: 'Delete' }).props.accessibilityState.disabled).toBe(false);
    });
  });

  it('registers confirmed deletion and reports removal failures', async () => {
    Object.assign(mockParams, { referenceId: 'card-2', paymentMethodProvider: 'mastercard' });
    mockDeletePaymentMethod.mockReturnValue(rejectedTrigger({ data: { message: 'Cannot remove card' } }));
    render(<UpdateCardScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'modal/showModal',
      payload: expect.objectContaining({ id: 'deletePaymentMethod' }),
    }));
    await act(async () => {
      await modalActions.deletePaymentMethod();
    });
    expect(mockDeletePaymentMethod).toHaveBeenCalledWith({ id: 'card-2' });
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Cannot remove card', variant: 'error' },
    }));
  });

  it('deletes a non-default method and reports success', async () => {
    Object.assign(mockParams, { referenceId: 'card-2', paymentMethodProvider: 'mastercard' });
    render(<UpdateCardScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    await act(async () => {
      await modalActions.deletePaymentMethod();
    });
    expect(mockDeletePaymentMethod).toHaveBeenCalledWith({ id: 'card-2' });
    expect(mockRouter.replace).toHaveBeenCalledWith('/payment-methods');
    expect(mockRouter.push).not.toHaveBeenCalledWith('/payment-methods');
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Removed', variant: 'success' },
    }));
  });

  it('blocks deleting the default method while other methods exist', () => {
    Object.assign(mockParams, { referenceId: 'card-1' });
    mockPaymentMethods = {
      data: [{ ...cardOne, isPrimary: true }, { ...cardTwo }],
      isLoading: false,
      isFetching: false,
    };
    render(<UpdateCardScreen />);
    expect(screen.getByText('Set another payment method as default before deleting this one.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'modal/showModal' }));
    expect(mockDeletePaymentMethod).not.toHaveBeenCalled();
  });

  it('allows deleting the default method when it is the only one', async () => {
    Object.assign(mockParams, { referenceId: 'card-1' });
    mockPaymentMethods = {
      data: [{ ...cardOne, isPrimary: true }],
      isLoading: false,
      isFetching: false,
    };
    render(<UpdateCardScreen />);
    expect(screen.queryByText('Set another payment method as default before deleting this one.')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'modal/showModal',
      payload: expect.objectContaining({ id: 'deletePaymentMethod' }),
    }));
    await act(async () => {
      await modalActions.deletePaymentMethod();
    });
    expect(mockDeletePaymentMethod).toHaveBeenCalledWith({ id: 'card-1' });
    expect(mockRouter.replace).toHaveBeenCalledWith('/payment-methods');
  });

  it('does not restore a deleted card detail when Back revives its old route', async () => {
    Object.assign(mockParams, { referenceId: 'card-2' });
    mockPaymentMethods = {
      data: [{ ...cardOne }],
      isLoading: false,
      isFetching: false,
    };

    render(<UpdateCardScreen />);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/payment-methods'));
    expect(screen.queryByText('Loading payment method')).toBeNull();
    expect(screen.queryByText('Nav:MASTERCARD 4444')).toBeNull();
  });

  it('shows current cached details when Back revives a route with stale card params', () => {
    Object.assign(mockParams, {
      referenceId: 'card-1',
      paymentMethodProvider: 'mastercard',
      lastFourCardDigits: '0000',
      paymentMethodExpiry: '01/20',
      billingCardholderName: 'Stale Name',
    });
    mockPaymentMethods = {
      data: [{
        ...cardOne,
        paymentMethodExpiry: '11/35',
        billingCardholderName: 'Latest Name',
        isPrimary: true,
      }],
      isLoading: false,
      isFetching: false,
    };

    render(<UpdateCardScreen />);

    expect(screen.getByText('Nav:VISA 4242')).toBeTruthy();
    expect(screen.getByText('Expires: 11/35')).toBeTruthy();
    expect(screen.getByText('Latest Name')).toBeTruthy();
    expect(screen.getByText('Primary')).toBeTruthy();
    expect(screen.queryByText('Stale Name')).toBeNull();
    expect(screen.queryByText('Expires: 01/20')).toBeNull();
  });

  it('resolves a payment method when navigation history restores its reference as an array', () => {
    Object.assign(mockParams, { referenceId: ['card-1'] });

    render(<UpdateCardScreen />);

    expect(screen.getByText('Nav:VISA 4242')).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
