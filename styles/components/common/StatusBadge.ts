import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createStatusBadgeStyles = (Colors: ThemeColors) => StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 4,
    flexDirection: 'row',
    minHeight: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  summaryCardBadge: {
    alignSelf: 'center',
    borderRadius: 4,
    height: 22,
    marginLeft: 0,
    minHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  dot: {
    borderRadius: 3,
    flexShrink: 0,
    height: 6,
    width: 6,
  },
  badgeDot: {
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
  badgeText: {
    color: Colors.neutral09,
   fontSize: 12, lineHeight: 16,},
});

export const statusBadgeStyles = createStatusBadgeStyles(LightColors);
