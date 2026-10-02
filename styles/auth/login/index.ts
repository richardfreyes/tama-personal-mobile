import { Colors } from "@/styles/common/colors";
import { StyleSheet } from "react-native";

export const loginStyle = StyleSheet.create({
  screenContainer: {
    paddingBottom: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    marginBottom: 16
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 24,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.aqua10,
    textDecorationLine: 'underline',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  faceIdIcon: {
    alignItems: 'center',
    marginBottom: 24
  },
  versionFooter: {
    alignItems: 'center',
    bottom: 16,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  versionText: {
    color: Colors.neutral07,
    fontSize: 10,
    textAlign: 'center',
  },
});
