import { AppText } from '@/components/common/AppText';
import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import { directDebitBankOptionStyles as styles } from '@/styles/components/payments/DirectDebitBankOption';
import type { DirectDebitBankOptionProps } from '@/types/common';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function DirectDebitBankOption({ label, icon: Icon, onPress, disabled }: DirectDebitBankOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Link ${label}`}
    >
      <View style={styles.left}>
        <Icon width={40} height={40} style={styles.icon} />
        <AppText style={styles.label} numberOfLines={2} ellipsizeMode="tail">
          {label}
        </AppText>
      </View>
      <View style={styles.chevron}>
        <ChevronRightIcon width={20} height={20} />
      </View>
    </TouchableOpacity>
  );
}
