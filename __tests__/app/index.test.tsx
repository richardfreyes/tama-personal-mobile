import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import App from '@/app/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockNavigationState = {
  token: null as string | null,
  pathname: '/',
  segments: [] as string[],
};

jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({
    login: { token: mockNavigationState.token },
  }),
}));
jest.mock('@/redux/features/login/loginApi', () => ({
  retrieveToken: () => ({ type: 'login/retrieveToken' }),
}));
jest.mock('@/redux/store', () => ({
  store: {},
}));
jest.mock('react-redux', () => ({
  Provider: ({ children }: any) => children,
}));
jest.mock('expo-router', () => ({
  Redirect: ({ href }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Redirect:${href}`}</Text>;
  },
  usePathname: () => mockNavigationState.pathname,
  useSegments: () => mockNavigationState.segments,
}));

describe('application entry redirector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigationState.token = null;
    mockNavigationState.pathname = '/';
    mockNavigationState.segments = [];
  });

  it('shows preparation state while persisted onboarding is loading', () => {
    (AsyncStorage.getItem as jest.Mock<(...args: any[]) => any>).mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByLabelText('Preparing app')).toBeTruthy();
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'login/retrieveToken' });
  });

  it('sends users who have not onboarded to the intro route', async () => {
    (AsyncStorage.getItem as jest.Mock<(...args: any[]) => any>).mockResolvedValue(null);
    render(<App />);
    expect(await screen.findByText('Redirect:/(auth)/login/intro')).toBeTruthy();
  });

  it.each([
    [null, '/(auth)/login'],
    ['token', '/(app)/dashboard'],
  ])('routes onboarded root users with token %s to %s', async (token, route) => {
    mockNavigationState.token = token;
    (AsyncStorage.getItem as jest.Mock<(...args: any[]) => any>).mockResolvedValue('true');
    render(<App />);
    expect(await screen.findByText(`Redirect:${route}`)).toBeTruthy();
  });

  it('redirects authenticated users away from auth pages', async () => {
    mockNavigationState.token = 'token';
    mockNavigationState.pathname = '/login';
    mockNavigationState.segments = ['(auth)', 'login'];
    (AsyncStorage.getItem as jest.Mock<(...args: any[]) => any>).mockResolvedValue('true');
    render(<App />);
    expect(await screen.findByText('Redirect:/(app)/dashboard')).toBeTruthy();
  });

  it('redirects anonymous users away from protected pages', async () => {
    mockNavigationState.pathname = '/settings';
    mockNavigationState.segments = ['(app)', 'settings'];
    (AsyncStorage.getItem as jest.Mock<(...args: any[]) => any>).mockResolvedValue('true');
    render(<App />);
    expect(await screen.findByText('Redirect:/(auth)/login')).toBeTruthy();
  });

  it('renders no redirect when the current route already matches authentication state', async () => {
    mockNavigationState.pathname = '/login';
    mockNavigationState.segments = ['(auth)', 'login'];
    (AsyncStorage.getItem as jest.Mock<(...args: any[]) => any>).mockResolvedValue('true');
    const { toJSON } = render(<App />);
    await waitFor(() => expect(toJSON()).toBeNull());
  });

  it('treats onboarding storage failures as not onboarded', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    (AsyncStorage.getItem as jest.Mock<(...args: any[]) => any>).mockRejectedValue(new Error('storage unavailable'));
    render(<App />);
    expect(await screen.findByText('Redirect:/(auth)/login/intro')).toBeTruthy();
    expect(warning).toHaveBeenCalled();
    warning.mockRestore();
  });
});
