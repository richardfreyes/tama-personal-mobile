import { SAVED_BILL_CARD_GAP, SAVED_BILL_CARD_WIDTH } from "@/constants/savedBills";
import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const billsComponentStyles = StyleSheet.create({

  carouselViewport: {
    marginHorizontal: -16,
  },
  carouselContent: {
    flexDirection: 'row',
    gap: SAVED_BILL_CARD_GAP,
    paddingBottom: 2,
    paddingHorizontal: 16,
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
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    height: 128,
    padding: 14,
    width: SAVED_BILL_CARD_WIDTH,
  },
  skeletonDetails: {
    gap: 8,
  },
  skeletonAmount: {
    marginTop: 'auto',
  },

  plainSection: {
    gap: 14,
    paddingBottom: 4,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  plainHeader: {
    marginBottom: 0,
  },
  plainBody: {
    gap: 12,
  },
  plainCarouselViewport: {
    marginHorizontal: -20,
  },
  plainCarouselContent: {
    flexDirection: 'row',
    gap: SAVED_BILL_CARD_GAP,
    paddingBottom: 6,
    paddingHorizontal: 20,
    paddingTop: 2,
  },
});
