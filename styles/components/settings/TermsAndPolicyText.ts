import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const termsAndPolicyTextStyles = StyleSheet.create({
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
    color: Colors.info07,
  },
});