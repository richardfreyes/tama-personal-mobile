import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const createSettingsStyles = (Colors: ThemeColors) => StyleSheet.create({
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
  logoutSection: {
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: Colors.error01,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error02,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutLabel: {
    fontSize: FontSizes.small,
    color: Colors.error08,
  },
});
export const settingsStyles = createSettingsStyles(LightColors);
