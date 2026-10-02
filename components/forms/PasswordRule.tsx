import IconCheck from '@/assets/icons/check-circle.svg';
import { Colors } from '@/styles/common/colors';
import { passwordRuleStyles as styles } from '@/styles/components/forms/PasswordRule';
import { PasswordRuleProps } from '@/types';
import React from 'react';
import { View } from 'react-native';
import { AppText } from '../common/AppText';

const PasswordRule: React.FC<PasswordRuleProps> = ({ text, valid }) => (
  <View style={styles.ruleRow}>
    <View>
      <IconCheck 
        style={styles.ruleIcon} 
        width={16} 
        height={16}
        fill={valid ? Colors.success09 : Colors.neutral03}
      />
    </View>
    <AppText weight='300' style={styles.ruleText}>{text}</AppText>
  </View>
);

export default PasswordRule;