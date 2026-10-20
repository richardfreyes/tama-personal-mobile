import { useThemedStyles, useThemeColors } from '@/hooks/useAppTheme';
import { createDashboardStatusBarScrimStyles as makeStyles } from '@/styles/components/dashboard/DashboardStatusBarScrim';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardStatusBarScrim() {
  const styles = useThemedStyles(makeStyles);
  const Colors = useThemeColors();

  const { top } = useSafeAreaInsets();
  if (top <= 0) return null;

  return (
    <View pointerEvents="none" style={[styles.scrim, { height: top }]} testID="dashboard-status-bar-scrim">
      <LinearGradient colors={[Colors.neutral01, Colors.whiteTransparent]} style={styles.fade} />
    </View>
  );
}
