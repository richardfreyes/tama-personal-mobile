import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const upcomingBillCardStyles = StyleSheet.create({
  page: {
    paddingRight: 12,
  },
  cardShadow: {
    backgroundColor: Colors.neutral01,
    borderRadius: 24,
    elevation: 2,
    shadowColor: Colors.maroon10,

    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  card: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topBand: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
  },
  labelColumn: {
    gap: 2,
    minWidth: 0,
  },
  overline: {
    color: Colors.red02,
    fontSize: 13,
    lineHeight: 18,
  },
  merchantName: {
    color: Colors.neutral01,
    fontSize: 15,
    lineHeight: 22,
  },
  amountRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 6,
  },
  currency: {
    color: Colors.red02,
    fontSize: 22,
    lineHeight: 32,
  },
  wholeAmount: {
    color: Colors.neutral01,
    flexShrink: 1,
    fontSize: 38,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.76,
    lineHeight: 46,
  },
  cents: {
    color: Colors.red02,
    fontSize: 22,
    letterSpacing: 0,
    lineHeight: 32,
  },
  amountFallback: {
    color: Colors.neutral01,
    fontSize: 22,
    lineHeight: 46,
  },
  dueSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  enrollSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  dueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 24,
  },
  dueDate: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dueDateText: {
    color: Colors.maroon10,
    fontSize: 13,
    lineHeight: 18,
  },
  daysBadge: {
    alignItems: 'center',
    backgroundColor: Colors.amber01,
    borderColor: Colors.amber03,
    borderRadius: 999,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  daysBadgeText: {
    color: '#8F5400',
    fontSize: 12,
    lineHeight: 18,
  },
  enrollButton: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  enrollButtonPressed: {
    backgroundColor: Colors.red02,
  },
  enrollText: {
    color: Colors.red09,
    fontSize: 15,
    lineHeight: 22,
  },
});
