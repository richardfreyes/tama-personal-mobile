import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createSectionHeaderComponentStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  titleGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  title: {
    color: Colors.text,
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 22,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 6,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    minWidth: 22,
    paddingHorizontal: 7,
  },
  countText: {
    color: Colors.maroon10,
    fontSize: 12,
    lineHeight: 16,
  },

  link: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    height: 44,
    marginRight: -8,
    marginVertical: -10,
    paddingHorizontal: 8,
  },
  linkText: {
    color: Colors.primaryText,
    fontSize: 15,
    lineHeight: 20,
  },
});

export const sectionHeaderComponentStyles = createSectionHeaderComponentStyles(LightColors);
