import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createOneTimePaymentCardStyles = (Colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
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

export const oneTimePaymentCardStyles = createOneTimePaymentCardStyles(LightColors);
