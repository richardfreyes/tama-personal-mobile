import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createFeeNoticeStyles = (Colors: ThemeColors) => StyleSheet.create({
  calculating: {
    alignSelf: 'flex-start',
  },
  errorBlock: {
    gap: 8,
  },
  error: {
    color: Colors.dashboardErrorText,
    fontSize: 12,
    lineHeight: 17,
  },
  replaceButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
  },
  fee: {
    color: Colors.maroon09,
    fontSize: 12,
    lineHeight: 17,
  },
  feeAmount: {
    color: Colors.text,
    fontSize: 12,
    lineHeight: 17,
  },
});

export const feeNoticeStyles = createFeeNoticeStyles(LightColors);
