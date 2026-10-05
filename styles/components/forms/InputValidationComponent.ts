import { Colors } from '@/styles/common/colors';
import { inputFocusColor } from '@/styles/common/globals';
import { StyleSheet } from 'react-native';

export const inputValidationComponentStyles = StyleSheet.create({

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
    backgroundColor: Colors.dashboardPanel,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 64,
    paddingHorizontal: 14,
  },
  amountFieldFocused: {
    borderColor: inputFocusColor,
  },
  amountFieldError: {
    borderColor: Colors.dashboardErrorText,
  },
  amountPrefix: {
    color: Colors.maroon09,
    fontSize: 22,
    lineHeight: 30,
  },
  amountInput: {
    color: Colors.maroon11,
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    height: '100%',
    includeFontPadding: false,
    letterSpacing: -0.28,
    minWidth: 0,
    outlineColor: Colors.transparent,
    outlineWidth: 0,
    padding: 0,
  },
  amountHelper: {
    color: Colors.maroon09,
    fontSize: 12,
    lineHeight: 17,
  },
  amountError: {
    color: Colors.dashboardErrorText,
    fontSize: 12,
    lineHeight: 17,
  },
});
