import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const createSettingsStyles = (Colors: ThemeColors) => StyleSheet.create({
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
export const settingsStyles = createSettingsStyles(LightColors);
