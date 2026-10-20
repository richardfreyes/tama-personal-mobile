import { Colors as LightColors } from '@/styles/common/colors';
import { FontSizes } from '@/styles/common/typography';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createEnrollmentListComponentStyles = (Colors: ThemeColors) => StyleSheet.create({
  listPanel: {
    flex: 1,
    marginBottom: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  list: {
    backgroundColor: Colors.transparent,
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 12,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  carouselList: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  carouselContent: {
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
  },
  carouselCardWrapper: {
    marginBottom: 0,
    marginRight: 8,
  },
  carouselSection: {
    marginBottom: 12,
    marginLeft: 16,
    marginRight: 28,
    marginTop: 8,
    overflow: 'hidden',
    padding: 12,
  },
  carouselHeader: {
    paddingHorizontal: 0,
  },
  paginationDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 12,
  },
  paginationDot: {
    backgroundColor: '#F5BDBD',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  paginationDotActive: {
    backgroundColor: Colors.red10,
    borderRadius: 3,
    width: 22,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  searchBarWrapper: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardAnimationWrapper: {
    marginBottom: 12,
  },
  itemContainer: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Colors.neutral03,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: {
    color: Colors.neutral07,
    fontSize: 15,
    lineHeight: 20,
  },
  avatarWithLogo: {
    backgroundColor: Colors.neutral01,
  },
  avatarLogo: {
    height: 36,
    width: 36,
  },
  headerChevron: {
    marginLeft: 0,
  },
  identityGroup: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.neutral09,
    fontSize: FontSizes.base,
    lineHeight: 20,
  },
  referenceText: {
    color: Colors.neutral07,
    fontSize: 12,
    letterSpacing: 0.48,
    lineHeight: 16,
  },
  amountPanel: {
    alignItems: 'flex-start',
    backgroundColor: Colors.neutral02,
    borderLeftColor: Colors.primary,
    borderLeftWidth: 3,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  amountPanelGlow: {
    height: 0,
    width: 0,
  },
  amountColumn: {
    flex: 1,
    minWidth: 0,
  },
  nextDebitColumn: {
    alignItems: 'flex-end',
    flexShrink: 0,
    paddingLeft: 12,
  },
  panelLabel: {
    color: Colors.neutral07,
    fontSize: 11,
    lineHeight: 15,
  },
  panelAmount: {
    color: Colors.primary,
    fontSize: FontSizes.large,
    fontVariant: ['tabular-nums'],
    lineHeight: 26,
  },
  nextDebitValue: {
    color: Colors.neutral09,
    fontSize: FontSizes.small,
    fontVariant: ['tabular-nums'],
    lineHeight: 20,
    textAlign: 'right',
  },
  nextDebitEmpty: {
    color: Colors.neutral06,
  },
  nextDebitCountdown: {
    color: Colors.neutral07,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
  },
  manageText: {
    color: Colors.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  paymentMethodFooter: {
    alignItems: 'center',
    borderTopColor: Colors.dashboardCardBorder,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
    paddingTop: 10,
  },
  paymentMethodIconFrame: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 4,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 40,
  },
  paymentMethodText: {
    color: Colors.neutral09,
    flex: 1,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    lineHeight: 20,
  },
  emptyState: {
    marginBottom: 12,
  },
  loadingMore: {
    marginVertical: 16,
  },
  footerText: {
    marginBottom: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

export const enrollmentListComponentStyles = createEnrollmentListComponentStyles(LightColors);
