import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createMerchantLogoStyles = (Colors: ThemeColors) => StyleSheet.create({
  tile: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 40,
  },
  image: { height: 38, width: 38 },

  circle: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    justifyContent: 'center',
    overflow: 'hidden',
   borderWidth: 1, borderColor: Colors.border,},

  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringEdge: {
    alignItems: 'center',
    borderColor: Colors.neutral01,
    borderWidth: 2,
    justifyContent: 'center',
  },
  initials: { color: Colors.maroon10, fontSize: 12, letterSpacing: 0.24, lineHeight: 17 },
  initialsLarge: { fontSize: 15, letterSpacing: 0.3, lineHeight: 22 },
});

export const merchantLogoStyles = createMerchantLogoStyles(LightColors);
