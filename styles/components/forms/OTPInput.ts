import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "../../common/typography";

export const createOTPInputStyles = (Colors: ThemeColors) => StyleSheet.create({
  inputVerifyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  inputVerify: {
    height: 56,
    width: undefined,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.neutral05,
    textAlign: 'center',
    fontSize: 22,
    color: Colors.text,
    backgroundColor: Colors.inputBackground,
    fontWeight: 'bold',
    outlineColor: Colors.primary,
   flex: 1, minWidth: 0, fontFamily: 'PoppinsSemiBold',},
  inputFocused: {
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.primary,
   boxShadow: `0 0 0 3px ${Colors.focusRing}`,},
  helperText: {
    marginTop: 4,
    paddingLeft: 0,
    fontSize: 12,
    marginBottom: 22,
    color: Colors.error10,
   lineHeight: 16,}
});
export const OTPInputStyles = createOTPInputStyles(LightColors);
