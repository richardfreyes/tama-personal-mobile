import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createHeaderComponentStyles = (Colors: ThemeColors) => StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.background,
  },
  profileButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    minHeight: 44,
    minWidth: 0,
  },
  avatarRing: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarInner: {
    alignItems: 'center',
    backgroundColor: Colors.avatarBackground,
    borderColor: Colors.neutral01,
    borderRadius: 18,
    borderWidth: 0,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  initials: {
    color: Colors.primaryText,
    fontSize: 13,
    lineHeight: 18,
  },
  textColumn: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  greeting: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 18,
  },
  name: {
    color: Colors.text,
    fontSize: 17,
    lineHeight: 22,
  },
});

export const headerComponentStyles = createHeaderComponentStyles(LightColors);
