import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const infoFieldComponentStyles = StyleSheet.create({
  fieldContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  fieldValue: {
    position: 'relative',
    fontSize: FontSizes.small,
    flex: 1,
    textAlign: 'right',
    paddingLeft: 8,
  },
  fieldLabel: {
    fontSize: FontSizes.small, 
    color: Colors.neutral08,
    flex: 1,
    marginRight: 8,
  },
  fieldDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.maroon02,
  },
  copyIcon: {
    marginTop: 0,
  }
});