import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const appSelectInputStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  touchableAnchor: {
    width: '100%', 
  },
  input: { 
    fontSize: 14,
    width: '100%',
    color: Colors.neutral08,
  }
});