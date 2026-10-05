import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const paymentOptionRowStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    paddingVertical: 12,
  },
  tallRow: {
    minHeight: 68,
  },
  divider: {
    borderBottomColor: Colors.dashboardSkeleton,
    borderBottomWidth: 1,
  },
  rowPressed: {
    backgroundColor: Colors.dashboardPanel,
  },
  copy: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.maroon11,
    fontSize: 14,
    lineHeight: 20,
  },
  subtitle: {
    color: Colors.maroon09,
    fontSize: 12,
    lineHeight: 17,
  },
  subtitleNumeric: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.26,
    lineHeight: 18,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: Colors.success01,
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: Colors.dashboardSuccessText,
    fontSize: 11,
    lineHeight: 16,
  },
  radio: {
    borderRadius: 11,
    flexShrink: 0,
    height: 22,
    width: 22,
  },

  radioSelected: {
    borderColor: Colors.red09,
    borderWidth: 7,
  },
  radioIdle: {
    borderColor: Colors.outlineMuted,
    borderWidth: 1.5,
  },
});
