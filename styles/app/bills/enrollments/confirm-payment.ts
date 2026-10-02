import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const confirmPaymentStyles = StyleSheet.create({
  disclaimerContainer: {
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.amber01,
  },
  disclaimerTitle: {
    fontSize: FontSizes.small,
    lineHeight: 20,
  },
  disclaimerText: {
    fontSize: FontSizes.small,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: 5,
  },
  checkboxText: {
    fontSize: FontSizes.small,
    lineHeight: 18,
  },
  link: {
    fontSize: FontSizes.small,
    color: Colors.info07,
  },
  required: {
    fontSize: FontSizes.small,
    color: Colors.error06,
  },
  noteContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  noteText: {
    fontSize: FontSizes.extraSmall,
    lineHeight: 18,
    color: Colors.neutral07,
  },
});
