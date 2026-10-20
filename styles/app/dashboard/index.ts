import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createDashboardStyles = (Colors: ThemeColors) => StyleSheet.create({
  content: {
    backgroundColor: Colors.background,
    flexGrow: 1,
    gap: 12,
    paddingBottom: 88,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  screen: {
    backgroundColor: Colors.background,
    flex: 1,
  },
});

export const dashboardStyles = createDashboardStyles(LightColors);
