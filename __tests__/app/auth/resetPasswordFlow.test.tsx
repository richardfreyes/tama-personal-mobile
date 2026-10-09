import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import ResetPasswordScreen from '@/app/(auth)/reset-password';
import OTPDeliverySelectionScreen from '@/app/(auth)/reset-password/otp-delivery-selection';
import VerificationScreen from '@/app/(auth)/reset-password/verify-otp';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

const mockResetPassword = jest.fn<(...args: any[]) => any>();

jest.mock('@/redux/features/resetPassword/resetPasswordApi', () => ({
  useResetPasswordMutation: () => [mockResetPassword, { isLoading: false }],
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  () => {
    const { Text } = require('react-native');
    return <Text>Back navigation</Text>;
  }
));
jest.mock('@/components/forms/InputValidationComponent', () => (
  ({ value, setValue, placeholder, errors, field }: any) => {
    const { Text, TextInput, View } = require('react-native');
    return (
      <View>
        <TextInput
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={setValue}
        />
        {errors?.[field] ? <Text>{errors[field]}</Text> : null}
      </View>
    );
  }
));
jest.mock('@/components/forms/OTPInput', () => (
  ({ onCodeChange }: any) => {
    const { TextInput } = require('react-native');
    return <TextInput accessibilityLabel="OTP" onChangeText={onCodeChange} />;
  }
));
jest.mock('@/components/common/ResendCodeTimer', () => (
  () => {
    const { Text } = require('react-native');
    return <Text>Resend timer</Text>;
  }
));

const resolvedTrigger = (value: any) => ({
  unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value),
});
const rejectedTrigger = (value: any) => ({
  unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue(value),
});

describe('reset-password route flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResetPassword.mockReturnValue(resolvedTrigger({ message: 'sent' }));
  });

  it('validates an empty reset email without calling the API', async () => {
    render(<ResetPasswordScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Email is required.')).toBeTruthy();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('submits a valid email and navigates to check-email instructions', async () => {
    render(<ResetPasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('Email'), 'ada@example.com');
    fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(mockResetPassword).toHaveBeenCalledWith({
      emailAddress: 'ada@example.com',
    }));
    expect(router.push).toHaveBeenCalledWith('/reset-password/check-email');
  });

  it('surfaces API reset errors on the email field', async () => {
    mockResetPassword.mockReturnValue(rejectedTrigger({ data: { error: 'Account not found' } }));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<ResetPasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('Email'), 'ada@example.com');
    fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Account not found')).toBeTruthy();
    consoleError.mockRestore();
  });

  it('labels each OTP delivery choice with its own contact detail', () => {
    render(<OTPDeliverySelectionScreen />);
    expect(screen.getByText('Make Selection')).toBeTruthy();
    expect(screen.getByText('via email:')).toBeTruthy();
    expect(screen.getByText('user@example.com')).toBeTruthy();
    expect(screen.getByText('via SMS:')).toBeTruthy();
    expect(screen.getByText('+63 955 577* ***')).toBeTruthy();
  });

  it('continues with the email method and address when the email card is pressed', () => {
    render(<OTPDeliverySelectionScreen />);
    fireEvent.press(screen.getByText('via email:'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/reset-password/verify-otp',
      params: { method: 'email', identifier: 'user@example.com' },
    });
  });

  it('continues with the text method and phone number when the SMS card is pressed', () => {
    render(<OTPDeliverySelectionScreen />);
    fireEvent.press(screen.getByText('via SMS:'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/reset-password/verify-otp',
      params: { method: 'text', identifier: '+63 955 577* ***' },
    });
  });

  it('automatically continues when six OTP digits are entered', () => {
    render(<VerificationScreen />);
    fireEvent.changeText(screen.getByLabelText('OTP'), '123456');
    expect(router.replace).toHaveBeenCalledWith('/reset-password/create-new-password');
  });

  it('also supports explicit confirmation', () => {
    render(<VerificationScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));
    expect(router.replace).toHaveBeenCalledWith('/reset-password/create-new-password');
  });
});
