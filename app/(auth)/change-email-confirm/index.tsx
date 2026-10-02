import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { NativeLoadingIndicator } from '@/components/common/Loading';
import { PageState } from '@/components/common/PageState';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import { useChangeEmailConfirmMutation } from '@/redux/features/accountSecurity/accountSecurityApi';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { pageStateStyles as styles } from '@/styles/components/common/PageState';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

const ChangeEmailConfirmScreen = () => {
  const { Otoken, Ntoken, code } = useLocalSearchParams<{ Otoken: string; Ntoken: string; code: string }>();
  const [confirmEmail, { isLoading, isSuccess }] = useChangeEmailConfirmMutation();

  useEffect(() => {
    if (Otoken && Ntoken && code) {
      confirmEmail({ Otoken, Ntoken, code });
    }
  }, [Otoken, Ntoken, code, confirmEmail]);

  const handleNavigateLogin = () => {
    router.replace('/login');
  }

  if (isLoading) {
    return (
      <View style={[globalStyle.screenContainer, styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <NativeLoadingIndicator label="Verifying your new email" size="large" color={Colors.aqua10} />
        <SpacerComponent height={24} />
        <AppText>Verifying your new email...</AppText>
      </View>
    );
  }

  if (isSuccess) {
    return (
      <PageState title="Email successfully updated." description="Your email has been successfully updated.">
        <AppButton title="Back to Login" variant="primary" onPress={handleNavigateLogin}/>
      </PageState>
    );
  }

  return (
    <PageState title="Update Failed" description={'Invalid request link. Please try again.'}>
      <AppButton title="Try Again" variant="tertiary" onPress={handleNavigateLogin}/>
      <SpacerComponent height={12} />
      <AppButton title="Back to Home" variant="primary" onPress={handleNavigateLogin}/>
    </PageState>
  );
};

export default ChangeEmailConfirmScreen;
