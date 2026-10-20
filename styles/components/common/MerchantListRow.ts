import { MERCHANT_LIST_ROW_CONTENT_MIN_HEIGHT, MERCHANT_LIST_ROW_DIVIDER, MERCHANT_LIST_ROW_PADDING } from '@/constants';
import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createMerchantListRowStyles = (Colors: ThemeColors) => StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: Colors.divider,
    borderBottomWidth: MERCHANT_LIST_ROW_DIVIDER,
    flexDirection: 'row',
    gap: 12,
    minHeight: 60,
    paddingVertical: MERCHANT_LIST_ROW_PADDING,
  },
  name: {
    color: Colors.text,
    flex: 1,
    fontSize: 15,
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
  chevron: {
    flexShrink: 0,
    marginLeft: 4,
  },
});

export const merchantListRowStyles = createMerchantListRowStyles(LightColors);
