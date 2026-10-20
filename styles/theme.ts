import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import { Colors, DarkColors } from './common/colors';
import type { ThemeColors } from '@/types/theme';

const fonts = {
  ...configureFonts({ config: { fontFamily: 'PoppinsRegular' } }),
  bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: 'PoppinsRegular', fontSize: 15, lineHeight: 20 },
  bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: 'PoppinsRegular', fontSize: 15, lineHeight: 20 },
  bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: 'PoppinsRegular', fontSize: 13, lineHeight: 18 },
  titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: 'PoppinsSemiBold', fontSize: 22, lineHeight: 28 },
  titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: 'PoppinsSemiBold', fontSize: 17, lineHeight: 22 },
  titleSmall: { ...MD3LightTheme.fonts.titleSmall, fontFamily: 'PoppinsSemiBold', fontSize: 14, lineHeight: 18 },
  labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: 'PoppinsSemiBold', fontSize: 15, lineHeight: 20 },
  labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: 'PoppinsMedium', fontSize: 12, lineHeight: 16 },
  labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: 'PoppinsMedium', fontSize: 11, lineHeight: 14 },
};

const paperColors = (colors: ThemeColors) => ({
  primary: colors.primary,
  onPrimary: colors.white,
  primaryContainer: colors.primaryTint,
  onPrimaryContainer: colors.primaryText,
  background: colors.background,
  onBackground: colors.text,
  surface: colors.surface,
  surfaceVariant: colors.backgroundSecondary,
  onSurface: colors.text,
  onSurfaceVariant: colors.textSecondary,
  outline: colors.border,
  outlineVariant: colors.borderStrong,
  error: colors.error,
  onError: colors.white,
  errorContainer: colors.errorBackground,
  onErrorContainer: colors.errorText,
  surfaceDisabled: colors.disabledBackground,
  onSurfaceDisabled: colors.disabledText,
  backdrop: colors.overlay,
});

export const customTheme = { ...MD3LightTheme, roundness: 8, fonts, colors: { ...MD3LightTheme.colors, ...paperColors(Colors) } };

export const customDarkTheme = { ...MD3DarkTheme, roundness: 8, fonts, colors: { ...MD3DarkTheme.colors, ...paperColors(DarkColors) } };
