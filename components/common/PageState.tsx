import { useThemeColors, useThemedStyles } from '@/hooks/useAppTheme';
import { createGlobalStyle as makeGlobalStyle } from '@/styles/common/globals';
import { createPageStateStyles as makeStyles } from '@/styles/components/common/PageState';
import { PageStateProps } from '@/types/common';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { SpacerComponent } from './SpacerComponent';

const STATUS_ICON = {
  success: 'check',
  error: 'x',
  neutral: 'info',
} as const;

export const PageState: React.FC<PageStateProps> = ({
  title,
  description,
  children,
  containerStyle,
  status = 'success',
}) => {
  const globalStyle = useThemedStyles(makeGlobalStyle);
  const styles = useThemedStyles(makeStyles);
  const Colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const iconColor = status === 'error'
    ? Colors.errorText
    : status === 'neutral'
      ? Colors.textSecondary
      : Colors.successText;

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, styles.container, { paddingTop: insets.top + 12 }, containerStyle]}>
      <View style={styles.content}>
        <View
          accessibilityLabel={`${status} status`}
          style={[
            styles.iconCircle,
            status === 'error' ? styles.iconError : status === 'neutral' ? styles.iconNeutral : styles.iconSuccess,
          ]}
        >
          <Feather name={STATUS_ICON[status]} size={30} color={iconColor} />
        </View>
        <AppText weight="600" style={styles.title}>{title}</AppText>
        <AppText style={styles.description}>{description}</AppText>
      </View>
      <View style={styles.actions}>
        {children}
        <SpacerComponent height={24} />
      </View>
    </ScrollView>
  );
};
