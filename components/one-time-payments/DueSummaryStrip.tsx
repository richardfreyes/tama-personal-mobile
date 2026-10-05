import { BRAND_SOFT_GRADIENT_COLORS, GRADIENT_HORIZONTAL_END, GRADIENT_HORIZONTAL_START } from '@/constants/gradients';
import { Colors } from '@/styles/common/colors';
import { dueSummaryStripStyles as styles } from '@/styles/components/one-time-payments/DueSummaryStrip';
import type { DueSummaryStripProps } from '@/types';
import { formatPesoAmount } from '@/utils/format';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';
import { AppText } from '../common/AppText';

export default function DueSummaryStrip({ summary }: DueSummaryStripProps) {
  const { billCount, overdueCount, total, knownAmountCount, hasUnknownAmounts, next } = summary;
  const label = `${billCount} ${billCount === 1 ? 'bill' : 'bills'} to pay${overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}`;
  const nextLabel = next ? `Next: ${next.nickname}, ${next.dueDateLabel}` : '';
  let totalLabel = formatPesoAmount(total);
  if (hasUnknownAmounts) {
    totalLabel = knownAmountCount > 0 ? `${totalLabel}+` : 'Amount not saved';
  }

  return (
    <LinearGradient
      accessibilityLabel={[label, totalLabel, nextLabel].filter(Boolean).join('. ')}
      accessible
      colors={BRAND_SOFT_GRADIENT_COLORS}
      end={GRADIENT_HORIZONTAL_END}
      start={GRADIENT_HORIZONTAL_START}
      style={styles.strip}
      testID="due-summary-strip"
    >
      <View style={styles.iconTile}>
        <Feather color={Colors.red09} name="calendar" size={20} />
      </View>
      <View style={styles.copy}>
        <AppText style={styles.label}>{label}</AppText>
        <AppText
          numberOfLines={1}
          weight="600"
          style={[styles.total, knownAmountCount === 0 && hasUnknownAmounts && styles.noAmount]}
        >
          {totalLabel}
        </AppText>
      </View>
      {nextLabel ? <AppText style={styles.next}>{nextLabel}</AppText> : null}
    </LinearGradient>
  );
}
