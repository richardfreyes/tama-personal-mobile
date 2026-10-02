import { Colors } from "@/styles/common/colors";
import { StyleSheet } from "react-native";

export const paymentSourceSelectorStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral03,
    marginBottom: 12,
    backgroundColor: Colors.neutral01,
  },
  optionSelected: {
    borderColor: Colors.red10,
    backgroundColor: Colors.red01,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.neutral05,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: Colors.red10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.red10,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionDescription: {
    color: Colors.neutral08,
    marginTop: 2,
  },
});
