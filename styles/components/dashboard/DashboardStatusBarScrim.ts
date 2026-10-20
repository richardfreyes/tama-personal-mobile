import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createDashboardStatusBarScrimStyles = (Colors: ThemeColors) => StyleSheet.create({
  scrim: {
    backgroundColor: Colors.neutral01,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  fade: {
    height: 6,
    left: 0,
    position: 'absolute',
    right: 0,
    top: '100%',
  },
});

export const dashboardStatusBarScrimStyles = createDashboardStatusBarScrimStyles(LightColors);
