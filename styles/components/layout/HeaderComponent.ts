import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const headerComponentStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.neutral01,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInitials: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: Colors.aqua07,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.neutral05,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  headerButton: {
    position: 'relative',
    marginLeft: 18, 
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minHeight: 12,
    minWidth: 12,
    paddingHorizontal: 4,
    backgroundColor: Colors.error06,
    borderRadius: 8,
    height: 12,
  },
  unreadCountLabel: {
    textAlign: 'center',
    color: Colors.neutral01,
  }
});