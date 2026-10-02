import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const billsComponentStyles = StyleSheet.create({
  billListContent: {
    paddingVertical: 5,
    justifyContent: 'center',
  },
  cardWrapper: {
    width: 120,
    marginRight: 15,
  },
  billCard: {
    backgroundColor: Colors.neutral01,
    borderRadius: 8,
    padding: 10,
  },
  logoPlaceholder: {
    height: 50,
    borderRadius: 4,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billerLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  billerName: {
    fontSize: FontSizes.small,
  },
  subText: {
    fontSize: FontSizes.tiny,
		marginBottom: 7,
  },
  amountText: {
    fontSize: 14,
  },
});