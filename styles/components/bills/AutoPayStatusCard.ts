import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const autoPayStatusCardStyles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 104,
    padding: 16,
  },
  iconTile: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  textColumn: { flex: 1, gap: 4, minWidth: 0 },
  titleRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  enrollmentCount: { color: Colors.maroon11, fontSize: 15, lineHeight: 22 },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    height: 22,
    paddingHorizontal: 8,
  },
  activeBadge: { backgroundColor: Colors.success01 },
  inactiveBadge: { backgroundColor: Colors.neutral03 },
  statusDot: { borderRadius: 3, height: 6, width: 6 },
  statusText: { fontSize: 12, lineHeight: 18 },
  description: { color: Colors.maroon09, fontSize: 13, lineHeight: 19 },
  chevron: { alignSelf: 'center' },
});
