import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const oneTimePaymentCardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
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
