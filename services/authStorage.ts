import { SECURE_STORE_KEYS } from '@/constants/storageKeys';
import * as SecureStore from 'expo-secure-store';

export const saveBiometricCredentials = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.EMAIL_KEY, email);
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.PASSWORD_KEY, password);
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.FIRST_NAME_KEY, firstName);
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.LAST_NAME_KEY, lastName);
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.ENABLED_KEY, 'true');
  } catch (error) {
    console.error('Error saving biometric credentials', error);
  }
};

export const getBiometricCredentials = async () => {
  try {
    const email = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EMAIL_KEY);
    const password = await SecureStore.getItemAsync(SECURE_STORE_KEYS.PASSWORD_KEY);
    const firstName = await SecureStore.getItemAsync(SECURE_STORE_KEYS.FIRST_NAME_KEY);
    const lastName = await SecureStore.getItemAsync(SECURE_STORE_KEYS.LAST_NAME_KEY);

    if (email && password) {
      return { 
        email, 
        password,
        firstName: firstName || '', 
        lastName: lastName || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting biometric credentials', error);
    return null;
  }
};

export const hasBiometricsEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    return false;
  }
};

export const clearBiometricCredentials = async () => {
  try {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.EMAIL_KEY);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.PASSWORD_KEY);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.FIRST_NAME_KEY);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.LAST_NAME_KEY);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ENABLED_KEY);
  } catch (error) {
    console.error('Error clearing biometric credentials', error);
  }
};
