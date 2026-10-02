import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const filterAutoPayStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.medium,
    marginBottom: 12,
  },
  scrollViewContent: {
    flex: 1,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: FontSizes.small,
    color: Colors.neutral07,
  },
  transactionTypeTitle: {
    marginBottom: 10,
  },
  resetButtonText: {
    fontSize: FontSizes.small,
    color: Colors.aqua10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: FontSizes.small,
    color: Colors.neutral08,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
