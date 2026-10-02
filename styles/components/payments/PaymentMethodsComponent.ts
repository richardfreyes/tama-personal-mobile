import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const paymentMethodsComponentStyles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  cardName: {
    fontSize: FontSizes.small,
  },
  cardNumber: {
    fontSize: FontSizes.extraSmall,
  },
  defaultTag: {
    backgroundColor: Colors.success10,
    borderRadius: 20, 
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  defaultText: {
    color: Colors.neutral01,
    fontSize: FontSizes.extraSmall,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
});