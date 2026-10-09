import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const paymentSuccessStyles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '100%',
    flex: 1,
  },
  receiptContent: {
    paddingTop: 16,
  },
  receiptCard: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  processingNotice: {
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign:'center',
    marginBottom: 10
  },
  sectionTitle: {
    marginBottom: 8,
  },
  paymentDetailsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadReceiptContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  downloadReceiptLabel: {
    fontSize: FontSizes.base,
    marginLeft: 12,
  },
  downloadRefLabel: {
    fontSize: FontSizes.extraSmall,
    color: Colors.neutral07,
  },
  downloadDateLabel: {
    fontSize: FontSizes.extraSmall, 
    color: Colors.neutral07
  },
  downloadDescLabel: {
    fontSize: FontSizes.extraSmall, 
    textAlign: 'center',
    color: Colors.neutral07
  },
  scheduledPaymentNoteContainer: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});
