import { useThemedStyles } from '@/hooks/useAppTheme';
import BrandLogoWhite from '@/assets/logo-brand-white.svg';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { COMMON } from '@/constants/common';
import { createIntroStyle as makeStyles } from '@/styles/auth/login/intro';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ImageBackground, View } from 'react-native';

const IntroScreen: React.FC = () => {
  const styles = useThemedStyles(makeStyles);

  const handleGetStarted = async () => {
    await handleOnBoard();
    router.replace('/login/onboarding-flow');
  };

  const handleLogin = async () => {
    await handleOnBoard();
    router.replace('/login');
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
      <LinearGradient
        colors={['rgba(14,15,19,0.30)', 'rgba(14,15,19,0.55)', 'rgba(14,15,19,0.94)']}
        locations={[0, 0.45, 1]}
        style={styles.overlay}
      />
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <BrandLogoWhite width={200} height={66} />
          <AppText weight="500" style={styles.tagline}>Pay all your bills in one place</AppText>
        </View>
        <View style={styles.buttonContainer}>
          <AppButton
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
          />
          <AppButton
            title="Login"
            onPress={handleLogin}
            variant="tertiary"
            buttonStyle={styles.loginButton}
            textStyle={styles.loginButtonText}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default IntroScreen;
