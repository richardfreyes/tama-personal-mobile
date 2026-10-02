import { StyleSheet } from "react-native";
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
});