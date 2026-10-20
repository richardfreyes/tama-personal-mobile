import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "../../common/typography";

export const createEmptyStateCardStyles = (Colors: ThemeColors) => StyleSheet.create({
  cardContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    justifyContent: 'center',
  },
  message: {
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: FontSizes.small,
  },
  actionButton: {
    width: '100%',
    height: 44,
    borderRadius: 8,
  },

  errorCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  errorIcon: {
    alignItems: 'center',
    backgroundColor: Colors.error01,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  errorMessage: {
    color: Colors.maroon10,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  retryPressed: {
    backgroundColor: Colors.red02,
  },
  retryText: {
    color: Colors.primaryText,
    fontSize: 15,
    lineHeight: 20,
  },

  emptyCard: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
   borderStyle: 'dashed',},
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: Colors.neutral03,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  emptyCopy: {
    flex: 1,
    gap: 2,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  emptyDescription: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 18,
  },

  dashedCard: {
    alignItems: 'center',
    borderColor: Colors.outlineMuted,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  dashedIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
   backgroundColor: Colors.neutralBackground,},
  dashedCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  dashedTitle: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  dashedDescription: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 18,
  },

  centeredCard: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 4,
    paddingTop: 36,
  },
  centeredIcon: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  centeredCopy: {
    alignItems: 'center',
    gap: 6,
  },
  centeredTitle: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  centeredDescription: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 270,
    textAlign: 'center',
  },
  centeredAction: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  centeredActionPressed: {
    backgroundColor: Colors.red02,
  },
  centeredActionText: {
    color: Colors.primaryText,
    fontSize: 15,
    lineHeight: 20,
  },
});

export const emptyStateCardStyles = createEmptyStateCardStyles(LightColors);
