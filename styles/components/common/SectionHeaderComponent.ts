import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const sectionHeaderComponentStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: Colors.maroon11,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  // A 44pt touch target that doesn't add height to the row.
  link: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    height: 44,
    marginRight: -8,
    marginVertical: -10,
    paddingHorizontal: 8,
  },
  linkText: {
    color: Colors.red09,
    fontSize: 14,
    lineHeight: 20,
  },
});
