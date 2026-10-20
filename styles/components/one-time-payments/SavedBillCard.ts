import { SAVED_BILL_CARD_WIDTH } from '@/constants/savedBills';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createSavedBillCardStyles = (Colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 1,
    boxShadow: '0px 6px 18px -12px rgba(61, 36, 34, 0.28)',
    gap: 12,
    padding: 14,
    width: SAVED_BILL_CARD_WIDTH,
  },
  cardFull: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: 'auto',
  },
  identityFull: {
    flex: 1,
    minWidth: 0,
  },
  detailsFull: {
    alignItems: 'flex-end',
  },
  cardPressed: {
    backgroundColor: Colors.dashboardPanel,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
    width: '100%',
  },
  names: {
    flex: 1,
    minWidth: 0,
  },
  nickname: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  merchantName: {
    color: Colors.maroon09,
    fontSize: 12,
    lineHeight: 17,
  },
  details: {
    gap: 4,
  },
  amount: {
    color: Colors.text,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    lineHeight: 24,
  },
  noAmount: {
    color: Colors.maroon08,
    fontSize: 15,
    lineHeight: 24,
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  heroNickname: {
    color: Colors.text,
    fontSize: 18,
    lineHeight: 26,
  },
  heroSubtitle: {
    color: Colors.maroon09,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    lineHeight: 18,
  },
  heroStatus: {
    marginTop: 4,
  },
});

export const savedBillCardStyles = createSavedBillCardStyles(LightColors);
