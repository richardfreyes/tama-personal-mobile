import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const merchantLogoStyles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    backgroundColor: Colors.neutral03,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 40,
  },
  image: { height: 38, width: 38 },
  initials: { color: Colors.maroon10, fontSize: 12, letterSpacing: 0.24, lineHeight: 17 },
});
