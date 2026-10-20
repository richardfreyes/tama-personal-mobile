import { DASHBOARD_BILL_CAROUSEL_GAP } from '@/constants/dashboard';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createUpcomingBillCardStyles = (Colors: ThemeColors) => StyleSheet.create({
  page: {
    paddingRight: DASHBOARD_BILL_CAROUSEL_GAP,
  },
  cardShadow: {
    backgroundColor: Colors.neutral01,
    borderRadius: 12,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  card: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topBand: {
    gap: 10,
    padding: 16,
  },
  labelColumn: {
    gap: 2,
    minWidth: 0,
  },
  overline: {
    color: Colors.white,
    fontSize: 13,
    lineHeight: 18,
  },
  merchantName: {
    color: Colors.white,
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  amountRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 4,
    minWidth: 0,
  },
  currency: {
    color: Colors.white,
    fontSize: 17,
    lineHeight: 28,
  },
  wholeAmount: {
    color: Colors.white,
    flexShrink: 1,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  cents: {
    color: Colors.white,
    fontSize: 17,
    letterSpacing: 0,
    lineHeight: 28,
  },
  amountFallback: {
    color: Colors.white,
    fontSize: 28,
    lineHeight: 34,
  },
  dueSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  enrollSection: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
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
    flex: 1,
    flexDirection: 'row',
    flexShrink: 1,
    gap: 6,
    minWidth: 0,
  },
  dueDateText: {
    color: Colors.maroon10,
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  daysBadge: {
    alignItems: 'center',
    backgroundColor: Colors.warningBackground,
    borderColor: Colors.warningBorder,
    borderRadius: 4,
    borderWidth: 1,
    flexShrink: 0,
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  daysBadgeText: {
    color: Colors.warningText,
    fontSize: 12,
    lineHeight: 16,
  },
  enrollButton: {
    alignItems: 'center',
    backgroundColor: Colors.primaryTint,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    height: 44,
    justifyContent: 'center',
    width: '100%',
  },
  enrollButtonPressed: {
    backgroundColor: Colors.red02,
  },
  enrollText: {
    color: Colors.primaryText,
    fontSize: 15,
    lineHeight: 22,
  },
});

export const upcomingBillCardStyles = createUpcomingBillCardStyles(LightColors);
