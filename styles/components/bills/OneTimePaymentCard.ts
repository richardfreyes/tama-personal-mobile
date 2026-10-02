import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const oneTimePaymentCardStyles = StyleSheet.create({
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
  contentBlock: {
    marginBottom: 16,
  },
  statusText: {
    lineHeight: 22,
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 18,
  },
  stateText: {
    lineHeight: 20,
  },
});
