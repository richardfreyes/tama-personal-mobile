import { StyleSheet } from "react-native";

export const snackBarStyles = StyleSheet.create({
  snackbar: {
    borderWidth: 1,
    borderRadius: 5,
    alignSelf: 'center',
    minWidth: '100%',
  },
  content: {
    paddingRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
});