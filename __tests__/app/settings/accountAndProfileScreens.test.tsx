import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AccountSettingsScreen from '@/app/(app)/settings';
import SecurityScreen from '@/app/(app)/settings/security';
import ProfileScreen from '@/app/(app)/settings/profile';
import NotificationSettingsScreen from '@/app/(app)/notifications/settings';
import { modalActions } from '@/utils/modalActions';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl } from 'react-native';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockHandleSettingsRoute = jest.fn<(...args: any[]) => any>();
const mockRefetch = jest.fn<(...args: any[]) => any>();
const mockProfileResult = {
  data: {
    customerAddress: '123 Main Street',
    customerAddressCity: 'Makati',
    customerAddressState: 'Metro Manila',
    customerAddressPostalCode: '1200',
    customerCountryIso2Code: 'PH',
  } as any,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: mockRefetch,
};

jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));
jest.mock('@/redux/store', () => ({
  store: { dispatch: (...args: any[]) => mockDispatch(...args) },
}));
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  }),
}));
jest.mock('@/redux/appApi', () => ({
  appApi: {
    util: {
      resetApiState: () => ({ type: 'appApi/reset' }),
    },
  },
}));
jest.mock('@/redux/features/login/loginApi', () => ({ clearSession: () => ({ type: 'login/clearSession' }) }));
jest.mock('@/redux/features/profile/profileApi', () => ({
  useGetProfileDataQuery: () => mockProfileResult,
}));
jest.mock('@/services/navigation', () => ({
  handleSettingsRoute: (...args: any[]) => mockHandleSettingsRoute(...args),
}));
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn<(...args: any[]) => any>(),
}));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Nav:${title || ''}`}</Text>;
  }
));
jest.mock('@/components/settings/NotificationSetting', () => (
  ({ label, isEnabled, onToggle }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: isEnabled }} onPress={onToggle}>
        <Text>{`${label}:${isEnabled}`}</Text>
      </Pressable>
    );
  }
));

describe('account, security, profile, and notification settings screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProfileResult.isLoading = false;
    mockProfileResult.isFetching = false;
    mockProfileResult.isError = false;
    mockProfileResult.data = {
      customerAddress: '123 Main Street',
      customerAddressCity: 'Makati',
      customerAddressState: 'Metro Manila',
      customerAddressPostalCode: '1200',
      customerCountryIso2Code: 'PH',
    };
  });

  it('renders account identity and delegates ordinary settings routes', () => {
    render(<AccountSettingsScreen />);
    expect(screen.getByText('AL')).toBeTruthy();
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('ada@example.com')).toBeTruthy();
    fireEvent.press(screen.getByText('Profile'));
    expect(mockHandleSettingsRoute).toHaveBeenCalledWith('/settings/profile');
    fireEvent.press(screen.getByText('Contact Us'));
    expect(mockHandleSettingsRoute).toHaveBeenCalledWith('/settings/contact');
  });

  it('opens support and registers a confirmed logout action', async () => {
    render(<AccountSettingsScreen />);
    fireEvent.press(screen.getByText('Help'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://support.aqwire.io/portal/en/home');

    fireEvent.press(screen.getByText('Logout'));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'modal/showModal',
      payload: expect.objectContaining({
        headerMessage: 'Logout',
        id: 'setDefaultPaymentMethod',
      }),
    }));
    modalActions.setDefaultPaymentMethod();
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'login/clearSession' });
    await Promise.resolve();
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('routes security actions and opens the deactivation modal', () => {
    render(<SecurityScreen />);
    fireEvent.press(screen.getByText('Change Email'));
    expect(router.push).toHaveBeenCalledWith('.//security/change-email');
    fireEvent.press(screen.getByText('Deactivation or Deletion'));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'modal/showModal',
      payload: expect.objectContaining({
        id: 'deactivationDeletion',
        bodyType: 'accountDeletion',
      }),
    }));
  });

  it('shows profile loading, normal details, refresh, and error behavior', () => {
    mockProfileResult.isLoading = true;
    const loading = render(<ProfileScreen />);
    expect(screen.getByTestId('profile-skeleton')).toBeTruthy();
    loading.unmount();

    mockProfileResult.isLoading = false;
    const normal = render(<ProfileScreen />);
    expect(screen.getByText('Ada')).toBeTruthy();
    expect(screen.getByText('123 Main Street')).toBeTruthy();
    const refresh = normal.UNSAFE_getByType(RefreshControl);
    refresh.props.onRefresh();
    expect(mockRefetch).toHaveBeenCalled();
    normal.unmount();

    mockProfileResult.isError = true;
    render(<ProfileScreen />);
    expect(screen.getByText('Unable to load profile at the moment. Please try again later.')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(1);
  });

  it('toggles notification preferences independently', () => {
    render(<NotificationSettingsScreen />);
    expect(screen.getByText('Push Notifications:true')).toBeTruthy();
    expect(screen.getByText('Email Notifications:false')).toBeTruthy();
    fireEvent.press(screen.getByText('Push Notifications:true'));
    fireEvent.press(screen.getByText('Email Notifications:false'));
    expect(screen.getByText('Push Notifications:false')).toBeTruthy();
    expect(screen.getByText('Email Notifications:true')).toBeTruthy();
    expect(screen.getByText('Product Updates:true')).toBeTruthy();
  });
});
