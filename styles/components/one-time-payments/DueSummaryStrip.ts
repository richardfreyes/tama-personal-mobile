import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createDueSummaryStripStyles = (Colors: ThemeColors) => StyleSheet.create({
  strip: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconTile: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderRadius: 12,
    flexShrink: 0,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: Colors.maroon09,
    fontSize: 12,
    lineHeight: 17,
  },
  total: {
    color: Colors.text,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    lineHeight: 26,
  },
  noAmount: {
    fontSize: 14,
  },
  next: {
    color: Colors.maroon09,
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 110,
    textAlign: 'right',
  },
});

export const dueSummaryStripStyles = createDueSummaryStripStyles(LightColors);
