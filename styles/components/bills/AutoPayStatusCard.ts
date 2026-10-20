import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createAutoPayStatusCardStyles = (Colors: ThemeColors) => StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    padding: 12,
  },
  iconTile: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  textColumn: { flex: 1, gap: 4, minWidth: 0 },
  titleRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, minWidth: 0 },
  enrollmentCount: { color: Colors.text, flexShrink: 1, fontSize: 15, lineHeight: 22 },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
    height: 20,
    paddingHorizontal: 6,
  },
  activeBadge: { backgroundColor: Colors.success01 },
  inactiveBadge: { backgroundColor: Colors.neutral03 },
  statusDot: { borderRadius: 3, height: 6, width: 6 },
  statusText: { fontSize: 12, lineHeight: 18 },
  description: { color: Colors.maroon09, fontSize: 13, lineHeight: 19 },
  chevron: { alignSelf: 'center' },
});

export const autoPayStatusCardStyles = createAutoPayStatusCardStyles(LightColors);
