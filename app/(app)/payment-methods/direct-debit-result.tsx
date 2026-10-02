import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { DIRECT_DEBIT_RESULT_COPY } from '@/constants/directDebit';
import { globalStyle } from '@/styles/common/globals';
import { DirectDebitOutcome } from '@/types/common';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

const DirectDebitResult = () => {
  const { outcome, returnTo, billingReferenceId, returnAmount } = useLocalSearchParams<{
    outcome?: string;
    returnTo?: string;
    billingReferenceId?: string;
    returnAmount?: string;
  }>();
  const status: DirectDebitOutcome = outcome === 'success' ? 'success' : outcome === 'cancelled' ? 'cancelled' : 'failure';
  const copy = DIRECT_DEBIT_RESULT_COPY[status];
  const isOneTimeContext = !!billingReferenceId;

  const handlePrimary = () => {
    if (isOneTimeContext) {
      router.replace({
        pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
        params: { billingReferenceId: billingReferenceId as string, ...(returnAmount ? { amount: returnAmount } : {}) },
      });
      return;
    }
    router.replace('/payment-methods');
  };

  const handleTryAgain = () => {
    router.replace({
      pathname: '/payment-methods/direct-debit',
      params: { returnTo, billingReferenceId, returnAmount },
    });
  };

  return (
    <ScrollView contentContainerStyle={globalStyle.screenContainer}>
      <NavHeaderComponent title="Payment Methods" />
      <View style={globalStyle.outerContainer}>
        <AppText size="medium" color="aegeanBlue10" weight="700" mBottom={8}>{copy.title}</AppText>
        <AppText mBottom={24}>{copy.message}</AppText>

        <AppButton
          title={isOneTimeContext ? 'Back to Bill' : 'Back to Payment Methods'}
          variant="primary"
          onPress={handlePrimary}
        />

        {status !== 'success' && (
          <>
            <SpacerComponent height={12} />
            <AppButton title="Try Again" variant="secondary" onPress={handleTryAgain} />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default DirectDebitResult;
