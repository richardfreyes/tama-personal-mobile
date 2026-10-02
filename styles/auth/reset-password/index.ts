import { StyleSheet } from "react-native";

export const resetPasswordStyles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexGrow: 1,
    paddingVertical: 20,
  },
  formContainer: {
    marginBottom: 30,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginLink: {
    textDecorationLine: 'underline',
  },
});
