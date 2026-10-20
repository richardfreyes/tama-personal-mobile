import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from "react-native";

export const createPaymentSourceSelectorStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    gap: 8,
  },
  segments: {
    backgroundColor: Colors.neutral03,
    borderRadius: 14,
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 11,
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: Colors.neutral01,
    boxShadow: '0px 1px 3px rgba(61, 36, 34, 0.12)',
  },
  segmentText: {
    color: Colors.maroon09,
    fontSize: 14,
    lineHeight: 20,
  },
  segmentTextSelected: {
    color: Colors.text,
  },
  hint: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 2,
  },
});

export const paymentSourceSelectorStyles = createPaymentSourceSelectorStyles(LightColors);
