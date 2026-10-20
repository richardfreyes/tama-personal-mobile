import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "../../common/typography";

export const createAppButtonStyles = (Colors: ThemeColors) => StyleSheet.create({
  base: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.transparent,
   paddingHorizontal: 16,},
  primary: {
    backgroundColor: Colors.red10
  },
  secondary: {
    backgroundColor: Colors.primaryTint,
  },
  tertiary: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.borderStrong,
  },
  quaternary: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.borderStrong,
  },
  danger: {
    backgroundColor: Colors.error06,
  },
  disabled: {
    backgroundColor: Colors.disabledBackground,
    color: Colors.disabledText,
  },

  gradient: {
    borderRadius: 8,
    borderWidth: 0,
    minHeight: 44,
    paddingVertical: 0,
  },
  gradientShadow: {
    boxShadow: 'none',
  },
  gradientFill: {
    borderRadius: 8,
  },
  gradientDisabled: {
    backgroundColor: Colors.dashboardSkeleton,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 20,
  },
  hiddenText: {
    opacity: 0,
  },
  loadingContent: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  textBase: {
    fontSize: 14,
   lineHeight: 20,},
  textPrimary: {
    color: Colors.white,
  },
  textSecondary: {
    color: Colors.primaryText
  },
  textTertiary: {
    color: Colors.text,
  },
  textQuaternary: {
    color: Colors.text,
  },
  textDanger: {
    color: Colors.white
  },
  textGradient: {
    color: Colors.white,
    fontSize: 14,
  },
  textGradientDisabled: {
    color: Colors.disabledText,
  },
});

export const appButtonStyles = createAppButtonStyles(LightColors);
