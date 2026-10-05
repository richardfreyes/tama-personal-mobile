import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const emptyStateCardStyles = StyleSheet.create({
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
    height: 50,
    borderRadius: 8,
  },

  errorCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  errorIcon: {
    alignItems: 'center',
    backgroundColor: Colors.error01,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  errorMessage: {
    color: Colors.maroon10,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderRadius: 12,
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
    color: Colors.red09,
    fontSize: 14,
    lineHeight: 20,
  },

  emptyCard: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: Colors.neutral03,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  emptyCopy: {
    flex: 1,
    gap: 2,
  },
  emptyTitle: {
    color: Colors.maroon11,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyDescription: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 19,
  },

  dashedCard: {
    alignItems: 'center',
    borderColor: Colors.outlineMuted,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  dashedIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  dashedCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  dashedTitle: {
    color: Colors.maroon11,
    fontSize: 14,
    lineHeight: 20,
  },
  dashedDescription: {
    color: Colors.maroon09,
    fontSize: 12,
    lineHeight: 17,
  },

  centeredCard: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 4,
    paddingTop: 36,
  },
  centeredIcon: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  centeredCopy: {
    alignItems: 'center',
    gap: 6,
  },
  centeredTitle: {
    color: Colors.maroon11,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  centeredDescription: {
    color: Colors.maroon09,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 270,
    textAlign: 'center',
  },
  centeredAction: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  centeredActionPressed: {
    backgroundColor: Colors.red02,
  },
  centeredActionText: {
    color: Colors.red09,
    fontSize: 14,
    lineHeight: 20,
  },
});
