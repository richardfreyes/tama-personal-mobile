import ModalComponent from '@/components/layout/ModalComponent';
import SnackbarComponent from '@/components/layout/SnackBar';
import { appApi } from '@/redux/appApi';
import { clearSession } from '@/redux/features/login/loginApi';
import { showModal } from '@/redux/features/modal/modalSlice';
import { hideSnackbar, selectSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { store } from '@/redux/store';
import { customTheme } from '@/styles/theme';
import { handleDirectDebitBrowserCallback } from '@/utils/directDebitCallback';
import { handleEnrollmentBrowserCallback } from '@/utils/enrollmentCallback';
import { handlePaymentResultBrowserCallback } from '@/utils/paymentResultCallback';
import { modalActions } from '@/utils/modalActions';
import { Poppins_100Thin, Poppins_200ExtraLight, Poppins_300Light, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, Poppins_900Black, useFonts } from '@expo-google-fonts/poppins';
import * as Linking from 'expo-linking';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { PaperProvider, Portal as PaperPortal } from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates';
import { Provider } from 'react-redux';

if (!__DEV__) {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
}

registerTranslation('en', en);
SplashScreen.preventAutoHideAsync();

function GlobalLayout() {
  const dispatch = useAppDispatch();
  const { visible, message, variant } = useAppSelector(selectSnackbar);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const currentPath = '/' + segments.join('/');
    console.log('ROUTE DETECTOR:', currentPath);
  }, [segments]);

  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;

      if (url) {
        const handledEnrollmentCallback = handleEnrollmentBrowserCallback(url, (result) => {
          if (result.outcome === 'failure') {
            const modalId = 'enrollment-verification-declined';
            modalActions[modalId] = () => {
              router.replace('/(app)/bills/enrollments/payment-method');
            };
            dispatch(showModal({
              id: modalId,
              dismissible: false,
              iconType: 'error',
              headerMessage: 'Enrollment Declined',
              bodyMessage: 'Your enrollment was declined. Please try again or use a different card.',
              buttonConfig: {
                primaryLabel: 'OK',
              },
            }));
            return;
          }

          router.replace({
            pathname: '/bills/enrollments/result',
            params: result,
          });
        });
        if (handledEnrollmentCallback) return;

        const handledDirectDebitCallback = handleDirectDebitBrowserCallback(url, (result) => {
          if (result.outcome === 'success') {
            dispatch(appApi.util.invalidateTags(['PaymentMethods']));
          }
          router.replace({
            pathname: '/payment-methods/direct-debit-result',
            params: { outcome: result.outcome },
          });
        });
        if (handledDirectDebitCallback) return;

        const handledPaymentResultCallback = handlePaymentResultBrowserCallback(url, (result) => {
          router.replace({
            pathname: '/payment-methods/payment-result',
            params: { ...result },
          });
        });
        if (handledPaymentResultCallback) return;

        const { hostname, path, queryParams } = Linking.parse(url);
        const route = hostname || path;
        if (route === 'reset-password' || route === 'reset-password-confirm' || route?.includes('reset-password')) {
          const token = queryParams?.token as string;
          const code = queryParams?.code as string;
          if (token && code) {
            router.push(`/(auth)/reset-password/create-new-password?token=${token}&code=${code}`);
          } else {
            console.warn('Reset password link missing token or code');
          }
        }

        else if (route === 'reset-email' || route === 'change-email-confirm') {
          void dispatch(clearSession());
          const Otoken = queryParams?.Otoken as string;
          const Ntoken = queryParams?.Ntoken as string;
          const code = queryParams?.code as string;
          if (Otoken && Ntoken) {
            router.push(`/(auth)/change-email-confirm?Otoken=${Otoken}&Ntoken=${Ntoken}&code=${code}`);
          } else {
            console.warn('Change email link missing token or code');
          }
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [dispatch, router]);

  const onDismissSnackbar = () => {
    dispatch(hideSnackbar());
  };

  return (
    <>
      <PaperPortal.Host>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperPortal.Host>
      <ModalComponent />
      <SnackbarComponent
        visible={visible}
        message={message}
        variant={variant}
        onDismiss={onDismissSnackbar}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PoppinsThin: Poppins_100Thin,
    PoppinsExtraLight: Poppins_200ExtraLight,
    PoppinsLight: Poppins_300Light,
    PoppinsRegular: Poppins_400Regular,
    PoppinsMedium: Poppins_500Medium,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
    PoppinsExtraBold: Poppins_800ExtraBold,
    PoppinsBlack: Poppins_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <PaperProvider theme={customTheme}>
        <GestureHandlerRootView>
          <GlobalLayout />
        </GestureHandlerRootView>
      </PaperProvider>
    </Provider>
  );
}
