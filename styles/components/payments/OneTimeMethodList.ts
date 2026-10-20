import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createOneTimeMethodListStyles = (Colors: ThemeColors) => StyleSheet.create({

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

export const oneTimeMethodListStyles = createOneTimeMethodListStyles(LightColors);
