import FloatingNavBar from '@/components/layout/FloatingNavBar';
import { TabBarAnimationProvider } from '@/context/TabBarAnimationContext';
import { retrieveToken } from '@/redux/features/login/loginApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.login.token);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    if (token || checkedStorage) return;
    void dispatch(retrieveToken()).finally(() => setCheckedStorage(true));
  }, [checkedStorage, dispatch, token]);

  if (!token && !checkedStorage) return null;
  if (!token) return <Redirect href="/login" />;

  return (
    <TabBarAnimationProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <FloatingNavBar />
    </TabBarAnimationProvider>
  );
}
