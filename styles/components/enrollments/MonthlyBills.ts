import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const monthlyBillsStyles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  carouselViewport: {
    alignSelf: 'stretch',
    marginHorizontal: -20,
    // The track pads 16 above and below the card so its shadow isn't clipped; pull it back so the
    // card sits 16 below the header and the indicators 10 below the card.
    marginVertical: -16,
  },
  carousel: {
    alignSelf: 'stretch',
    width: '100%',
  },
  carouselContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  indicatorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    minHeight: 24,
  },
  indicatorTrack: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  indicatorSlot: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginVertical: -10,
    width: 12,
  },
  indicatorSlotActive: {
    width: 26,
  },
  monthlyIndicatorInactive: {
    backgroundColor: Colors.red04,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  // Also used by the login onboarding pagination.
  indicatorDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  indicatorActive: {
    backgroundColor: Colors.red10,
    width: 20,
  },
  indicatorInactive: {
    backgroundColor: Colors.red04,
  },
  monthlyIndicatorActive: {
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
    width: 20,
  },
  indicatorGradient: {
    height: 6,
    width: 20,
  },
  indicatorCount: {
    color: Colors.maroon09,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    lineHeight: 18,
    textAlign: 'right',
  },
  loadingCard: {
    alignSelf: 'stretch',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 24,
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
    borderRadius: 24,
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
    color: Colors.maroon11,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.maroon09,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 280,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: 14,
    height: 48,
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
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  emptyButtonText: {
    color: Colors.neutral01,
    fontSize: 15,
    lineHeight: 22,
  },
});
