import { BRAND_ACTION_GRADIENT_COLORS, BRAND_ACTION_GRADIENT_LOCATIONS, GRADIENT_HORIZONTAL_END, GRADIENT_HORIZONTAL_START, } from '@/constants/gradients';
import { appButtonStyles as styles } from '@/styles/components/common/AppButton';
import { AppButtonProps } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from './AppText';
import { NativeLoadingIndicator } from './Loading';

export const AppButton: React.FC<AppButtonProps> = ({ 
  title, 
  variant = 'primary', 
  route, 
  buttonStyle, 
  textStyle, 
  onPress, 
  isLoading = false, 
  disabled, 
  countdownSeconds = 0, 
  isCountdownActive = false,
  ...rest 
}) => {
  const initialIsDisabled = disabled || isLoading;
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    setSecondsLeft((currentSeconds) => {
      if (isCountdownActive && currentSeconds === 0 && countdownSeconds > 0) {
        return countdownSeconds;
      }

      return currentSeconds;
    });
  }, [isCountdownActive, countdownSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prevSeconds => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const isCountingDown = secondsLeft > 0;
  const currentIsDisabled = initialIsDisabled || isCountingDown;
  const currentTitle = isCountingDown ? `${title} (${secondsLeft})` : title;
  const loadingLabel = `${title || 'Action'} in progress`;

  const isGradient = variant === 'gradient';
  const isGreyedOut = Boolean(disabled) || isCountingDown;
  const showGradient = isGradient && !isGreyedOut;

  const stylesArray = [
    styles.base,
    variant === 'primary' ? styles.primary : 
    variant === 'secondary' ? styles.secondary : 
    variant === 'tertiary' ? styles.tertiary :
    variant === 'quaternary' ? styles.quaternary :
    variant === 'danger' ? styles.danger :
    isGradient ? styles.gradient : styles.primary,
    showGradient && styles.gradientShadow,
    isGradient ? isGreyedOut && styles.gradientDisabled : currentIsDisabled && styles.disabled,
    buttonStyle,
  ];

  const textStylesArray = [
    styles.textBase,
    variant === 'primary' ? styles.textPrimary : 
    variant === 'secondary' ? styles.textSecondary : 
    variant === 'tertiary' ? styles.textTertiary :
    variant === 'quaternary' ? styles.textQuaternary :
    variant === 'danger' ? styles.textDanger :
    isGradient ? styles.textGradient : styles.textPrimary,
    isGradient ? isGreyedOut && styles.textGradientDisabled : currentIsDisabled && styles.disabled,
    textStyle,
  ];

  const handlePress = () => {
    if (currentIsDisabled) {
      return;
    }
    if (onPress) {
      onPress();
    } else if (route) {
      router.navigate(route);
    }
  };

  const activityIndicatorColor = variant === 'primary' || showGradient ? 'white' : 'black';

  return (
    <TouchableOpacity 
      style={stylesArray} 
      activeOpacity={isGradient ? 0.93 : 0.7}
      {...rest} 
      onPress={handlePress}
      disabled={currentIsDisabled}
      accessibilityRole="button"
      accessibilityLabel={isLoading ? loadingLabel : title}
      accessibilityState={{ disabled: currentIsDisabled, busy: isLoading }}
    >
      {showGradient ? (
        <LinearGradient
          colors={BRAND_ACTION_GRADIENT_COLORS}
          end={GRADIENT_HORIZONTAL_END}
          locations={BRAND_ACTION_GRADIENT_LOCATIONS}
          pointerEvents="none"
          start={GRADIENT_HORIZONTAL_START}
          style={[StyleSheet.absoluteFill, styles.gradientFill]}
          testID="app-button-gradient"
        />
      ) : null}
      <View style={styles.content}>
        <AppText style={[textStylesArray, isLoading && styles.hiddenText]} weight='600'>
          {currentTitle}
        </AppText>
        {isLoading ? (
          <View style={styles.loadingContent}>
            <NativeLoadingIndicator
              color={activityIndicatorColor}
              label={loadingLabel}
              testID="ActivityIndicator"
            />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};
