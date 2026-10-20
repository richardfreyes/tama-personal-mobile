import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "../../common/typography";

export const createResendCodeTimerStyles = (Colors: ThemeColors) => StyleSheet.create({
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
    color: Colors.primaryText,
    fontFamily: 'PoppinsSemiBold',
  },
});
export const resendCodeTimerStyles = createResendCodeTimerStyles(LightColors);
