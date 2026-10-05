import BrandLogo from '@/assets/logo-brand.svg';
import { NativeLoadingIndicator } from '@/components/common/Loading';
import { COMMON } from '@/constants/common';
import { retrieveToken } from '@/redux/features/login/loginApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { store } from '@/redux/store';
import { Colors } from '@/styles/common/colors';
import { rootStyles } from '@/styles/root';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, usePathname, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { Provider } from 'react-redux';

const RedirectingPage = () => {
  const dispatch = useAppDispatch();
  const segments = useSegments() as string[];
  const pathname = usePathname();
  const { token } = useAppSelector((state) => state.login);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    dispatch(retrieveToken());
  }, [dispatch]);

  useEffect(() => {
    async function checkAppStatus() {
      try {
        const value = await AsyncStorage.getItem(COMMON.STORAGE_ONBOARD_KEY);
        setHasOnboarded(value === 'true');
      } catch (e) {
        console.warn('Failed to fetch onboarding status', e);
        setHasOnboarded(false);
      } finally {
        setAppReady(true);
      }
    }
    checkAppStatus();
  }, []);

  const isInAuthPages = segments[0] === '(auth)' || segments.includes('login') || segments.includes('signup') || segments.includes('reset-password');
  const isAtRoot = pathname === '/' || pathname === '' || !pathname;

  if (!appReady) {
    return (
      <View style={rootStyles.container}>
        <StatusBar barStyle="dark-content" />
        <BrandLogo width={150} height={50} />
        <NativeLoadingIndicator
          label="Preparing app"
          color={Colors.red10}
          style={rootStyles.loader}
        />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <Redirect href="/(auth)/login/intro" />;
  }

  if (isAtRoot) {
    if (token) {
      return <Redirect href="/(app)/dashboard" />;
    } else {
      return <Redirect href="/(auth)/login" />;
    }
  }

  if (token && isInAuthPages) {
    return <Redirect href="/(app)/dashboard" />;
  }

  if (!token && !isInAuthPages) {
    return <Redirect href="/(auth)/login" />;
  }

  return null;
};

export default function App() {
  return (
    <Provider store={store}>
      <RedirectingPage />
    </Provider>
  );
}
