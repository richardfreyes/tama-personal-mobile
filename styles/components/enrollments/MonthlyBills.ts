import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createMonthlyBillsStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  carouselViewport: {
    alignSelf: 'stretch',
    marginHorizontal: -16,
    marginVertical: -16,
  },
  carousel: {
    alignSelf: 'stretch',
    width: '100%',
  },
  carouselContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  indicatorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 25,
    minHeight: 18,
  },
  indicatorTrack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexShrink: 1,
    gap: 6,
    minWidth: 0,
  },
  indicatorSlot: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 12,
  },
  indicatorSlotActive: {
    width: 18,
  },
  monthlyIndicatorInactive: {
    backgroundColor: Colors.background === '#0E0F13' ? '#4A2A2C' : '#F5BDBD',
    borderRadius: 3,
    height: 6,
    width: 6,
  },

  indicatorDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  indicatorActive: {
    backgroundColor: Colors.red10,
    width: 18,
  },
  indicatorInactive: {
    backgroundColor: Colors.red04,
  },
  monthlyIndicatorActive: {
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
    width: 18,
  },
  indicatorGradient: {
    height: 6,
    width: 18,
  },
  indicatorCount: {
    color: Colors.maroon09,
    flexShrink: 0,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    lineHeight: 18,
    textAlign: 'right',
  },
  loadingCard: {
    alignSelf: 'stretch',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 20,
    minHeight: 258,
    padding: 20,
  },
  loadingHeadingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingHeadingColumn: {
    gap: 10,
  },
  loadingAmountColumn: {
    gap: 12,
  },
  emptyCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  emptyIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  emptyCopy: {
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 280,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: 8,
    height: 44,
    overflow: 'hidden',
    width: '100%',
  },
  emptyButtonPressed: {
    opacity: 0.93,
  },
  emptyButtonGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    height: 44,
    justifyContent: 'center',
    width: '100%',
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 22,
  },
});

export const monthlyBillsStyles = createMonthlyBillsStyles(LightColors);
