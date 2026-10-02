import { StyleSheet } from "react-native";

export const dynamicFormComponentStyles = StyleSheet.create({
  countryPicker: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    paddingLeft: 22, 
    width: '100%' 
  },
  countryPickerIcon: {
    width: 105,
    height: '100%'
  },
  rowFieldItem: {
    width: '100%',
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxTextWrapper: {
    flex: 1,
    paddingTop: 8,
  },
});
