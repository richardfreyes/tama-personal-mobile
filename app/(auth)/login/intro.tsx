import BrandLogoWhite from '@/assets/logo-brand-white.svg';
import { AppButton } from '@/components/common/AppButton';
import { COMMON } from '@/constants/common';
import { introStyle as styles } from '@/styles/auth/login/intro';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ImageBackground, View } from 'react-native';

const IntroScreen: React.FC = () => {
  const handleGetStarted = async () => {
    await handleOnBoard();
    router.replace('login/onboarding-flow' as never);
  };

  const handleLogin = async () => {
    await handleOnBoard();
    router.replace('login' as never);
  };

  const handleOnBoard = () => {
    AsyncStorage.setItem(COMMON.STORAGE_ONBOARD_KEY, 'true');
  }

  return (
    <ImageBackground
      source={require('@/assets/images/get-started-bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
      imageStyle={styles.imageStyleFix}
    >
      <StatusBar style="light" />
      <View style={styles.overlay} />
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <BrandLogoWhite style={styles.logo} width={300} height={99} />
        </View>
        <View style={styles.buttonContainer}>
          { }
          {

}
          <AppButton
            title="Login"
            onPress={handleLogin}
            variant="tertiary"
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default IntroScreen;
