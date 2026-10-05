import { SAVED_BILL_CARD_WIDTH } from '@/constants/savedBills';
import { StyleSheet } from 'react-native';
import { Colors } from '../../common/colors';

export const savedBillCardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    boxShadow: '0px 6px 18px -12px rgba(61, 36, 34, 0.28)',
    gap: 12,
    padding: 14,
    width: SAVED_BILL_CARD_WIDTH,
  },
  cardPressed: {
    backgroundColor: Colors.dashboardPanel,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  names: {
    flex: 1,
    minWidth: 0,
  },
  nickname: {
    color: Colors.maroon11,
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
    color: Colors.maroon11,
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
    color: Colors.maroon11,
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
