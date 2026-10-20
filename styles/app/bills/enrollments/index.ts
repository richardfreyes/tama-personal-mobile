import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createAutoDebitEnrollmentStyles = (Colors: ThemeColors) => StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
  },
});

export const autoDebitEnrollmentStyles = createAutoDebitEnrollmentStyles(LightColors);
