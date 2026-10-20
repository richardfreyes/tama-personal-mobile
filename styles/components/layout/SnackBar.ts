import { StyleSheet } from "react-native";

export const snackBarStyles = StyleSheet.create({
  snackbar: {
    borderWidth: 0,
    borderRadius: 8,
    alignSelf: 'center',
    minWidth: '100%',
  },
  content: {
    paddingRight: 0,
    flexDirection: 'row',
    alignItems: 'center',
   gap: 10,},
});