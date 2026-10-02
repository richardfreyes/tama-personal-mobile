import { Colors } from "@/styles/common/colors";
import { StyleSheet } from "react-native";

export const loadingStyles = StyleSheet.create({
  inlineContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 20,
  },
  inlineText: {
    marginLeft: 8,
  },
  skeletonBlock: {
    backgroundColor: Colors.neutral04,
  },
  skeletonContainer: {
    gap: 4,
    width: '100%',
  },
  skeletonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingVertical: 10,
  },
  skeletonTextGroup: {
    flex: 1,
    gap: 8,
  },
  skeletonTrailing: {
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 76,
  },
  horizontalCards: {
    flexDirection: 'row',
    gap: 15,
    paddingVertical: 5,
  },
  cardSkeleton: {
    backgroundColor: Colors.neutral01,
    borderRadius: 8,
    gap: 8,
    padding: 10,
  },
  billerRow: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderBottomColor: Colors.neutral03,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  paymentMethodList: {
    width: '100%',
  },
  paymentMethodRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingVertical: 12,
  },
  paymentMethodDetails: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  transactionDateSkeleton: {
    marginBottom: 4,
    marginTop: 12,
  },
  transactionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 72,
    paddingVertical: 12,
  },
  transactionLeft: {
    alignItems: 'center',
    flex: 2,
    flexDirection: 'row',
    gap: 10,
    marginRight: 30,
  },
  transactionRight: {
    alignItems: 'flex-end',
    flex: 1.5,
    gap: 6,
  },
  formContainer: {
    backgroundColor: Colors.maroon01,
    borderRadius: 8,
    gap: 16,
    padding: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  detailsContainer: {
    gap: 12,
  },
  detailsSection: {
    backgroundColor: Colors.maroon01,
    borderRadius: 8,
    gap: 12,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileContainer: {
    gap: 12,
  },
  profileSection: {
    backgroundColor: Colors.maroon01,
    borderRadius: 8,
    gap: 12,
    padding: 12,
  },
  profileHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileInfoBox: {
    gap: 12,
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  paymentInfoContainer: {
    gap: 12,
    width: '100%',
  },
  noticeSkeleton: {
    backgroundColor: Colors.amber01,
    borderRadius: 8,
    gap: 8,
    padding: 12,
  },
  checkboxSkeletonRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  receiptWrapper: {
    borderColor: Colors.neutral05,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    gap: 24,
    paddingHorizontal: 22,
    paddingTop: 33,
  },
  receiptHeader: {
    alignItems: 'center',
    gap: 8,
  },
  receiptFooter: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 24,
  },
  billPaymentContainer: {
    gap: 12,
  },
  amountSkeletonContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressTrack: {
    backgroundColor: Colors.neutral04,
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: Colors.red10,
    borderRadius: 4,
    height: '100%',
  },
});
