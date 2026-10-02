import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import EditAddressScreen from '@/app/(app)/settings/profile/edit-address';
import EditInfoScreen from '@/app/(app)/settings/profile/edit-info';
import ChangeEmailScreen from '@/app/(app)/settings/security/change-email';
import ChangePasswordScreen from '@/app/(app)/settings/security/change-password';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockUpdateAddress = jest.fn<(...args: any[]) => any>();
const mockUpdateProfile = jest.fn<(...args: any[]) => any>();
const mockUpdateEmail = jest.fn<(...args: any[]) => any>();
const mockUpdatePassword = jest.fn<(...args: any[]) => any>();
const mockRefetch = jest.fn<(...args: any[]) => any>();
const mockRouter = { back: jest.fn<(...args: any[]) => any>(), push: jest.fn<(...args: any[]) => any>(), replace: jest.fn<(...args: any[]) => any>() };
const mockAuthState = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  user: { firstName: 'Ada', lastName: 'Lovelace', username: 'ada@example.com' },
};
const mockProfileQuery = {
  data: {
    customerCountryIso2Code: 'PH',
    customerAddress: '123 Main Street',
    customerAddressState: 'NCR',
    customerAddressCity: 'Makati',
    customerAddressPostalCode: '1200',
  },
  refetch: mockRefetch,
};

jest.mock('expo-router', () => ({
  router: {
    back: (...args: any[]) => mockRouter.back(...args),
    push: (...args: any[]) => mockRouter.push(...args),
    replace: (...args: any[]) => mockRouter.replace(...args),
  },
  useFocusEffect: (callback: any) => {
    const React = require('react');
    React.useEffect(() => callback(), []);
  },
}));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthState,
}));
jest.mock('@/redux/features/profile/profileApi', () => ({
  useGetProfileDataQuery: () => mockProfileQuery,
  useUpdateAddressMutation: () => [mockUpdateAddress, { isLoading: false }],
  useUpdateProfileMutation: () => [mockUpdateProfile, { isLoading: false }],
}));
jest.mock('@/redux/features/accountSecurity/accountSecurityApi', () => ({
  useUpdateEmailMutation: () => [mockUpdateEmail, { isLoading: false }],
  useUpdatePasswordMutation: () => [mockUpdatePassword, { isLoading: false }],
}));
jest.mock('@/redux/features/login/loginApi', () => ({
  clearSession: () => ({ type: 'login/clearSession' }),
}));
jest.mock('@/services/authStorage', () => ({ clearBiometricCredentials: jest.fn(async () => {}) }));
jest.mock('country-state-city', () => ({
  Country: {
    getAllCountries: () => [
      { isoCode: 'PH', name: 'Philippines' },
      { isoCode: 'US', name: 'United States' },
      { isoCode: 'JP', name: 'Japan' },
    ],
  },
  State: {
    getStatesOfCountry: () => [{ isoCode: 'NCR', name: 'Metro Manila' }],
  },
  City: {
    getCitiesOfState: () => [{ name: 'Makati' }],
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Nav:${title}`}</Text>;
  }
));
jest.mock('@/components/forms/InputValidationComponent', () => (
  ({ placeholder, value, setValue, errors, field, editable }: any) => {
    const { Text, TextInput, View } = require('react-native');
    return (
      <View>
        <TextInput accessibilityLabel={placeholder} value={value} onChangeText={setValue} editable={editable} />
        {errors?.[field] ? <Text>{errors[field]}</Text> : null}
      </View>
    );
  }
));
jest.mock('@/components/forms/NativePicker', () => (
  ({ label, selectedValue, onValueChange, error }: any) => {
    const { Text, TextInput, View } = require('react-native');
    return (
      <View>
        <TextInput accessibilityLabel={label} value={selectedValue} onChangeText={onValueChange} />
        {error ? <Text>{error}</Text> : null}
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

const resolvedTrigger = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value) });

describe('profile and account-security editing flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateAddress.mockReturnValue(resolvedTrigger({}));
    mockUpdateProfile.mockReturnValue(resolvedTrigger({}));
    mockUpdateEmail.mockReturnValue(resolvedTrigger({}));
    mockUpdatePassword.mockReturnValue(resolvedTrigger({ message: 'Password changed' }));
  });

  it('hydrates and saves personal information', async () => {
    render(<EditInfoScreen />);
    expect(screen.getByLabelText('Full Legal First Name').props.value).toBe('Ada');
    fireEvent.changeText(screen.getByLabelText('Full Legal First Name'), 'Augusta Ada');
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledWith({
      firstName: 'Augusta Ada',
      lastName: 'Lovelace',
    }));
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Successfully updated profile information.', variant: 'success' },
    }));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('hydrates, validates, and saves the address form', async () => {
    render(<EditAddressScreen />);
    expect(mockRefetch).toHaveBeenCalled();
    expect(screen.getByLabelText('Street Address').props.value).toBe('123 Main Street');
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockUpdateAddress).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      streetAddress: '123 Main Street',
      country: 'PH',
      state: 'NCR',
      city: 'Makati',
      postalCode: '1200',
    }));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('rejects an unchanged email and logs out after a valid email update', async () => {
    render(<ChangeEmailScreen />);
    fireEvent.changeText(screen.getByLabelText('New Email'), 'ada@example.com');
    fireEvent.press(screen.getByRole('button', { name: 'Update Email' }));
    expect(mockUpdateEmail).not.toHaveBeenCalled();
    expect(await screen.findByText('New email must be different from the current email.')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('New Email'), 'new@example.com');
    const timeout = jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return 1 as any;
    });
    fireEvent.press(screen.getByRole('button', { name: 'Update Email' }));
    await waitFor(() => expect(mockUpdateEmail).toHaveBeenCalledWith({ emailAddress: 'new@example.com' }));
    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith({ type: 'login/clearSession' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    timeout.mockRestore();
  });

  it('validates mismatched passwords and logs out after a successful change', async () => {
    render(<ChangePasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('Old Password'), 'OldPassword1!');
    fireEvent.changeText(screen.getByLabelText('Create New Password'), 'Correct1!Password');
    fireEvent.changeText(screen.getByLabelText('Confirm New Password'), 'Different1!Password');
    fireEvent.press(screen.getByRole('button', { name: 'Update Password' }));
    expect(mockUpdatePassword).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'Please correct the highlighted fields.', variant: 'error' },
    }));

    fireEvent.changeText(screen.getByLabelText('Confirm New Password'), 'Correct1!Password');
    const timeout = jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return 1 as any;
    });
    fireEvent.press(screen.getByRole('button', { name: 'Update Password' }));
    await waitFor(() => expect(mockUpdatePassword).toHaveBeenCalledWith({
      currentPassword: 'OldPassword1!',
      newPassword: 'Correct1!Password',
    }));
    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith({ type: 'login/clearSession' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    timeout.mockRestore();
  });
});
