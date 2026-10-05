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

  titleGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    color: Colors.maroon11,
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: Colors.neutral03,
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    minWidth: 22,
    paddingHorizontal: 7,
  },
  countText: {
    color: Colors.maroon10,
    fontSize: 12,
    lineHeight: 18,
  },

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
