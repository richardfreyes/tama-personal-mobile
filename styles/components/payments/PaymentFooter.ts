import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createPaymentFooterStyles = (Colors: ThemeColors) => StyleSheet.create({
  footer: {
    backgroundColor: Colors.neutral01,
    borderTopColor: Colors.dashboardCardBorder,
    borderTopWidth: 1,
    bottom: 0,
    gap: 10,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  summary: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  label: {
    color: Colors.maroon09,
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    minWidth: 0,
  },
  labelError: {
    color: Colors.dashboardErrorText,
  },
  total: {
    color: Colors.text,
    flexShrink: 0,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    lineHeight: 24,
  },
});

export const paymentFooterStyles = createPaymentFooterStyles(LightColors);
