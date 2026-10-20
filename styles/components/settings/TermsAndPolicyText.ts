import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "../../common/typography";

export const createTermsAndPolicyTextStyles = (Colors: ThemeColors) => StyleSheet.create({
  termsRow: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
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
    color: Colors.primaryText,
    fontFamily: 'PoppinsMedium',
  },
});
export const termsAndPolicyTextStyles = createTermsAndPolicyTextStyles(LightColors);
