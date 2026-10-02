import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Colors } from './common/colors';

const Poppins = {
  regular: {
    fontFamily: 'PoppinsRegular',
    fontWeight: 'normal' as const,
  },
  medium: {
    fontFamily: 'PoppinsMedium',
    fontWeight: '500' as const,
  },
  bold: {
    fontFamily: 'PoppinsBold',
    fontWeight: 'bold' as const,
  },
  thin: {
    fontFamily: 'PoppinsLight',
    fontWeight: '100' as const,
  },
};

export const customTheme = {
  ...DefaultTheme,

  fonts: {
    ...DefaultTheme.fonts,

    displayLarge: Poppins.bold,
    displayMedium: Poppins.bold,
    displaySmall: Poppins.bold,

    headlineLarge: Poppins.bold,
    headlineMedium: Poppins.bold,
    headlineSmall: Poppins.bold,

    titleLarge: Poppins.medium,
    titleMedium: Poppins.medium,
    titleSmall: Poppins.medium,

    labelLarge: Poppins.regular,
    labelMedium: Poppins.regular,
    labelSmall: Poppins.thin,

    bodyLarge: { ...Poppins.regular, fontSize: 14 },
    bodyMedium: { ...Poppins.regular, fontSize: 14 },
    bodySmall: { ...Poppins.regular, fontSize: 14 },
  },
  
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.red10,
    background: Colors.neutral01,
    outline: Colors.neutral05,
    onSurface: Colors.neutral08,
    onSurfaceVariant: Colors.neutral06,
  },
};