import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const paymentMethodCardComponentStyles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.neutral01,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.neutral03,
    alignItems: 'flex-start',
  },
  iconList: {
    marginBottom: 10,
    alignItems: 'center',
  },
  smallIconContainer: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeLogoContainer: {
    marginBottom: 4,
  },
  titleText: {
    fontSize: FontSizes.small,
  },
});
