import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const searchInputStyles = StyleSheet.create({

  filledContainer: {
    alignItems: 'center',
    backgroundColor: Colors.neutral03,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 10,
    height: 48,
    paddingLeft: 16,
    paddingRight: 6,
  },
  filledIcon: {
    flexShrink: 0,
  },
  filledInput: {
    color: Colors.maroon11,
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    includeFontPadding: false,
    minWidth: 0,
    outlineColor: Colors.transparent,
    outlineWidth: 0,
    height: '100%',
    padding: 0,
  },
  filledPlaceholder: {
    color: Colors.maroon06,
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    left: 46,
    lineHeight: 22,
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
