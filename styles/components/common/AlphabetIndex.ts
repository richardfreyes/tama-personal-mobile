import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createAlphabetIndexStyles = (Colors: ThemeColors) => StyleSheet.create({
  rail: {
    alignItems: 'center',
  },
  letter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    color: Colors.red10,
    fontSize: 11,
    lineHeight: 14,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: Colors.red10,
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    lineHeight: 14,
  },
});

export const alphabetIndexStyles = createAlphabetIndexStyles(LightColors);
