import { Colors } from '@/styles/common/colors';
import { FontSizes } from '@/styles/common/typography';
import { StyleSheet } from 'react-native';

export const enrollmentListComponentStyles = StyleSheet.create({
  listPanel: {
    flex: 1,
    marginHorizontal: 12,
  },
  list: {
    backgroundColor: Colors.transparent,
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 28,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  carouselList: {
    marginHorizontal: -8,
    marginVertical: -6,
  },
  carouselContent: {
    paddingBottom: 10,
    paddingLeft: 8,
    paddingRight: 20,
    paddingTop: 10,
  },
  carouselCardWrapper: {
    marginBottom: 0,
    marginRight: 12,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  searchBarWrapper: {
    marginBottom: 14,
  },
  cardAnimationWrapper: {
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    shadowColor: Colors.neutral10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 40,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Colors.aegeanBlue10,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    marginRight: 10,
    width: 40,
  },
  avatarText: {
    color: Colors.neutral01,
    lineHeight: 22,
  },
  avatarWithLogo: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.neutral04,
    borderWidth: 1,
  },
  avatarLogo: {
    height: 34,
    width: 34,
  },
  identityGroup: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.neutral09,
    fontSize: FontSizes.medium,
    letterSpacing: -0.15,
    lineHeight: 22,
  },
  referenceText: {
    color: Colors.neutral07,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 4,
  },
  amountPanel: {
    backgroundColor: Colors.aqua01,
    borderRadius: 14,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  panelLabel: {
    color: Colors.aegeanBlue10,
    letterSpacing: 0.8,
  },
  panelAmount: {
    color: Colors.neutral09,
    fontSize: FontSizes.extraExtraLarge,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  panelDivider: {
    backgroundColor: Colors.aegeanBlue04,
    height: 1,
    marginVertical: 5,
  },
  nextDebitRow: {
    marginTop: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextDebitValue: {
    textAlign: 'right',
  },
  paymentMethodFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
    minHeight: 16,
  },
  paymentMethodIconFrame: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    marginRight: 10,
    width: 34,
  },
  paymentMethodText: {
    color: Colors.neutral08,
    flex: 1,
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
