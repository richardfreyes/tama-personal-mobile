import { retrieveToken } from '@/redux/features/login/loginApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const { token, loading } = useAppSelector(state => state.login);

  useEffect(() => {
    dispatch(retrieveToken());
  }, [dispatch]);

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}