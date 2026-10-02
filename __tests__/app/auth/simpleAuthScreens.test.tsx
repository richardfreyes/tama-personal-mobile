import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import CheckEmailScreen from '@/app/(auth)/reset-password/check-email';
import SuccessScreen from '@/app/(auth)/reset-password/success';
import IntroScreen from '@/app/(auth)/login/intro';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

jest.mock('@/components/layout/NavHeaderComponent', () => (
  () => {
    const { Text } = require('react-native');
    return <Text>Back navigation</Text>;
  }
));

describe('simple authentication screens', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns to login from the successful password reset state and disables while navigating', () => {
    render(<SuccessScreen />);
    expect(screen.getByText('Password successfully changed')).toBeTruthy();
    const button = screen.getByRole('button', { name: 'Back to Login' });
    fireEvent.press(button);
    expect(router.replace).toHaveBeenCalledWith('/login');
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
  });

  it('explains email recovery and returns to the auth login route', () => {
    render(<CheckEmailScreen />);
    expect(screen.getByText('Check Your Email')).toBeTruthy();
    expect(screen.getByText(/sent instructions to recover your account/)).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Back to Login' }));
    expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('marks onboarding complete before navigating from the intro screen', async () => {
    (AsyncStorage.setItem as jest.Mock<(...args: any[]) => any>).mockResolvedValue(undefined);
    render(<IntroScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('hasOnboarded', 'true'));
    expect(router.replace).toHaveBeenCalledWith('login');
  });
});
