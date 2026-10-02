import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const changeEmailStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.neutral01,
    paddingHorizontal: 12,
    paddingVertical: 24,
    width: '100%',
    flex: 1,
  },
  mainTitle: {
    fontSize: FontSizes.medium,
    color: Colors.neutral08,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: FontSizes.small,
  },
  inputFieldContainer: {
    position: 'relative',
  },
});