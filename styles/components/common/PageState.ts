import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createPageStateStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 12,
    width: 64,
  },
  iconSuccess: {
    backgroundColor: Colors.successBackground,
  },
  iconError: {
    backgroundColor: Colors.errorBackground,
  },
  iconNeutral: {
    backgroundColor: Colors.backgroundSecondary,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
  },
});

export const pageStateStyles = createPageStateStyles(LightColors);
