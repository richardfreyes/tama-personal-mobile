import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createVerifyStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
});

export const verifyStyles = createVerifyStyles(LightColors);
