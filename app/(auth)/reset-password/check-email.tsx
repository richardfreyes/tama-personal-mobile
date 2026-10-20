import { useThemeColors, useThemedStyles } from '@/hooks/useAppTheme';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { createResetPasswordStyles as makeStyles } from '@/styles/auth/reset-password';
import { createGlobalStyle as makeGlobalStyle } from '@/styles/common/globals';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

const CheckEmailScreen = () => {
  const globalStyle = useThemedStyles(makeGlobalStyle);
  const styles = useThemedStyles(makeStyles);
  const Colors = useThemeColors();

  const handleBackToLogin = () => {
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, styles.container]}>
      <View>
        <NavHeaderComponent />
        <View style={globalStyle.authHeroIcon}>
          <Feather name="mail" size={22} color={Colors.primaryText} />
        </View>
        <AppText weight='600' style={globalStyle.authTitle}>Check Your Email</AppText>

        <AppText style={globalStyle.authLead}>
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
