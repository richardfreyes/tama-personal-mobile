import { feeNoticeStyles as styles } from '@/styles/components/payments/FeeNotice';
import type { FeeNoticeProps } from '@/types';
import React from 'react';
import { View } from 'react-native';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';
import { InlineLoadingIndicator } from '../common/Loading';

export default function FeeNotice({
  isCalculating,
  hasError,
  needsCardReplacement,
  fee,
  onReplaceCard,
  isReplacingCard,
}: FeeNoticeProps) {
  if (isCalculating) {
    return <InlineLoadingIndicator label="Calculating fees" style={styles.calculating} />;
  }

  if (hasError) {
    return (
      <View style={styles.errorBlock}>
        <AppText accessibilityRole="alert" style={styles.error}>
          {needsCardReplacement
            ? 'This card can no longer be used. Please remove it and add it again.'
            : 'Unable to calculate fees for this bill. Please try again later or contact support.'}
        </AppText>
        {needsCardReplacement ? (
          <AppButton
            buttonStyle={styles.replaceButton}
            isLoading={isReplacingCard}
            onPress={onReplaceCard}
            title="Replace card"
            variant="tertiary"
          />
        ) : null}
      </View>
    );
  }

  if (fee) {
    return (
      <AppText style={styles.fee}>
        You will be charged a service fee of <AppText weight="600" style={styles.feeAmount}>{fee}</AppText>
      </AppText>
    );
  }

  return null;
}
