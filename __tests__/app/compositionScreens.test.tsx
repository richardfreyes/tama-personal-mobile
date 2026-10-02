import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import OneTimePaymentsScreen from '@/app/(app)/bills/one-time-payments';
import SavedBillsScreen from '@/app/(app)/bills/one-time-payments/saved';
import EnrolledScreen from '@/app/(app)/bills/enrollments/enrolled';
import OneTimePaymentMethodsScreen from '@/app/(app)/bills/one-time-payments/payment-methods';
import Dashboard from '@/app/(app)/dashboard';
import PaymentMethodsScreen from '@/app/(app)/payment-methods';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

const mockMerchantsResult = {
  data: [{ id: 'merchant-1', pid: 'M1', name: 'Merchant One' }],
  isLoading: false,
  isError: false,
};
const mockDisplayableMerchants = [{ id: 'display-1', pid: 'D1', name: 'Display One' }];
const mockDispatch = jest.fn();
const mockUseGetMerchantsQuery = jest.fn((..._args: any[]) => mockMerchantsResult);
const mockUseGetBillersQuery = jest.fn((..._args: any[]) => ({
  data: [{ merchant_id: 10, merchant_code: 'B1', merchant_name: 'Biller One' }],
  isLoading: false,
  isError: false,
}));
const mockRefetchBills = jest.fn(() => Promise.resolve());
const mockUseGetBillsQuery = jest.fn((..._args: any[]) => ({
  data: [],
  isError: false,
  isFetching: false,
  isLoading: false,
  refetch: mockRefetchBills,
}));
const mockUseGetMonthlyBillsEnrollmentsQuery = jest.fn(() => ({ data: { items: [] } }));
const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;

jest.mock('@/redux/features/merchants/merchantApi', () => ({
  useGetMerchantsQuery: (...args: any[]) => mockUseGetMerchantsQuery(...args),
}));
jest.mock('@/redux/features/biller/billerApi', () => ({
  useGetBillersQuery: (...args: any[]) => mockUseGetBillersQuery(...args),
}));
jest.mock('@/redux/features/bills/billsApi', () => ({
  useGetBillsQuery: (...args: any[]) => mockUseGetBillsQuery(...args),
}));
jest.mock('@/redux/features/enrollments/enrollmentApi', () => ({
  useGetMonthlyBillsEnrollmentsQuery: () => mockUseGetMonthlyBillsEnrollmentsQuery(),
}));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));
jest.mock('@/redux/features/enrollments/review/reviewSlice', () => ({
  clearEnrollmentCardPayload: jest.fn(() => ({
    type: 'enrollmentReview/clearEnrollmentCardPayload',
  })),
  clearEnrollmentTransactionResponse: jest.fn(() => ({
    type: 'enrollmentReview/clearEnrollmentTransactionResponse',
  })),
}));
jest.mock('@/utils/enrollmentMerchants', () => ({
  getDisplayableAutoDebitMerchants: () => mockDisplayableMerchants,
}));
jest.mock('@/context/TabBarAnimationContext', () => ({
  useTabBarAnimation: () => ({ tabBarTranslateY: { value: 0 } }),
}));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
  useTabBarScrollHandler: () => jest.fn(),
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Nav:${title || ''}`}</Text>;
  }
));
jest.mock('@/components/one-time-payments/BillsComponent', () => (
  ({ sectionHeader, sectionFooter, onViewAllPress, onAddBillerPress, onPayNowPress }: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>{`Bills:${sectionHeader?.title}`}</Text>
        {sectionHeader?.linkText ? (
          <Pressable accessibilityRole="button" onPress={onViewAllPress || (() => {})}>
            <Text>{sectionHeader.linkText}</Text>
          </Pressable>
        ) : null}
        {sectionFooter?.button ? (
          <Pressable accessibilityRole="button" onPress={onAddBillerPress || (() => {})}>
            <Text>Add Biller</Text>
          </Pressable>
        ) : null}
        {sectionFooter?.button ? (
          <Pressable accessibilityRole="button" onPress={onPayNowPress || (() => {})}>
            <Text>Pay Now</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
));
jest.mock('@/components/common/SearchMerchants', () => (
  (props: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        {props.sectionTitle ? <Text>{props.sectionTitle}</Text> : null}
        <Text>{`Search:${props.data.length}:${props.isLoading}:${props.isError}:${props.activeCategoryId}`}</Text>
        <Pressable accessibilityRole="button" onPress={() => props.onSelect(props.data[0])}>
          <Text>Select Merchant</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => props.onCategoryChange(99)}>
          <Text>Select Category</Text>
        </Pressable>
      </View>
    );
  }
));
jest.mock('@/components/enrollments/EnrollmentListComponent', () => (
  ({ variant, screenHeader }: any) => {
    const { Text, View } = require('react-native');
    return <View>{screenHeader}<Text>{`EnrollmentList:${variant}`}</Text></View>;
  }
));
jest.mock('@/components/payments/PaymentMethodCardComponent', () => (
  ({ option, onPress }: any) => {
    const { Pressable, Text } = require('react-native');
    return <Pressable accessibilityRole="button" onPress={onPress}><Text>{`Option:${option.title}`}</Text></Pressable>;
  }
));
jest.mock('@/components/payments/PaymentMethodsComponent', () => (
  ({ sectionHeader }: any) => {
    const { Text } = require('react-native');
    return <Text>{`PaymentMethods:${sectionHeader?.title}`}</Text>;
  }
));
jest.mock('@/components/enrollments/MonthlyBills', () => ({
  MonthlyBillsComponent: () => {
    const { Text } = require('react-native');
    return <Text>MonthlyBills</Text>;
  },
}));
jest.mock('@/components/enrollments/AutoDebitCard', () => (
  ({ onPress }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>Never miss a bill</Text>
      </Pressable>
    );
  }
));
jest.mock('@/components/transactions/TransactionHistoryComponent', () => (
  ({ sectionHeader }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Transactions:${sectionHeader?.title}`}</Text>;
  }
));

describe('route composition screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({});
  });

  it('renders the enrolled list variant with its route header', () => {
    render(<EnrolledScreen />);
    expect(screen.getByText('Nav:All Enrollments')).toBeTruthy();
    expect(screen.getByText('EnrollmentList:list')).toBeTruthy();
  });

  it('renders the supported one-time payment options and routes card payments to the form', () => {
    render(<OneTimePaymentMethodsScreen />);
    expect(screen.getAllByText(/Option:/).map((option) => option.props.children)).toEqual([
      'Option:Credit/Debit Card',
      'Option:PayPal',
      'Option:Philippine Banks',
      'Option:QRPH',
    ]);

    fireEvent.press(screen.getByText('Option:Credit/Debit Card'));
    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/payment-methods/form-details',
      params: expect.objectContaining({
        apiEnv: 'one-time',
        methodTitle: 'Credit/Debit Card',
      }),
    }));
  });

  it('renders the One Time Payments overview and forwards biller selection to the one-time payment form', () => {
    render(<OneTimePaymentsScreen />);
    expect(screen.getByText('Nav:One Time Payments')).toBeTruthy();
    expect(screen.getByText('Bills:Saved Billers')).toBeTruthy();
    expect(screen.getByText(/Search:1:false:false:/)).toBeTruthy();
    expect(mockUseGetBillersQuery).toHaveBeenCalledWith({ search: '', category: undefined });

    fireEvent.press(screen.getByText('View All'));
    expect(router.push).toHaveBeenCalledWith('/bills/one-time-payments/saved');

    // The overview list must be one-time-payment billers routed to the OTP add
    // form — not auto-debit merchants routed to the enrollment form.
    fireEvent.press(screen.getByText('Select Merchant'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/bills/one-time-payments/add/form',
      params: {
        merchantId: 10,
        merchantCode: 'B1',
        merchantName: 'Biller One',
      },
    });

    fireEvent.press(screen.getByText('Select Category'));
    expect(screen.getByText(/Search:1:false:false:99/)).toBeTruthy();
    expect(mockUseGetBillersQuery).toHaveBeenLastCalledWith({ search: '', category: 99 });
  });

  it('renders Add Biller within the one-time-payments route and forwards selection', () => {
    mockUseLocalSearchParams.mockReturnValue({ view: 'add' });
    render(<OneTimePaymentsScreen />);

    expect(screen.getByText('Nav:One Time Payments')).toBeTruthy();
    // The add-biller view shows only the biller search, not the Saved Billers section.
    expect(screen.queryByText('Bills:Saved Billers')).toBeNull();
    expect(screen.getByText(/Search:1:false:false:/)).toBeTruthy();
    expect(mockUseGetBillersQuery).toHaveBeenCalledWith({ search: '', category: undefined });

    fireEvent.press(screen.getByText('Select Merchant'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/bills/one-time-payments/add/form',
      params: {
        merchantId: 10,
        merchantCode: 'B1',
        merchantName: 'Biller One',
      },
    });

    fireEvent.press(screen.getByText('Select Category'));
    expect(screen.getByText(/Search:1:false:false:99/)).toBeTruthy();
    expect(mockUseGetBillersQuery).toHaveBeenLastCalledWith({ search: '', category: 99 });
  });

  it('renders the dedicated Saved Bills route', () => {
    render(<SavedBillsScreen />);
    expect(screen.getByTestId('saved-bills-banner')).toBeTruthy();
    expect(screen.getByTestId('saved-bills-list')).toBeTruthy();
  });

  it('composes payment methods and dashboard sections', () => {
    const paymentMethods = render(<PaymentMethodsScreen />);
    expect(screen.getByText('Nav:Payment Methods')).toBeTruthy();
    expect(screen.getByText('PaymentMethods:Manage your saved payment methods')).toBeTruthy();
    paymentMethods.unmount();

    render(<Dashboard />);
    expect(screen.getByText('MonthlyBills')).toBeTruthy();
    expect(screen.getByText('Never miss a bill')).toBeTruthy();
    expect(screen.getByText('Bills:One Time Payments')).toBeTruthy();
    expect(screen.getByText('PaymentMethods:Payment Methods')).toBeTruthy();
    expect(screen.getByText('Transactions:Recent Transactions')).toBeTruthy();
  });

  it('clears enrollment state and navigates when enrolling in auto debit from the dashboard', () => {
    render(<Dashboard />);
    fireEvent.press(screen.getByText('Never miss a bill'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'enrollmentReview/clearEnrollmentCardPayload',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'enrollmentReview/clearEnrollmentTransactionResponse',
    });
    expect(router.push).toHaveBeenCalledWith('/(app)/bills/enrollments');
  });

  it('selects mutually exclusive bill views from the dashboard actions', () => {
    render(<Dashboard />);

    fireEvent.press(screen.getByText('Add Biller'));
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: '/bills/one-time-payments',
      params: { view: 'add' },
    });

    fireEvent.press(screen.getByText('Pay Now'));
    expect(router.push).toHaveBeenLastCalledWith('/bills/one-time-payments/saved');
  });
});
