import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const directDebitBankOptionStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.neutral01,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral03,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    flexShrink: 0,
    marginRight: 4,
  },
  label: {
    flex: 1,
    flexShrink: 1,
    fontWeight: '600',
  },
  chevron: {
    flexShrink: 0,
  },
});
