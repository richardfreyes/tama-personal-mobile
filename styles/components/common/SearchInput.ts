import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createSearchInputStyles = (Colors: ThemeColors) => StyleSheet.create({

  filledContainer: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    height: 44,
    paddingLeft: 12,
    paddingRight: 6,
  },
  filledIcon: {
    flexShrink: 0,
  },
  filledInput: {
    color: Colors.text,
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 14,
    includeFontPadding: false,
    minWidth: 0,
    outlineColor: Colors.transparent,
    outlineWidth: 0,
    height: '100%',
    padding: 0,
  },
  filledPlaceholder: {
    color: Colors.textSecondary,
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    left: 40,
    lineHeight: 20,
    position: 'absolute',
    right: 42,
  },
  clearButton: {
    alignItems: 'center',
    flexShrink: 0,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});

export const searchInputStyles = createSearchInputStyles(LightColors);
