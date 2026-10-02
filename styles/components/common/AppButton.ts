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
    backgroundColor: Colors.aqua10
  },
  secondary: {
    backgroundColor: Colors.aqua02,
  },
  tertiary: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.aqua10,
  },
  quaternary: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.aegeanBlue10,
  },
  danger: {
    backgroundColor: Colors.error06,
  },
  disabled: {
    backgroundColor: Colors.neutral03,
    color: Colors.neutral05,
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
    color: Colors.aqua10
  },
  textTertiary: {
    color: Colors.aqua10,
  },
  textQuaternary: {
    color: Colors.aegeanBlue10,
  },
  textDanger: {
    color: Colors.neutral01
  }
});
