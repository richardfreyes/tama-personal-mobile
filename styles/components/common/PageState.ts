import { StyleSheet } from "react-native";

export const pageStateStyles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexGrow: 1,
    paddingVertical: 20,
  },
  brandLogoHolder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  brandLogo: {
    justifyContent: 'center',
  }
});