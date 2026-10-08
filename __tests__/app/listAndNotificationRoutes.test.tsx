import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import EnrollmentHomeScreen from '@/app/(app)/bills/enrollments';
import NotificationsScreen from '@/app/(app)/notifications';
import TransactionsScreen from '@/app/(app)/(tabs)/transactions';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { RefreshControl } from 'react-native';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockRouter = { push: jest.fn<(...args: any[]) => any>() };
const mockEnrollmentRefresh = jest.fn<(...args: any[]) => any>().mockResolvedValue(undefined);
const mockTransactionRefresh = jest.fn<(...args: any[]) => any>().mockResolvedValue(undefined);
const mockTransactionLoadMore = jest.fn<(...args: any[]) => any>();
const mockSheet = { close: jest.fn<(...args: any[]) => any>(), snapToIndex: jest.fn<(...args: any[]) => any>() };

jest.mock('expo-router', () => ({
  router: {
    push: (...args: any[]) => mockRouter.push(...args),
  },
  useFocusEffect: (callback: any) => {
    const React = require('react');
    React.useEffect(() => callback(), []);
  },
}));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));
jest.mock('@/redux/features/merchants/merchantApi', () => ({
  useGetMerchantsQuery: () => ({
    data: [{ id: 'merchant-1', pid: 'M1', name: 'Merchant One' }],
    isLoading: false,
    isError: false,
  }),
}));
jest.mock('@/utils/enrollmentMerchants', () => ({
  getDisplayableAutoDebitMerchants: (data: any) => data || [],
}));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children, refreshControl, onScroll }: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        {refreshControl}
        {onScroll ? <Pressable accessibilityRole="button" onPress={onScroll}><Text>Scroll list</Text></Pressable> : null}
        {children}
      </View>
    );
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title, rightNav }: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>{`Nav:${title}`}</Text>
        {rightNav ? <Pressable accessibilityRole="button" onPress={rightNav.onPress}><Text>More options</Text></Pressable> : null}
      </View>
    );
  }
));
jest.mock('@/components/layout/SlideUpScreenModal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SlideUpScreenModal: React.forwardRef(({ children }: any, ref: any) => {
      React.useImperativeHandle(ref, () => mockSheet);
      return <View>{children}</View>;
    }),
  };
});
jest.mock('@/components/common/SearchMerchants', () => (
  ({ data, activeCategoryId, onSelect, onCategoryChange }: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>{`Merchants:${data.length}:category:${activeCategoryId}`}</Text>
        <Pressable accessibilityRole="button" onPress={() => onSelect(data[0])}><Text>Select enrollment merchant</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => onCategoryChange(7)}><Text>Change category</Text></Pressable>
      </View>
    );
  }
));
jest.mock('@/components/enrollments/EnrollmentListComponent', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return React.forwardRef(({ variant }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({ refresh: mockEnrollmentRefresh }));
    return <Text>{`Enrollments:${variant}`}</Text>;
  });
});
jest.mock('@/components/settings/NotificationItem', () => (
  ({ id, title, isRead, onPress }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={() => onPress(id)}>
        <Text>{`Notification:${title}:${isRead}`}</Text>
      </Pressable>
    );
  }
));
jest.mock('@/components/common/ToggleOption', () => (
  ({ initialSelected, onOptionChange }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={() => onOptionChange('Unread')}>
        <Text>{`Toggle:${initialSelected}`}</Text>
      </Pressable>
    );
  }
));
jest.mock('@/components/transactions/TransactionHistoryComponent', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return React.forwardRef(({ activeFilters, onOpenFilterSheet }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      refresh: mockTransactionRefresh,
      loadMore: mockTransactionLoadMore,
    }));
    return (
      <View>
        <Text>{`TransactionFilters:${JSON.stringify(activeFilters)}`}</Text>
        <Pressable accessibilityRole="button" onPress={onOpenFilterSheet}><Text>Open filters</Text></Pressable>
      </View>
    );
  });
});
jest.mock('@/components/payments/FilterAutopay', () => (
  ({ onApply, onReset }: any) => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Pressable accessibilityRole="button" onPress={() => onApply({ statuses: ['paid'] })}><Text>Apply filters</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onReset}><Text>Reset filters</Text></Pressable>
      </View>
    );
  }
));

describe('enrollment, transaction-list, and notification routes', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('clears stale enrollment state, filters merchants, selects one, and refreshes enrollments', async () => {
    const view = render(<EnrollmentHomeScreen />);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'enrollmentReview/clearEnrollmentTransactionResponse', payload: undefined });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'enrollmentReview/clearEnrollmentCardPayload', payload: undefined });
    fireEvent.press(screen.getByText('Change category'));
    expect(screen.getByText('Merchants:1:category:7')).toBeTruthy();
    fireEvent.press(screen.getByText('Select enrollment merchant'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'enrollmentReview/triggerEnrollmentFormReset', payload: undefined });
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/bills/enrollments/form',
      params: { merchantId: 'merchant-1', merchantCode: 'M1', merchantName: 'Merchant One' },
    });
    const refresh = view.UNSAFE_getByType(RefreshControl);
    await refresh.props.onRefresh();
    expect(mockEnrollmentRefresh).toHaveBeenCalled();
  });

  it('shows the empty notification state and opens route actions', () => {
    render(<NotificationsScreen />);
    expect(screen.getByText('You have no notifications.')).toBeTruthy();
    expect(screen.queryByText(/Notification:/)).toBeNull();
    fireEvent.press(screen.getByText('More options'));
    expect(mockSheet.snapToIndex).toHaveBeenCalledWith(1);
  });

  it('marks notifications read from the overflow menu instead of opening settings', () => {
    render(<NotificationsScreen />);
    fireEvent.press(screen.getByText('Mark All As Read'));
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockSheet.close).toHaveBeenCalled();
    fireEvent.press(screen.getByText('Notification Settings'));
    expect(mockRouter.push).toHaveBeenCalledWith('/notifications/settings');
  });

  it('opens, applies, resets, refreshes, and paginates transaction filters', async () => {
    const view = render(<TransactionsScreen />);
    fireEvent.press(screen.getByText('Open filters'));
    expect(mockSheet.snapToIndex).toHaveBeenCalledWith(2);
    fireEvent.press(screen.getByText('Apply filters'));
    expect(screen.getByText(/paid/)).toBeTruthy();
    expect(mockSheet.close).toHaveBeenCalled();
    fireEvent.press(screen.getByText('Reset filters'));
    const refresh = view.UNSAFE_getByType(RefreshControl);
    await refresh.props.onRefresh();
    expect(mockTransactionRefresh).toHaveBeenCalled();
    fireEvent.press(screen.getByText('Scroll list'));
    expect(mockTransactionLoadMore).toHaveBeenCalled();
  });
});
