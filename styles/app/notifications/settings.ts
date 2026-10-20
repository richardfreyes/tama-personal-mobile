import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createNotificationSettingsStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral03,
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
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    color: Colors.neutral08,
    marginBottom: 10,
    marginTop: 24,
  },
  toggleItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  toggleLabel: {
    flex: 1,
  },
});
export const notificationSettingsStyles = createNotificationSettingsStyles(LightColors);
