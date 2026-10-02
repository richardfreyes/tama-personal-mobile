import { Colors } from "@/styles/common/colors";
import { StyleSheet } from "react-native";

export const updateCardStyles = StyleSheet.create({
  cardDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 24,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  isPrimary: {
    backgroundColor: Colors.info10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    color: Colors.neutral01,
    borderRadius: 4,
    marginLeft: 8,
  },
  lastFourCardDigits: {
    marginBottom: 8,
  },
  billingCardholderName: {
    marginBottom: 12,
  },
  address: {
    color: Colors.neutral08,
    marginBottom: 12,
  },
  deleteHint: {
    color: Colors.neutral08,
    textAlign: 'center',
    marginTop: 8,
  }
});