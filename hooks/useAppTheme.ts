import { Colors, DarkColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

export const useThemeColors = (): ThemeColors => useColorScheme() === 'dark' ? DarkColors : Colors;

export const useThemedStyles = <T,>(factory: (colors: ThemeColors) => T): T => {
  const colors = useThemeColors();
  return useMemo(() => factory(colors), [colors, factory]);
};
