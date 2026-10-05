import { StyleSheet } from 'react-native';
import { Colors } from '../../common/colors';

export const feeNoticeStyles = StyleSheet.create({
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
    color: Colors.maroon11,
    fontSize: 12,
    lineHeight: 17,
  },
});
