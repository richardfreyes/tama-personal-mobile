import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createLoginStyle = (Colors: ThemeColors) => StyleSheet.create({
  screenContainer: {
    paddingBottom: 48,
    paddingTop: 48,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 16,
  },
  checkbox: {
    height: 20,
    width: 20,
  },
  rememberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 16,
  },
  rememberMe: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rememberLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  forgotPasswordText: {
    color: Colors.primaryText,
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    lineHeight: 18,
  },
  signupRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupPrompt: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  signupLink: {
    fontSize: 13,
    lineHeight: 18,
  },
  welcomeName: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  welcomeEmail: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  faceIdIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  switchAccount: {
    color: Colors.primaryText,
    fontFamily: 'PoppinsSemiBold',
  },
  versionFooter: {
    alignItems: 'center',
    bottom: 16,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  versionText: {
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});

export const loginStyle = createLoginStyle(LightColors);
