import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const OTPInputStyles = StyleSheet.create({
  inputVerifyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  inputVerify: {
    height: 50,
    width: 50,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: Colors.neutral05,
    textAlign: 'center',
    fontSize: FontSizes.base,
    color: Colors.neutral08,
    backgroundColor: Colors.neutral01,
    fontWeight: 'bold',
    outlineColor: Colors.aqua10,
  },
  inputFocused: {
    backgroundColor: 'red',
    borderColor: Colors.aqua10, 
  },
  helperText: {
    marginTop: 4,
    paddingLeft: 0,
    fontSize: FontSizes.small,
    marginBottom: 22,
    color: Colors.error10,
  }
});