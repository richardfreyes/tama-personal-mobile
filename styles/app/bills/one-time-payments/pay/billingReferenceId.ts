import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from "react-native";

export const createBillingReferenceIdStyles = (Colors: ThemeColors) => StyleSheet.create({
  screen: {
    backgroundColor: Colors.neutral01,
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingBottom: 156,
  },
  body: {
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  amountSection: {
    gap: 18,
  },
  amountField: {
    gap: 8,
  },
  paySection: {
    gap: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
});

export const billingReferenceIdStyles = createBillingReferenceIdStyles(LightColors);
