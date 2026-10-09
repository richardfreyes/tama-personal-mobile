import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import OneTimePaymentsScreen from '@/app/(app)/bills/one-time-payments';
import SavedBillsScreen from '@/app/(app)/bills/one-time-payments/saved';
import EnrolledScreen from '@/app/(app)/bills/enrollments/enrolled';
import OneTimePaymentMethodsScreen from '@/app/(app)/bills/one-time-payments/payment-methods';
import Dashboard from '@/app/(app)/(tabs)/dashboard';
import PaymentMethodsScreen from '@/app/(app)/(tabs)/payment-methods';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

const mockMerchantsResult = {
  data: [{ id: 'merchant-1', pid: 'M1', name: 'Merchant One' }],
  isLoading: false,
  isError: false,
};
const mockDisplayableMerchants = [{ id: 'display-1', pid: 'D1', name: 'Display One' }];
const mockDispatch = jest.fn();
const mockDirectoryProps = jest.fn();
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
const mockUseAllSavedBills = jest.fn<(...args: any[]) => any>();
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
jest.mock('@/hooks/useAllSavedBills', () => ({
  useAllSavedBills: (options: unknown) => mockUseAllSavedBills(options),
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
  GlobalScrollView: function MockGlobalScrollView({ children }: any) {
    const { View } = require('react-native');
    return <View testID="dashboard-scroll">{children}</View>;
  },
  useTabBarScrollHandler: () => jest.fn(),
}));
jest.mock('@/components/layout/HeaderComponent', () => (
  function MockHeaderComponent() {
    const { Text } = require('react-native');
    return <Text>Dashboard Header</Text>;
  }
));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  function MockNavHeaderComponent({ title }: any) {
    const { Text } = require('react-native');
    return <Text>{`Nav:${title || ''}`}</Text>;
  }
));
jest.mock('@/components/one-time-payments/BillsComponent', () => (
  function MockBillsComponent({ sectionHeader, sectionFooter, onViewAllPress, onAddBillerPress, onPayNowPress }: any) {
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
  function MockSearchMerchants(props: any) {
    const { Pressable, Text, View } = require('react-native');
    if (!props.onCategoryChange) {
      mockDirectoryProps(props);
      return (
        <View>
          {props.header}
          <Text>{`Directory:${props.data.length}:${props.isLoading}:${props.isError}:${Array.from(props.savedMerchantIds ?? []).join(',')}`}</Text>
          <Pressable accessibilityRole="button" onPress={props.onRetry}>
            <Text>Retry billers</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View>
        <Text>{`Billers:${props.data.length}:category:${props.activeCategoryId}`}</Text>
        <Pressable accessibilityRole="button" onPress={() => props.onSelect(props.data[0])}><Text>Select biller</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => props.onCategoryChange(2)}><Text>Filter billers</Text></Pressable>
      </View>
    );
  }
));
jest.mock('@/components/enrollments/EnrollmentListComponent', () => (
  function MockEnrollmentListComponent({ variant, screenHeader }: any) {
    const { Text, View } = require('react-native');
    return <View>{screenHeader}<Text>{`EnrollmentList:${variant}`}</Text></View>;
  }
));
jest.mock('@/components/payments/PaymentMethodCardComponent', () => (
  function MockPaymentMethodCardComponent({ option, onPress }: any) {
    const { Pressable, Text } = require('react-native');
    return <Pressable accessibilityRole="button" onPress={onPress}><Text>{`Option:${option.title}`}</Text></Pressable>;
  }
));
jest.mock('@/components/payments/PaymentMethodsComponent', () => (
  function MockPaymentMethodsComponent({ sectionHeader, sectionFooter, route, isRefreshable }: any) {
    const { Text, View } = require('react-native');
    return (
      <View>
        <Text>{`PaymentMethods:${sectionHeader?.title}`}</Text>
        <Text>{`PaymentMethods options:${route ?? '-'}:${String(isRefreshable)}:${String(sectionFooter?.button)}`}</Text>
      </View>
    );
  }
));
jest.mock('@/components/enrollments/MonthlyBills', () => ({
  MonthlyBillsComponent: function MockMonthlyBillsComponent() {
    const { Text } = require('react-native');
    return <Text>MonthlyBills</Text>;
  },
}));
jest.mock('@/components/enrollments/AutoDebitCard', () => (
  function MockAutoDebitCard({ activeCount, isError, isLoading, onPress }: any) {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{`Auto Debit:${activeCount}:${Boolean(isLoading)}:${Boolean(isError)}`}</Text>
      </Pressable>
    );
  }
));
jest.mock('@/components/transactions/TransactionHistoryComponent', () => (
  function MockTransactionHistoryComponent({ sectionHeader, limit }: any) {
    const { Text } = require('react-native');
    return <Text>{`Transactions:${sectionHeader?.title}:${limit ?? 'all'}`}</Text>;
  }
));

describe('route composition screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({});
    mockUseGetBillsQuery.mockReturnValue({
      data: [],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mockRefetchBills,
    });
    mockUseAllSavedBills.mockImplementation(({ skip }: { skip: boolean }) => ({
      bills: skip ? [] : mockUseGetBillsQuery({ page: 0 }).data ?? [],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchBills,
    }));
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

  it('renders the One Time Payments screen: saved billers above a directory of the billers', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [{ billing_reference_id: 'bill-1', merchant_id: 10 }] as any,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mockRefetchBills,
    });
    render(<OneTimePaymentsScreen />);

    expect(screen.getByText('Nav:One Time Payments')).toBeTruthy();
    expect(screen.getByText('Bills:Saved billers')).toBeTruthy();

    expect(screen.getByText('Directory:1:false:false:10')).toBeTruthy();
    expect(mockUseGetBillersQuery).toHaveBeenCalledWith({});
  });

  it('marks merchants saved on later pages in the directory', () => {
    mockUseAllSavedBills.mockReturnValue({
      bills: [{ billing_reference_id: 'bill-1', merchant_id: 10 }, { billing_reference_id: 'bill-2', merchant_id: 20 }],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchBills,
    });
    render(<OneTimePaymentsScreen />);

    expect(screen.getByText('Directory:1:false:false:10,20')).toBeTruthy();
  });

  it('opens the saved bills from Manage', () => {
    render(<OneTimePaymentsScreen />);

    fireEvent.press(screen.getByText('Manage'));
    expect(router.push).toHaveBeenCalledWith('/bills/one-time-payments/saved');
  });

  it('only shows the billers in the list: nothing in it can be selected yet', () => {
    render(<OneTimePaymentsScreen />);

    expect(mockDirectoryProps).toHaveBeenCalled();
    const props = mockDirectoryProps.mock.calls[0][0] as Record<string, unknown>;
    expect(props.onSelect).toBeUndefined();
    expect(props.onAddBillerPress).toBeUndefined();
  });

  it('passes the billers loading and error state on to the directory and retries it', () => {
    mockUseGetBillersQuery.mockReturnValueOnce({ data: undefined, isLoading: true, isError: false } as any);
    const loading = render(<OneTimePaymentsScreen />);
    expect(screen.getByText('Directory:0:true:false:')).toBeTruthy();
    loading.unmount();

    const refetch = jest.fn();
    mockUseGetBillersQuery.mockReturnValueOnce({ data: undefined, isLoading: false, isError: true, refetch } as any);
    render(<OneTimePaymentsScreen />);
    expect(screen.getByText('Directory:0:false:true:')).toBeTruthy();
    fireEvent.press(screen.getByText('Retry billers'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('opens the add-biller picker from view=add and routes a selected merchant to the form', () => {
    mockUseLocalSearchParams.mockReturnValue({ view: 'add' });
    render(<OneTimePaymentsScreen />);

    expect(screen.getByText('Nav:Add Biller')).toBeTruthy();
    expect(screen.getByText('Billers:1:category:undefined')).toBeTruthy();
    expect(screen.queryByText('Directory:1:false:false:')).toBeNull();
    expect(mockUseGetBillersQuery).toHaveBeenCalledWith({ search: '', category: undefined });
    expect(mockUseAllSavedBills).toHaveBeenCalledWith({ skip: true });

    fireEvent.press(screen.getByText('Select biller'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/add/form',
      params: {
        merchantId: '10',
        merchantCode: 'B1',
        merchantName: 'Biller One',
      },
    });

    fireEvent.press(screen.getByText('Filter billers'));
    expect(mockUseGetBillersQuery).toHaveBeenCalledWith({ search: '', category: 2 });
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
    expect(within(screen.getByTestId('dashboard-scroll')).getByText('Dashboard Header')).toBeTruthy();
    expect(screen.getByText('MonthlyBills')).toBeTruthy();
    expect(screen.getByText('Auto Debit:0:false:false')).toBeTruthy();
    expect(screen.getByText('Bills:One Time Payments')).toBeTruthy();
    expect(screen.getByText('Transactions:Recent Transactions:3')).toBeTruthy();
    expect(screen.getByText('PaymentMethods:Payment Methods')).toBeTruthy();
  });

  it('reuses the shared sections with the dashboard options', () => {
    render(<Dashboard />);

    expect(screen.getByText('Add Biller')).toBeTruthy();
    expect(screen.getByText('Pay Now')).toBeTruthy();

    expect(screen.getByText('PaymentMethods options:/dashboard:false:false')).toBeTruthy();
  });

  it('passes the loading and error state of the enrollments query to Auto Debit', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValueOnce({ isLoading: true } as any);
    const loading = render(<Dashboard />);
    expect(screen.getByText('Auto Debit:0:true:false')).toBeTruthy();
    loading.unmount();

    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValueOnce({ isError: true, isFetching: true } as any);
    const retrying = render(<Dashboard />);
    expect(screen.getByText('Auto Debit:0:true:true')).toBeTruthy();
    retrying.unmount();

    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValueOnce({ isError: true, isFetching: false } as any);
    render(<Dashboard />);
    expect(screen.getByText('Auto Debit:0:false:true')).toBeTruthy();
  });

  it('clears enrollment state and navigates when enrolling in auto debit from the dashboard', () => {
    render(<Dashboard />);
    fireEvent.press(screen.getByText('Auto Debit:0:false:false'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'enrollmentReview/clearEnrollmentCardPayload',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'enrollmentReview/clearEnrollmentTransactionResponse',
    });
    expect(router.push).toHaveBeenCalledWith('/bills/enrollments');
  });

  it('only counts running enrollments as active, not pending or in-review ones', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValueOnce({
      data: { items: [{ status: 'PENDING' }, { status: 'FOR_REVIEW' }, { status: 'ONGOING' }, { status: 'CANCELLED' }] },
    } as any);
    render(<Dashboard />);
    expect(screen.getByText('Auto Debit:1:false:false')).toBeTruthy();
  });

  it('sends a member with only pending enrollments to enroll rather than to the list', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValueOnce({
      data: { items: [{ status: 'PENDING' }] },
    } as any);
    render(<Dashboard />);
    fireEvent.press(screen.getByText('Auto Debit:0:false:false'));
    expect(router.push).toHaveBeenCalledWith('/bills/enrollments');
  });

  it('opens the existing Auto Debit enrollment list for an active member', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValueOnce({
      data: { items: [{ status: 'ACTIVE' }] },
    } as any);
    render(<Dashboard />);
    fireEvent.press(screen.getByText('Auto Debit:1:false:false'));
    expect(router.push).toHaveBeenCalledWith('/bills/enrollments/enrolled');
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
