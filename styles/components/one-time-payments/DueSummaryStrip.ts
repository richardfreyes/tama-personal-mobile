import { StyleSheet } from 'react-native';
import { Colors } from '../../common/colors';

export const dueSummaryStripStyles = StyleSheet.create({
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
    color: Colors.maroon11,
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
