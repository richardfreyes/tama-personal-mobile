import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const oneTimeMethodListStyles = StyleSheet.create({

  list: {
    paddingVertical: 0,
  },
  tile: {
    alignItems: 'center',
    backgroundColor: Colors.neutral03,
    borderRadius: 12,
    flexShrink: 0,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
