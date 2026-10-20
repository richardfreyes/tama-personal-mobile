import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "../../common/typography";

export const createSignupStyles = (Colors: ThemeColors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  termsRow: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 5,
  },
  termsIntroText: {
    lineHeight: 18,
    fontSize: FontSizes.small,
  },
  termsLink: {
    fontSize: FontSizes.small,
    color: Colors.primaryText
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginLinkText: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  loginLink: {
    color: Colors.primaryText,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    lineHeight: 20,
  }
});
export const signupStyles = createSignupStyles(LightColors);
