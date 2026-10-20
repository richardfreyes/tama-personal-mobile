import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createResetPasswordStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  formContainer: {
    marginBottom: 30,
  },
  loginLinkContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginPrompt: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  loginLink: {
    color: Colors.primaryText,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    lineHeight: 20,
  },
});

export const resetPasswordStyles = createResetPasswordStyles(LightColors);
