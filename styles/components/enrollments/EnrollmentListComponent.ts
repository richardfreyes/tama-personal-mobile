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
    gap: 12,
    padding: 12,
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
    letterSpacing: 0.02 * 15,
    lineHeight: 20,
  },
  referenceText: {
    color: Colors.neutral07,
    fontSize: 12,
    letterSpacing: 0.48,
    lineHeight: 16,
  },
  amountPanel: {
    alignItems: 'flex-end',
    backgroundColor: '#C21212',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 12,
  },
  amountPanelGlow: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  amountColumn: {
    flex: 1,
    minWidth: 0,
  },
  nextDebitColumn: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  panelLabel: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    letterSpacing: 0.88,
    lineHeight: 14,
  },
  panelAmount: {
    color: Colors.white,
    fontSize: FontSizes.extraLarge,
    fontVariant: ['tabular-nums'],
    lineHeight: 28,
  },
  nextDebitValue: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    lineHeight: 22,
    textAlign: 'right',
  },
  nextDebitCountdown: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
  manageText: {
    color: Colors.neutral09,
    fontSize: 15,
    lineHeight: 20,
  },
  paymentMethodFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 28,
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
