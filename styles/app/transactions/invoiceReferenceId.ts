import { Colors } from "@/styles/common/colors";
import { StyleSheet } from "react-native";

export const invoiceReferenceIdStyles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.neutral08,
  },
  errorText: {
    color: Colors.error06,
    fontSize: 16,
  },
  backLink: {
    color: Colors.red10,
    marginTop: 10,
  },
});