import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import TabLayout from '@/app/(app)/_layout';
import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => Promise<void>>(() => Promise.resolve());
const mockLoginState = { token: 'test-token' as string | null };

jest.mock('@/context/TabBarAnimationContext', () => ({
  TabBarAnimationProvider: ({ children }: any) => children,
}));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({ login: mockLoginState }),
}));
jest.mock('@/redux/features/login/loginApi', () => ({
  retrieveToken: () => ({ type: 'login/retrieveToken' }),
}));
jest.mock('@/components/layout/FloatingNavBar', () => (
  function MockFloatingNavBar() {
    const { Text } = require('react-native');
    return <Text>Floating navigation</Text>;
  }
));
jest.mock('expo-router', () => {
  const { Text, View } = require('react-native');
  const Tabs = ({ children, screenOptions, tabBar }: any) => (
    <View>
      {tabBar({ state: {}, descriptors: {}, navigation: {} })}
      <Text>{`Header shown:${screenOptions.headerShown}`}</Text>
      {children}
    </View>
  );
  Tabs.Screen = function MockTabScreen({ name }: any) {
    return <Text>{`Tab:${name}`}</Text>;
  };
  return {
    Redirect: ({ href }: any) => <Text>{`Redirect:${href}`}</Text>,
    Tabs,
  };
});

describe('TabLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoginState.token = 'test-token';
  });

  it('composes the dashboard tab with floating navigation and no duplicate navigator header', () => {
    render(<TabLayout />);
    expect(screen.getByText('Floating navigation')).toBeTruthy();
    expect(screen.getByText('Tab:dashboard')).toBeTruthy();
    expect(screen.getByText('Header shown:false')).toBeTruthy();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('renders nothing while it checks storage for a saved sign-in, then sends guests to login', async () => {
    mockLoginState.token = null;
    render(<TabLayout />);

    expect(screen.toJSON()).toBeNull();
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'login/retrieveToken' });
    await waitFor(() => expect(screen.getByText('Redirect:/(auth)/login')).toBeTruthy());
    expect(screen.queryByText('Floating navigation')).toBeNull();
  });
});
