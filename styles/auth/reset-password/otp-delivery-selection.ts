import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const optDeliverySelectionStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  headerMessage: {
    fontSize: FontSizes.base,
    marginBottom: 24,
  },
  cardContainer: {
    backgroundColor: Colors.aegeanBlue01,
    borderRadius: 8,
    padding: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 8,
    backgroundColor: Colors.neutral01,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
  },
  textWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSizes.base,
  },
  cardDescription: {
    fontSize: FontSizes.medium,
    marginTop: 4,
  },
});