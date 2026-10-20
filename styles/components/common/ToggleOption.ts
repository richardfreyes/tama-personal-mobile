import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "../../common/typography";

export const createToggleOptionStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: Colors.maroon01,
    padding: 4,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  button: {
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: Colors.neutral01, 
  },
  text: {
    fontSize: FontSizes.base
  },
  selectedText: {
    color: Colors.primaryText,
  },
  unselectedText: {
    color: Colors.neutral08
  },
});
export const toggleOptionStyles = createToggleOptionStyles(LightColors);
