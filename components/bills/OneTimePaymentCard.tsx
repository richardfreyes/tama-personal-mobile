import { useGetBillsQuery } from '@/redux/features/bills/billsApi';
import { globalStyle } from '@/styles/common/globals';
import { oneTimePaymentCardStyles as styles } from '@/styles/components/bills/OneTimePaymentCard';
import { OneTimePaymentCardProps } from '@/types/common';
import { getActiveSavedBillCount, getSavedBillsForDisplay, shouldUseMockSavedBills } from '@/utils/savedBills';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';
import { SkeletonBlock } from '../common/Loading';
import { SectionHeaderComponent } from '../common/SectionHeaderComponent';

export default function OneTimePaymentCard({ onMakePayment }: OneTimePaymentCardProps) {
  const { data: billsData, isLoading, isError } = useGetBillsQuery({ page: 0 });
  const isUsingMock = shouldUseMockSavedBills(billsData);
  const displayBills = useMemo(() => getSavedBillsForDisplay(billsData), [billsData]);
  const activeCount = useMemo(() => getActiveSavedBillCount(displayBills), [displayBills]);

  const renderContent = () => {
    if (isLoading && !isUsingMock) {
      return (
        <View style={styles.contentBlock}>
          <SkeletonBlock width={140} height={18} testID="one-time-payment-loading" />
        </View>
      );
    }

    if (isError && !isUsingMock) {
      return (
        <View style={styles.contentBlock}>
          <AppText size="small" color="neutral07" style={styles.stateText}>
            Unable to load your saved bills right now. You can still start a payment.
          </AppText>
        </View>
      );
    }

    if (activeCount === 0) {
      return (
        <View style={styles.contentBlock}>
          <AppText size="small" color="neutral07" style={styles.stateText}>
            No saved bills yet. Start a payment to add and pay a biller.
          </AppText>
        </View>
      );
    }

    const savedLabel = `${activeCount} saved ${activeCount === 1 ? 'bill' : 'bills'}`;

    return (
      <View style={styles.contentBlock}>
        <AppText
          accessibilityRole="summary"
          accessibilityLabel={savedLabel}
          size="small"
          weight="600"
          color="neutral08"
          style={styles.statusText}
          testID="one-time-payment-summary"
        >
          {savedLabel}
        </AppText>
        <AppText size="extraSmall" color="neutral07" style={styles.subtitle}>
          Pay a saved bill or add a new biller.
        </AppText>
      </View>
    );
  };

  return (
    <View style={globalStyle.outerContainer}>
      <SectionHeaderComponent title="One Time Payment" />
      <View style={styles.card}>
        {renderContent()}
        <AppButton title="Make a One Time Payment" variant="primary" onPress={onMakePayment} />
      </View>
    </View>
  );
}
