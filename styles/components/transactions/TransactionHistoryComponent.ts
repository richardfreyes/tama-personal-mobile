import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const transactionHistoryComponentStyles = StyleSheet.create({
  dateSeparatorText: {
    fontSize: FontSizes.small,
    color: Colors.red10,
    marginTop: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  colLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    marginRight: 30,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#343A40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  iconWithLogo: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderWidth: 1,
  },
  avatarLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  textDetails: {
    justifyContent: 'center',
    flex: 1,
  },
  merchantName: {
    fontSize: FontSizes.small,
  },
  unitName: {
    fontSize: FontSizes.extraSmall,
    color: Colors.red10,
  },
  colRight: {
    flex: 1.5,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusDisplay: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 16,
  },
  dateText: {
    color: Colors.neutral07,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral08,
    marginRight: 6,
  },
  statusRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTypeWrapper: {
    padding: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  paymentType: {
    verticalAlign: 'middle',
    marginRight: 4,
    backgroundColor: Colors.neutral03,
    borderRadius: 8,
    color: Colors.maroon05
  },
  oneTimePaymentTypeBadge: {
    backgroundColor: Colors.neutral01,
  },
  oneTimePaymentTypeText: {
    color: Colors.neutral08,
  },
  enrollmentTypeBadge: {
    backgroundColor: Colors.info01,
  },
  enrollmentTypeText: {
    color: Colors.info10,
  },
  statusText: {
    // fontSize: FontSizes.small,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBarInner: {
    flex: 1,
  },
  filterIconContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: Colors.maroon10,
    borderRadius: 20,
    marginLeft: 12,
  },
  btnFilter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  sourceErrorNotice: {
    alignItems: 'center',
    backgroundColor: Colors.error01,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sourceErrorText: {
    color: Colors.error08,
    flex: 1,
    marginRight: 12,
  },
  sourceRetryButton: {
    backgroundColor: Colors.neutral01,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sourceRetryText: {
    color: Colors.error08,
  },
  btFilterType: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Compact rows of the recent transactions preview.
  recentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 68,
    paddingVertical: 14,
  },
  recentDetails: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  recentMerchant: {
    color: Colors.maroon11,
    fontSize: 14,
    lineHeight: 20,
  },
  recentMeta: {
    color: Colors.maroon09,
    fontSize: 12,
    lineHeight: 17,
  },
  recentAmountColumn: {
    alignItems: 'flex-end',
    flexShrink: 1,
    gap: 4,
    maxWidth: '48%',
  },
  recentAmount: {
    color: Colors.maroon11,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    lineHeight: 20,
  },
  recentBadge: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    height: 20,
    paddingHorizontal: 7,
  },
  recentBadgeDot: {
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  recentBadgeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  recentDivider: {
    backgroundColor: Colors.dashboardSkeleton,
    height: 1,
    marginLeft: 52,
  },
  recentSkeletonDetails: {
    flex: 1,
    gap: 8,
  },
});
