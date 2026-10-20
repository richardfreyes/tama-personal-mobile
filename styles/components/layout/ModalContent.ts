import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createModalContentStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral01,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral04,
  },
  title: {
    textAlign: 'center',
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  description: {
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bulletMarker: {
    width: 20,
  },
  numberedMarker: {
    width: 24,
  },
  listText: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral04,
  },
});

export const modalContentStyles = createModalContentStyles(LightColors);
