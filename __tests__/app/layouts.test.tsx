import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AuthLayout from '@/app/(auth)/_layout';
import DashboardLayout from '@/app/(app)/(tabs)/dashboard/_layout';
import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockLoginState = { token: null as string | null, loading: 'idle' };
const mockRetrieveToken = jest.fn<(...args: any[]) => any>(() => ({ type: 'login/retrieveToken' }));

jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({ login: mockLoginState }),
}));
jest.mock('@/redux/features/login/loginApi', () => ({
  retrieveToken: () => mockRetrieveToken(),
}));
jest.mock('expo-router', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  const Stack = ({ children }: any) => <View testID="stack">{children}</View>;
  Stack.Screen = ({ name }: any) => <Text>{`Screen:${name}`}</Text>;
  return {
    Redirect: ({ href }: any) => <Text>{`Redirect:${href}`}</Text>,
    Stack,
  };
});

describe('authentication route layouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoginState.token = null;
    mockLoginState.loading = 'idle';
  });

  it('renders all auth routes and retrieves persisted authentication for guests', async () => {
    render(<AuthLayout />);
    expect(screen.getByTestId('stack')).toBeTruthy();
    expect(screen.getByText('Screen:login/index')).toBeTruthy();
    expect(screen.getByText('Screen:signup/index')).toBeTruthy();
    expect(screen.getByText('Screen:reset-password/success')).toBeTruthy();
    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith({ type: 'login/retrieveToken' }));
  });

  it('redirects authenticated users away from auth routes', () => {
    mockLoginState.token = 'token';
    render(<AuthLayout />);
    expect(screen.getByText('Redirect:/dashboard')).toBeTruthy();
  });

  it('renders the dashboard stack without re-checking authentication', () => {
    render(<DashboardLayout />);
    expect(screen.getByTestId('stack')).toBeTruthy();
    expect(screen.queryByText(/^Redirect:/)).toBeNull();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
