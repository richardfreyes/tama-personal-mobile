import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from "react-native";

export const createFormStyles = (Colors: ThemeColors) => StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  wrapper: {
    backgroundColor: Colors.neutral01,
    paddingHorizontal: 12,
    paddingVertical: 24,
    width: '100%',
    flex: 1,
  },
});

export const formStyles = createFormStyles(LightColors);
