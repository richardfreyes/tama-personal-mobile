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
  // Error with a retry action.
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
  // Empty with an icon, title and description.
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
});
