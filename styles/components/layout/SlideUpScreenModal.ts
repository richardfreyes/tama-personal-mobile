import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createSlideScreenModalStyles = (Colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.neutral01,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleIndicator: {
    backgroundColor: Colors.neutral05,
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});

export const slideScreenModalStyles = createSlideScreenModalStyles(LightColors);
