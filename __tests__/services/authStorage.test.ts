import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';
import { clearBiometricCredentials, getBiometricCredentials, hasBiometricsEnabled, saveBiometricCredentials, } from '@/services/authStorage';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn<(...args: any[]) => any>(),
  getItemAsync: jest.fn<(...args: any[]) => any>(),
  deleteItemAsync: jest.fn<(...args: any[]) => any>(),
}));

const secureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('authStorage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('saves all credential fields and enables biometrics', async () => {
    await saveBiometricCredentials('ada@example.com', 'secret', 'Ada', 'Lovelace');
    expect(secureStore.setItemAsync).toHaveBeenNthCalledWith(1, 'biometric_email', 'ada@example.com');
    expect(secureStore.setItemAsync).toHaveBeenNthCalledWith(2, 'biometric_password', 'secret');
    expect(secureStore.setItemAsync).toHaveBeenNthCalledWith(3, 'biometric_first_name', 'Ada');
    expect(secureStore.setItemAsync).toHaveBeenNthCalledWith(4, 'biometric_last_name', 'Lovelace');
    expect(secureStore.setItemAsync).toHaveBeenNthCalledWith(5, 'biometrics_enabled', 'true');
  });

  it('swallows and logs secure-store write failures', async () => {
    const error = new Error('locked');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    secureStore.setItemAsync.mockRejectedValueOnce(error);
    await expect(saveBiometricCredentials('a', 'b', 'c', 'd')).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith('Error saving biometric credentials', error);
    consoleError.mockRestore();
  });

  it('returns complete credentials and normalizes absent names', async () => {
    secureStore.getItemAsync
      .mockResolvedValueOnce('ada@example.com')
      .mockResolvedValueOnce('secret')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    await expect(getBiometricCredentials()).resolves.toEqual({
      email: 'ada@example.com',
      password: 'secret',
      firstName: '',
      lastName: '',
    });
  });

  it('returns null when required credentials are absent or storage fails', async () => {
    secureStore.getItemAsync.mockResolvedValue(null);
    await expect(getBiometricCredentials()).resolves.toBeNull();

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    secureStore.getItemAsync.mockRejectedValueOnce(new Error('unavailable'));
    await expect(getBiometricCredentials()).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('checks the exact enabled flag and treats failures as disabled', async () => {
    secureStore.getItemAsync.mockResolvedValueOnce('true');
    await expect(hasBiometricsEnabled()).resolves.toBe(true);
    secureStore.getItemAsync.mockResolvedValueOnce('false');
    await expect(hasBiometricsEnabled()).resolves.toBe(false);
    secureStore.getItemAsync.mockRejectedValueOnce(new Error('unavailable'));
    await expect(hasBiometricsEnabled()).resolves.toBe(false);
  });

  it('clears every stored credential and logs delete failures', async () => {
    await clearBiometricCredentials();
    expect(secureStore.deleteItemAsync.mock.calls.map(([key]) => key)).toEqual([
      'biometric_email',
      'biometric_password',
      'biometric_first_name',
      'biometric_last_name',
      'biometrics_enabled',
    ]);

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    secureStore.deleteItemAsync.mockRejectedValueOnce(new Error('locked'));
    await expect(clearBiometricCredentials()).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
