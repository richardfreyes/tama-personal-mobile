import { retrieveToken } from '@/redux/features/login/loginApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.login);

  useEffect(() => {
    dispatch(retrieveToken());
  }, [dispatch]);

  if (token) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login/index" options={{ headerShown: false }} />
      <Stack.Screen name="login/intro" options={{ headerShown: false }} />
      <Stack.Screen name="login/onboarding-flow" options={{ headerShown: false }} />
      <Stack.Screen name="signup/index" options={{ headerShown: false }} />
      <Stack.Screen name="verify/index" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password/index" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password/check-email" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password/otp-delivery-selection" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password/verify-otp" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password/create-new-password" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password/success" options={{ headerShown: false }} />
      <Stack.Screen name="change-email-confirm/index" options={{ headerShown: false }} />
    </Stack>
  );
}