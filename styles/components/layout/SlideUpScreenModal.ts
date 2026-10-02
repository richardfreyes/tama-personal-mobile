import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const slideScreenModalStyles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: Colors.neutral05,
    width: 50,
    height: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
});