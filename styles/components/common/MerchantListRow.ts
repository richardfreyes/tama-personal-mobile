import { MERCHANT_LIST_ROW_CONTENT_MIN_HEIGHT, MERCHANT_LIST_ROW_DIVIDER, MERCHANT_LIST_ROW_PADDING } from '@/constants';
import { StyleSheet } from 'react-native';
import { Colors } from '../../common/colors';

export const merchantListRowStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: Colors.dashboardSkeleton,
    borderBottomWidth: MERCHANT_LIST_ROW_DIVIDER,
    flexDirection: 'row',
    gap: 12,
    minHeight: MERCHANT_LIST_ROW_CONTENT_MIN_HEIGHT + (MERCHANT_LIST_ROW_PADDING * 2) + MERCHANT_LIST_ROW_DIVIDER,
    paddingVertical: MERCHANT_LIST_ROW_PADDING,
  },
  name: {
    color: Colors.maroon11,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    minWidth: 0,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: Colors.success01,
    borderRadius: 999,
    flexShrink: 0,
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: Colors.dashboardSuccessText,
    fontSize: 11,
    lineHeight: 16,
  },
});
