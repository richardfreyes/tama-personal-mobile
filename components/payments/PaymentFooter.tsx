import { paymentFooterStyles as styles } from '@/styles/components/payments/PaymentFooter';
import type { PaymentFooterProps } from '@/types';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';

export default function PaymentFooter({
  label,
  isLabelError = false,
  total,
  isConfirmDisabled,
  isConfirming,
  onConfirm,
}: PaymentFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]} testID="payment-footer">
      <View style={styles.summary}>
        <AppText numberOfLines={1} style={[styles.label, isLabelError && styles.labelError]}>{label}</AppText>
        <AppText numberOfLines={1} weight="600" style={styles.total}>{total}</AppText>
      </View>
      <AppButton
        disabled={isConfirmDisabled}
        isLoading={isConfirming}
        onPress={onConfirm}
        title="Confirm"
        variant="gradient"
      />
    </View>
  );
}
