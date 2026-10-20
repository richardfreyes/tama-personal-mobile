import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createOptDeliverySelectionStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  cardContainer: {
    gap: 12,
    marginTop: 16,
  },
  card: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: Colors.primaryTint,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  textWrapper: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
});

export const optDeliverySelectionStyles = createOptDeliverySelectionStyles(LightColors);
