import { Colors } from "@/styles/common/colors";
import { StatusBar, StyleSheet } from "react-native";

export const introStyle = StyleSheet.create({
  logo: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  imageStyleFix: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: StatusBar.currentHeight || 50,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.neutral01,
  },
  buttonContainer: {
    marginTop: 'auto',
    width: '100%',
    gap: 12,
  },
  getStartedButton: {
    height: 50,
    borderRadius: 8,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.neutral01,
    borderWidth: 1,
    height: 50,
    borderRadius: 8,
  },
  loginButtonText: {
    color: Colors.neutral01,
  },
});