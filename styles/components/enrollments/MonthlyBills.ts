import { Colors } from '@/styles/common/colors';
import { FontSizes } from '@/styles/common/typography';
import { StyleSheet } from 'react-native';

export const monthlyBillsStyles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: Colors.maroon01,
    borderColor: Colors.neutral03,
    borderRadius: 8,
    borderWidth: 0.5,
    gap: 12,
    overflow: 'hidden',
    padding: 12,
  },
  carouselViewport: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    width: '100%',
  },
  carousel: {
    alignSelf: 'stretch',
    width: '100%',
  },
  pressableCard: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  amountGroup: {
    alignSelf: 'stretch',
  },
  merchantName: {
    color: Colors.maroon09,
    lineHeight: 18,
    marginBottom: 2,
  },
  heading: {
    color: Colors.maroon10,
    fontSize: FontSizes.extraExtraLarge,
    lineHeight: 32,
    width: '100%',
  },
  amountLabel: {
    color: Colors.neutral07,
    fontSize: FontSizes.small,
    lineHeight: 20,
    marginBottom: 0,
  },
  indicatorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 20,
    paddingHorizontal: 2,
  },
  indicatorTrack: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  indicatorSlot: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 10,
  },
  indicatorVisual: {
    alignItems: 'center',
    height: 6,
    justifyContent: 'center',
    width: 10,
  },
  monthlyIndicatorInactive: {
    backgroundColor: Colors.red05,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  monthlyIndicatorActive: {
    backgroundColor: Colors.red09,
    borderRadius: 3,
    height: 6,
    position: 'absolute',
    width: 12,
  },
  indicatorDot: {
    backgroundColor: Colors.red10,
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  indicatorActive: {
    backgroundColor: Colors.red10,
    width: 19,
  },
  indicatorInactive: {
    backgroundColor: Colors.red05,
  },
  indicatorCount: {
    color: Colors.maroon08,
    fontSize: FontSizes.extraSmall,
    fontVariant: ['tabular-nums'],
    lineHeight: 14,
    minWidth: 40,
    textAlign: 'right',
  },
  loadingContainer: {
    alignSelf: 'stretch',
    gap: 14,
  },
  loadingCard: {
    alignSelf: 'stretch',
    gap: 10,
    paddingVertical: 2,
  },
  loadingIndicatorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 20,
    paddingHorizontal: 2,
  },
  loadingIndicatorDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  emptyTitle: {
    color: Colors.maroon10,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.neutral07,
    fontSize: FontSizes.small,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 280,
    textAlign: 'center',
  },
});
