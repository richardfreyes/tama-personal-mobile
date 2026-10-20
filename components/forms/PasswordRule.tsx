import { useThemeColors, useThemedStyles } from '@/hooks/useAppTheme';
import IconCheck from '@/assets/icons/check-circle.svg';
import { createPasswordRuleStyles as makeStyles } from '@/styles/components/forms/PasswordRule';
import { PasswordRuleProps } from '@/types';
import React from 'react';
import { View } from 'react-native';
import { AppText } from '../common/AppText';

const PasswordRule: React.FC<PasswordRuleProps> = ({ text, valid }) => {
  const Colors = useThemeColors();
  const styles = useThemedStyles(makeStyles);
  return (
  <View style={styles.ruleRow}>
    <View>
      <IconCheck 
        style={styles.ruleIcon} 
        width={16} 
        height={16}
        fill={valid ? Colors.success09 : Colors.neutral03}
      />
    </View>
    <AppText weight='400' style={[styles.ruleText, valid && styles.ruleTextValid]}>{text}</AppText>
  </View>
);
};

export default PasswordRule;