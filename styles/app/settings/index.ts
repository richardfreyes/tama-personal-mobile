import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const settingsStyles = StyleSheet.create({
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  profileInitials: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    backgroundColor: Colors.red07,
  },
  infoBlock: {
    alignItems: 'center',
    marginBottom: 10
  },
  userNameText: {
    textAlign: 'center',
    fontSize: FontSizes.base,
    color: Colors.neutral08,
    marginBottom: 2,
  },
  infoText: {
    textAlign: 'center',
    fontSize: FontSizes.extraSmall,
  },
  itemContainer: {
    backgroundColor: Colors.neutral01,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral03,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 8,
  },
  itemTitle: {
    fontSize: FontSizes.small,
  },
});