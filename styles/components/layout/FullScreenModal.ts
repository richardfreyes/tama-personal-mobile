import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createFullScreenModalStyles = (Colors: ThemeColors) => StyleSheet.create({
  centerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topContent: {
    justifyContent: 'center', 
    alignItems: 'center',
  },
  container: {
    borderRadius: 8,
    backgroundColor: Colors.neutral01,
    width: '90%',
    boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.1)',
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  btnContainer: {
    flexDirection: 'row',
  }
});
export const fullScreenModalStyles = createFullScreenModalStyles(LightColors);
