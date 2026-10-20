import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from "react-native";

export const createInvoiceReferenceIdStyles = (Colors: ThemeColors) => StyleSheet.create({
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
    color: Colors.primaryText,
    marginTop: 10,
  },
});
export const invoiceReferenceIdStyles = createInvoiceReferenceIdStyles(LightColors);
