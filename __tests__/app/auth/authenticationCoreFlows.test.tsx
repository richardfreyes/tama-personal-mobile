import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import ChangeEmailConfirmScreen from '@/app/(auth)/change-email-confirm';
import LoginScreen from '@/app/(auth)/login';
import CreateNewPasswordScreen from '@/app/(auth)/reset-password/create-new-password';
import SignupScreen from '@/app/(auth)/signup';
import VerificationScreen from '@/app/(auth)/verify';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockLogin = jest.fn<(...args: any[]) => any>();
const mockSignup = jest.fn<(...args: any[]) => any>();
const mockVerifyOtp = jest.fn<(...args: any[]) => any>();
const mockResendOtp = jest.fn<(...args: any[]) => any>();
const mockResetWithToken = jest.fn<(...args: any[]) => any>();
const mockConfirmEmail = jest.fn<(...args: any[]) => any>();
const mockRouter = {
  navigate: jest.fn<(...args: any[]) => any>(),
  push: jest.fn<(...args: any[]) => any>(),
  replace: jest.fn<(...args: any[]) => any>(),
};
const mockParams: Record<string, any> = {};
const mockChangeEmailState = { isLoading: false, isSuccess: false };

jest.mock('expo-router', () => ({
  router: {
    navigate: (...args: any[]) => mockRouter.navigate(...args),
    push: (...args: any[]) => mockRouter.push(...args),
    replace: (...args: any[]) => mockRouter.replace(...args),
  },
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (callback: any) => {
    const React = require('react');
    React.useEffect(() => callback(), []);
  },
}));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));
jest.mock('@/redux/features/auth/auth', () => ({
  useLoginMutation: () => [mockLogin, { isLoading: false }],
}));
jest.mock('@/redux/features/signup/signupApi', () => ({
  useSignupMutation: () => [mockSignup, { isLoading: false }],
  useVerifyOtpMutation: () => [mockVerifyOtp, { isLoading: false }],
  useResendOtpMutation: () => [mockResendOtp, { isLoading: false }],
}));
jest.mock('@/redux/features/resetPassword/resetPasswordApi', () => ({
  useResetPasswordWithTokenMutation: () => [mockResetWithToken, { isLoading: false }],
}));
jest.mock('@/redux/features/accountSecurity/accountSecurityApi', () => ({
  useChangeEmailConfirmMutation: () => [mockConfirmEmail, mockChangeEmailState],
}));
jest.mock('@/services/authStorage', () => ({
  clearBiometricCredentials: jest.fn<(...args: any[]) => any>().mockResolvedValue(undefined),
  getBiometricCredentials: jest.fn<(...args: any[]) => any>().mockResolvedValue(null),
  hasBiometricsEnabled: jest.fn<(...args: any[]) => any>().mockResolvedValue(false),
  saveBiometricCredentials: jest.fn<(...args: any[]) => any>().mockResolvedValue(undefined),
}));
jest.mock('expo-local-authentication', () => ({
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
  authenticateAsync: jest.fn<(...args: any[]) => any>(),
  hasHardwareAsync: jest.fn<(...args: any[]) => any>().mockResolvedValue(false),
  isEnrolledAsync: jest.fn<(...args: any[]) => any>().mockResolvedValue(false),
  supportedAuthenticationTypesAsync: jest.fn<(...args: any[]) => any>().mockResolvedValue([]),
}));
jest.mock('@/utils/appInfo', () => ({
  getAppVersionLabel: () => '1.0.0',
}));
jest.mock('@/utils/jwt', () => ({
  decodeJwt: () => ({ firstName: 'Ada', lastName: 'Lovelace' }),
}));
jest.mock('@/components/layout/NavHeaderComponent', () => () => {
  const { Text } = require('react-native');
  return <Text>Back navigation</Text>;
});
jest.mock('@/components/forms/InputValidationComponent', () => (
  ({ placeholder, value, setValue, errors, field }: any) => {
    const { Text, TextInput, View } = require('react-native');
    return (
      <View>
        <TextInput accessibilityLabel={placeholder} value={value} onChangeText={setValue} />
        {errors?.[field] ? <Text>{errors[field]}</Text> : null}
      </View>
    );
  }
));
jest.mock('@/components/forms/PasswordRule', () => (
  ({ text, valid }: any) => {
    const { Text } = require('react-native');
    return <Text>{`${text}:${valid}`}</Text>;
  }
));
jest.mock('@/components/forms/OTPInput', () => (
  ({ onCodeChange, error }: any) => {
    const { Text, TextInput, View } = require('react-native');
    return <View><TextInput accessibilityLabel="OTP" onChangeText={onCodeChange} />{error ? <Text>{error}</Text> : null}</View>;
  }
));
jest.mock('@/components/common/ResendCodeTimer', () => (
  ({ onResend }: any) => {
    const { Pressable, Text } = require('react-native');
    return <Pressable accessibilityRole="button" onPress={onResend}><Text>Resend code</Text></Pressable>;
  }
));
jest.mock('@/components/settings/TermsAndPolicyText', () => (
  ({ isChecked, onToggle }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: isChecked }} onPress={onToggle}>
        <Text>{`Accept terms:${isChecked}`}</Text>
      </Pressable>
    );
  }
));

const resolvedTrigger = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value) });
const rejectedTrigger = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue(value) });

describe('core authentication route behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    mockChangeEmailState.isLoading = false;
    mockChangeEmailState.isSuccess = false;
    mockLogin.mockReturnValue(resolvedTrigger({ token: 'access-token' }));
    mockSignup.mockReturnValue(resolvedTrigger({ token: 'temporary-token' }));
    mockVerifyOtp.mockReturnValue(resolvedTrigger({ message: 'Verified' }));
    mockResendOtp.mockReturnValue(resolvedTrigger({ message: 'Sent again' }));
    mockResetWithToken.mockReturnValue(resolvedTrigger({}));
  });

  it('validates login input and submits valid credentials', async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({ message: 'Validation error. Please correct the form errors.' }),
    }));

    fireEvent.changeText(screen.getByLabelText('Email'), 'ada@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'Correct1!Password');
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({
      username: 'ada@example.com',
      password: 'Correct1!Password',
      rememberMe: false,
    }));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('routes login responses that require OTP verification and reports API failures', async () => {
    mockLogin.mockReturnValueOnce(resolvedTrigger({ redirect: '/verify?token=temp-123' }));
    const view = render(<LoginScreen />);
    fireEvent.changeText(screen.getByLabelText('Email'), 'ada@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'Correct1!Password');
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/verify',
      params: { email: 'ada@example.com', tempToken: 'temp-123' },
    }));
    view.unmount();

    mockLogin.mockReturnValue(rejectedTrigger({ data: { message: 'Account locked' } }));
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByLabelText('Email'), 'ada@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'Correct1!Password');
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Account locked', variant: 'error' },
    })));
  });

  it('requires signup terms, then submits a valid registration and opens verification', async () => {
    render(<SignupScreen />);
    const fields = {
      'First Name': 'Ada',
      'Last Name': 'Lovelace',
      Email: 'ada@example.com',
      Password: 'Correct1!Password',
      'Confirm Password': 'Correct1!Password',
    };
    for (const [label, value] of Object.entries(fields)) {
      fireEvent.changeText(screen.getByLabelText(label), value);
    }
    fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
    expect(mockSignup).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('checkbox'));
    fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => expect(mockSignup).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Ada',
      lastName: 'Lovelace',
      emailAddress: 'ada@example.com',
      rawPassword: 'Correct1!Password',
    })));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/verify',
      params: { email: 'ada@example.com', tempToken: 'temporary-token' },
    }));
  });

  it('validates, verifies, and resends signup OTP codes', async () => {
    Object.assign(mockParams, { email: 'ada@example.com', tempToken: 'temp-token' });
    render(<VerificationScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));
    expect(mockVerifyOtp).not.toHaveBeenCalled();
    fireEvent.changeText(screen.getByLabelText('OTP'), '123456');
    fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(mockVerifyOtp).toHaveBeenCalledWith({ code: '123456', token: 'temp-token' }));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Verified', variant: 'success' },
    }));
    fireEvent.press(screen.getByRole('button', { name: 'Resend code' }));
    await waitFor(() => expect(mockResendOtp).toHaveBeenCalledWith({ token: 'temp-token' }));
  });

  it('submits a complete new password only when reset credentials are present', async () => {
    Object.assign(mockParams, { token: 'reset-token', code: 'reset-code' });
    render(<CreateNewPasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('Password'), 'Correct1!Password');
    fireEvent.changeText(screen.getByLabelText('Confirm Password'), 'Correct1!Password');
    fireEvent.press(screen.getByRole('checkbox'));
    fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(mockResetWithToken).toHaveBeenCalledWith({
      token: 'reset-token',
      code: 'reset-code',
      newPassword: 'Correct1!Password',
    }));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/reset-password/success'));
  });

  it('renders change-email loading, success, and invalid-link states', () => {
    Object.assign(mockParams, { Otoken: 'old', Ntoken: 'new', code: 'code' });
    mockChangeEmailState.isLoading = true;
    const loading = render(<ChangeEmailConfirmScreen />);
    expect(screen.getByText('Verifying your new email...')).toBeTruthy();
    expect(mockConfirmEmail).toHaveBeenCalledWith({ Otoken: 'old', Ntoken: 'new', code: 'code' });
    loading.unmount();

    mockChangeEmailState.isLoading = false;
    mockChangeEmailState.isSuccess = true;
    const success = render(<ChangeEmailConfirmScreen />);
    expect(screen.getByText('Email successfully updated.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Back to Login' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    success.unmount();

    mockChangeEmailState.isSuccess = false;
    render(<ChangeEmailConfirmScreen />);
    expect(screen.getByText('Update Failed')).toBeTruthy();
  });
});
