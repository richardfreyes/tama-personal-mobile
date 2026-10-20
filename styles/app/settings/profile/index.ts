import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const createProfileStyles = (Colors: ThemeColors) => StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: FontSizes.base, 
    color: Colors.neutral08,
    marginBottom: 12
  },
  infoBox: {
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  fieldContainer: {
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: FontSizes.base,
    marginTop: 2,
  },
  fieldValue: {
    fontSize: FontSizes.base,
  },
});
export const profileStyles = createProfileStyles(LightColors);
