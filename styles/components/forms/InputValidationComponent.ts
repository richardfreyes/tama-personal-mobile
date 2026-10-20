import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createInputValidationComponentStyles = (Colors: ThemeColors) => StyleSheet.create({

  amountContainer: {
    gap: 6,
  },
  amountLabel: {
    color: Colors.maroon10,
    fontSize: 13,
    lineHeight: 18,
  },
  amountField: {
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 56,
    paddingHorizontal: 12,
  },
  amountFieldFocused: {
    borderColor: Colors.primary,
  },
  amountFieldError: {
    borderColor: Colors.dashboardErrorText,
  },
  amountPrefix: {
    color: Colors.maroon09,
    fontSize: 17,
    lineHeight: 22,
  },
  amountInputWrapper: {
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  amountInput: {
    color: Colors.text,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    letterSpacing: -0.28,
    lineHeight: 36,
    minWidth: 0,
    outlineColor: Colors.transparent,
    outlineWidth: 0,
    padding: 0,
    width: '100%',
  },
  amountHelper: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 18,
  },
  amountError: {
    color: Colors.dashboardErrorText,
    fontSize: 12,
    lineHeight: 16,
  },
});

export const inputValidationComponentStyles = createInputValidationComponentStyles(LightColors);
