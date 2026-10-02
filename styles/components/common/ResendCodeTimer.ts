import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const resendCodeTimerStyles = StyleSheet.create({
  waitingMessage: {
    fontSize: FontSizes.small,
    color: Colors.neutral07,
  },
  resendLink: {
    fontSize: FontSizes.small,
    color: Colors.neutral07,
  },
  resendText: {
    fontSize: FontSizes.small,
    color: Colors.red10,
    textDecorationLine: 'underline',
  },
});