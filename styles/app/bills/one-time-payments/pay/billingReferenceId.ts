import { Colors } from "@/styles/common/colors";
import { StyleSheet } from "react-native";

export const billingReferenceIdStyles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '100%',
    flex: 1,
  },
  amountInputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  amountInput: {
    width: '70%',
  },
  computationWrapper: {
    width: '100%',
  },
  label: {
    textAlign: 'center',
  },
  newCardNotice: {
    backgroundColor: Colors.aqua01,
    borderRadius: 8,
    padding: 12,
  },
});