import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const toggleOptionStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: Colors.aegeanBlue01,
    padding: 4,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  button: {
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: Colors.neutral01, 
  },
  text: {
    fontSize: FontSizes.base
  },
  selectedText: {
    color: Colors.aqua10,
  },
  unselectedText: {
    color: Colors.neutral08
  },
});