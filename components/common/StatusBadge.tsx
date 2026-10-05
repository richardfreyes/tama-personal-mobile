import { statusBadgeStyles as styles } from '@/styles/components/common/StatusBadge';
import type { StatusBadgeProps } from '@/types';
import React from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';

export default function StatusBadge({
  label,
  colors,
  appearance = 'plain',
  variant = 'default',
  style,
  testID,
}: StatusBadgeProps) {
  const isBadge = appearance === 'badge';

  return (
    <View
      style={[
        isBadge ? styles.badge : styles.row,
        isBadge && variant === 'summaryCard' && styles.summaryCardBadge,
        isBadge && colors.background ? { backgroundColor: colors.background } : null,
        style,
      ]}
      testID={testID}
    >
      <View style={[styles.dot, isBadge && styles.badgeDot, { backgroundColor: colors.dot }]} />
      <AppText
        numberOfLines={1}
        size={isBadge ? (variant === 'summaryCard' ? 'extraSmall' : 'tiny') : undefined}
        weight={isBadge ? '600' : '500'}
        style={[isBadge ? styles.badgeText : styles.label, { color: colors.text }]}
      >
        {label}
      </AppText>
    </View>
  );
}
