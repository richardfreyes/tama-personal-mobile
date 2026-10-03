import { SAVED_BILL_CARD_GAP, SAVED_BILL_CARD_WIDTH } from "@/constants/savedBills";
import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const billsComponentStyles = StyleSheet.create({
  // The carousel bleeds to the panel's edges; its content is inset to line up with the header.
  carouselViewport: {
    marginHorizontal: -16,
  },
  carouselContent: {
    flexDirection: 'row',
    gap: SAVED_BILL_CARD_GAP,
    paddingBottom: 2,
    paddingHorizontal: 16,
  },
  billerCard: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    minHeight: 158,
    padding: 14,
    width: SAVED_BILL_CARD_WIDTH,
  },
  cardPressed: {
    backgroundColor: Colors.red01,
  },
  billerDetails: {
    gap: 2,
    minHeight: 56,
  },
  nickname: {
    color: Colors.maroon11,
    fontSize: 14,
    lineHeight: 20,
  },
  merchantName: {
    color: Colors.maroon09,
    fontSize: 12,
    lineHeight: 17,
    minHeight: 34,
  },
  amount: {
    color: Colors.maroon11,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    lineHeight: 22,
    marginTop: 'auto',
  },
  noAmount: {
    color: Colors.maroon08,
    fontSize: 13,
    lineHeight: 22,
    marginTop: 'auto',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  addBillerButton: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
  },
  addBillerPressed: {
    backgroundColor: Colors.red02,
  },
  addBillerText: {
    color: Colors.red09,
    fontSize: 15,
    lineHeight: 22,
  },
  payNowButton: {
    borderRadius: 14,
    flex: 1,
    height: 48,
    overflow: 'hidden',
  },
  payNowGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  payNowPressed: {
    opacity: 0.93,
  },
  payNowText: {
    color: Colors.neutral01,
    fontSize: 15,
    lineHeight: 22,
  },
  skeletonCard: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    height: 158,
    padding: 14,
    width: SAVED_BILL_CARD_WIDTH,
  },
  skeletonDetails: {
    gap: 8,
  },
  skeletonAmount: {
    marginTop: 'auto',
  },
});
