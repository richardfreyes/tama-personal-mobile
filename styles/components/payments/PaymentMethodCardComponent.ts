import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "../../common/typography";

export const createPaymentMethodCardComponentStyles = (Colors: ThemeColors) => StyleSheet.create({
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

export const paymentMethodCardComponentStyles = createPaymentMethodCardComponentStyles(LightColors);
