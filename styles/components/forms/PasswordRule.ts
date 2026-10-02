import { StyleSheet } from "react-native";
import { FontSizes } from "../../common/typography";

export const passwordRuleStyles = StyleSheet.create({
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ruleIcon: {
    marginTop: 3,
    marginRight: 12,
    flexShrink: 0,
  },
  ruleText: {
    flex: 1,
    fontSize: FontSizes.small,
    lineHeight: 20,
  },
});