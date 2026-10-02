import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
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