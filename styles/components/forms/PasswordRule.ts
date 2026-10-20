import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createPasswordRuleStyles = (Colors: ThemeColors) => StyleSheet.create({
  ruleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  ruleIcon: {
    flexShrink: 0,
    marginTop: 0,
  },
  ruleText: {
    color: Colors.textSecondary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  ruleTextValid: {
    color: Colors.successText,
  },
});

export const passwordRuleStyles = createPasswordRuleStyles(LightColors);
