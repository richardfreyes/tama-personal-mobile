import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { resetPasswordStyles as styles } from '@/styles/auth/reset-password';
import { globalStyle } from '@/styles/common/globals';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

const CheckEmailScreen = () => {

  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, styles.container]}>
      <View>
        <NavHeaderComponent />
        <AppText weight='700' mBottom={16} size='extraExtraLarge' color='maroon10'>Check Your Email</AppText>

        <AppText size='base'>
          {"We've sent instructions to recover your account through email. Please check your inbox and follow the instructions to reset your password."}
        </AppText>
      </View>

      <View style={{ marginBottom: 24 }}>
        <AppButton
          title="Back to Login"
          variant="primary"
          onPress={handleBackToLogin}
        />
      </View>
    </ScrollView>
  );
};

export default CheckEmailScreen;
