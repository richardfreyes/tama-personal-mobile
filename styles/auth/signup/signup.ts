import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const signupStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    color: Colors.info07
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginLinkText: {
    fontSize: FontSizes.small,
  },
  loginLink: {
    fontSize: FontSizes.small,
    color: Colors.aqua10, 
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  }
});