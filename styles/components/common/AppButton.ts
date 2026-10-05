import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const appButtonStyles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  primary: {
    backgroundColor: Colors.red10
  },
  secondary: {
    backgroundColor: Colors.red02,
  },
  tertiary: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.red10,
  },
  quaternary: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.maroon10,
  },
  danger: {
    backgroundColor: Colors.error06,
  },
  disabled: {
    backgroundColor: Colors.neutral03,
    color: Colors.neutral05,
  },

  gradient: {
    borderRadius: 14,
    borderWidth: 0,
    minHeight: 52,
    paddingVertical: 0,
  },
  gradientShadow: {
    boxShadow: '0px 6px 16px -8px rgba(229, 87, 43, 0.6)',
  },
  gradientFill: {
    borderRadius: 14,
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
    fontSize: FontSizes.base,
  },
  textPrimary: {
    color: Colors.neutral01,
  },
  textSecondary: {
    color: Colors.red10
  },
  textTertiary: {
    color: Colors.red10,
  },
  textQuaternary: {
    color: Colors.maroon10,
  },
  textDanger: {
    color: Colors.neutral01
  },
  textGradient: {
    color: Colors.neutral01,
    fontSize: FontSizes.medium,
  },
  textGradientDisabled: {
    color: Colors.maroon07,
  },
});
