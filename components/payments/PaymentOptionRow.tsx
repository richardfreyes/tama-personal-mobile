import { paymentOptionRowStyles as styles } from '@/styles/components/payments/PaymentOptionRow';
import type { PaymentOptionRowProps } from '@/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '../common/AppText';

export default function PaymentOptionRow({
  leading,
  title,
  subtitle,
  isSubtitleNumeric = false,
  badge,
  selected,
  size = 'standard',
  isLast = false,
  onPress,
  testID,
}: PaymentOptionRowProps) {
  return (
    <Pressable
      accessibilityLabel={[title, subtitle, badge].filter(Boolean).join(', ')}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, size === 'tall' && styles.tallRow, !isLast && styles.divider, pressed && styles.rowPressed]}
      testID={testID}
    >
      {leading}
      <View style={styles.copy}>
        <AppText weight="500" style={styles.title}>{title}</AppText>
        {subtitle ? (
          <AppText style={[styles.subtitle, isSubtitleNumeric && styles.subtitleNumeric]}>{subtitle}</AppText>
        ) : null}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <AppText weight="500" style={styles.badgeText}>{badge}</AppText>
        </View>
      ) : null}
      <View style={[styles.radio, selected ? styles.radioSelected : styles.radioIdle]} testID={testID ? `${testID}-radio` : undefined} />
    </Pressable>
  );
}
