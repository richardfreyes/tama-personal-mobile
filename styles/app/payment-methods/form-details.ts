import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const formDetailsStyles = StyleSheet.create({
  outerContainer: {
    backgroundColor: Colors.neutral01,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.neutral03,
  },
  logosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 4,
    marginBottom: 24,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.10)',
    borderWidth: 1,
    borderColor: Colors.neutral03,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.small,
    lineHeight: 20,
  },
  infoIcon: {
    marginRight: 16,
    tintColor: Colors.neutral06,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  
  },
  finalCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FontSizes.small,
    lineHeight: 20,
    marginLeft: 5,
  },
  saveHint: {
    color: Colors.neutral08,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 4,
  },
});