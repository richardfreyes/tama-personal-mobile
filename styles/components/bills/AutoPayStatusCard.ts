import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const autoPayStatusCardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral01,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: Colors.neutral09,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    flexShrink: 1,
  },
  subtitle: {
    marginTop: 8,
    lineHeight: 18,
  },
  manageButton: {
    marginTop: 16,
  },
});
