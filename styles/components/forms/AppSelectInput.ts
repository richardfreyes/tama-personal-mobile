import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createAppSelectInputStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 8,
  },
  touchableAnchor: {
    width: '100%', 
  },
  input: { 
    fontSize: 14,
    width: '100%',
    color: Colors.neutral08,
   height: 48, backgroundColor: Colors.inputBackground, borderRadius: 8,}
});
export const appSelectInputStyles = createAppSelectInputStyles(LightColors);
