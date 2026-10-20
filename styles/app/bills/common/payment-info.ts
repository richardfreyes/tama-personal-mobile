import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createPaymentInfoStyles = (Colors: ThemeColors) => StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '100%',
  },
  section: {
    gap: 10,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  toggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    height: 48,
    justifyContent: 'center',
  },
  togglePressed: {
    opacity: 0.7,
  },
  toggleText: {
    color: Colors.primaryText,
    fontSize: 14,
    lineHeight: 20,
  },
});

export const paymentInfoStyles = createPaymentInfoStyles(LightColors);
