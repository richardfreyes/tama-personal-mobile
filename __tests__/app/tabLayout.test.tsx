import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AppLayout from '@/app/(app)/_layout';
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
  const Stack = ({ screenOptions }: any) => (
    <View>
      <Text>{`Header shown:${screenOptions.headerShown}`}</Text>
    </View>
  );
  return {
    Redirect: ({ href }: any) => <Text>{`Redirect:${href}`}</Text>,
    Stack,
  };
});

describe('AppLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoginState.token = 'test-token';
  });

  it('composes the app stack with floating navigation and no duplicate navigator header', () => {
    render(<AppLayout />);
    expect(screen.getByText('Floating navigation')).toBeTruthy();
    expect(screen.getByText('Header shown:false')).toBeTruthy();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('renders nothing while it checks storage for a saved sign-in, then sends guests to login', async () => {
    mockLoginState.token = null;
    render(<AppLayout />);

    expect(screen.toJSON()).toBeNull();
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'login/retrieveToken' });
    await waitFor(() => expect(screen.getByText('Redirect:/login')).toBeTruthy());
    expect(screen.queryByText('Floating navigation')).toBeNull();
  });
});
