import { StyleSheet } from 'react-native';
import { Colors } from '../../common/colors';

export const statusBadgeStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    flexDirection: 'row',
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  summaryCardBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    marginLeft: 6,
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    lineHeight: 17,
  },
  badgeText: {
    color: Colors.neutral09,
  },
});
