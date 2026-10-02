import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const legalStyles = StyleSheet.create({
  screenContainer: {
    justifyContent: 'flex-start',
  },
  contentCard: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  updatedAt: {
    color: Colors.neutral07,
    fontSize: FontSizes.extraSmall,
    lineHeight: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  documentTitle: {
    color: Colors.aegeanBlue10,
    fontSize: FontSizes.extraExtraLarge,
    lineHeight: 30,
    marginBottom: 18,
    textAlign: 'center',
  },
  sectionHeading: {
    color: Colors.aegeanBlue10,
    fontSize: FontSizes.medium,
    lineHeight: 22,
    marginBottom: 8,
    marginTop: 14,
  },
  subheading: {
    color: Colors.aegeanBlue10,
    fontSize: FontSizes.base,
    lineHeight: 21,
    marginBottom: 6,
    marginTop: 10,
  },
  paragraph: {
    color: Colors.neutral08,
    fontSize: FontSizes.small,
    lineHeight: 19,
    marginBottom: 10,
  },
  listLine: {
    color: Colors.neutral08,
    fontSize: FontSizes.small,
    lineHeight: 19,
    marginBottom: 8,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletMarker: {
    color: Colors.neutral08,
    fontSize: FontSizes.small,
    lineHeight: 19,
    marginRight: 8,
    width: 8,
  },
  bulletMarkerNested: {
    color: Colors.neutral07,
  },
  bulletText: {
    color: Colors.neutral08,
    flex: 1,
    fontSize: FontSizes.small,
    lineHeight: 19,
  },
  inlineLink: {
    color: Colors.aqua10,
  },
  legalTableScroll: {
    marginBottom: 12,
  },
  legalTable: {
    borderColor: Colors.neutral05,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
    overflow: 'hidden',
  },
  legalTableRow: {
    borderBottomColor: Colors.neutral05,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  legalTableRowLast: {
    borderBottomWidth: 0,
  },
  legalTableHeaderRow: {
    backgroundColor: Colors.aegeanBlue01,
  },
  legalTableCell: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  legalTableCellBorder: {
    borderRightColor: Colors.neutral05,
    borderRightWidth: 1,
  },
  legalTableHeaderText: {
    color: Colors.aegeanBlue10,
    fontSize: FontSizes.small,
    lineHeight: 18,
  },
  legalTableBodyText: {
    color: Colors.neutral08,
    fontSize: FontSizes.small,
    lineHeight: 19,
  },
  legalTableFirstColumnText: {
    color: Colors.aegeanBlue10,
  },
});
