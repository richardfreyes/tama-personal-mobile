import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const paymentMethodsComponentStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    minHeight: 58,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: Colors.red01,
  },
  brandTile: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 6,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  methodDetails: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  methodName: {
    color: Colors.maroon11,
    fontSize: 14,
    lineHeight: 20,
  },
  lastFour: {
    color: Colors.maroon09,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.26,
    lineHeight: 18,
  },
  defaultBadge: {
    alignItems: 'center',
    backgroundColor: Colors.success01,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    height: 22,
    paddingHorizontal: 8,
  },
  defaultDot: {
    backgroundColor: Colors.success09,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  defaultText: {
    color: Colors.dashboardSuccessText,
    fontSize: 12,
    lineHeight: 18,
  },
  divider: {
    backgroundColor: Colors.dashboardSkeleton,
    height: 1,
    marginLeft: 58,
  },
  skeletonDetails: {
    flex: 1,
    gap: 8,
  },
  addButton: {
    marginTop: 12,
  },

  picker: {
    gap: 12,
  },

  pickerCard: {
    paddingVertical: 0,
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    height: 56,
  },
  addTile: {
    alignItems: 'center',
    borderColor: Colors.outlineMuted,
    borderRadius: 6,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    height: 30,
    justifyContent: 'center',
    width: 44,
  },
  addRowText: {
    color: Colors.red09,
    fontSize: 14,
    lineHeight: 20,
  },
});
