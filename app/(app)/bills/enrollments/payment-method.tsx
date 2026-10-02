import EmptyStateCard from '@/components/common/EmptyStateCard';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import PaymentMethodCardComponent from '@/components/payments/PaymentMethodCardComponent';
import { COMMON } from '@/constants/common';
import { selectEnrollmentReview } from '@/redux/features/enrollments/review/reviewSlice';
import { useAppSelector } from '@/redux/hooks';
import { globalStyle } from '@/styles/common/globals';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';

const PaymentMethod = () => {
  const { transactionResponse } = useAppSelector(selectEnrollmentReview);
  const merchantId = transactionResponse?.merchantId || '';
  const merchantName = transactionResponse?.merchantName || '';

  const handleBack = useCallback(() => {
    if (!merchantId) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.navigate('/bills/enrollments');
      }
      return;
    }

    router.navigate({
      pathname: '/(app)/bills/enrollments/form',
      params: { merchantId, merchantName },
    });
  }, [merchantId, merchantName]);

  const handleSelect = (title: string) => {
    router.push({
      pathname: '/payment-methods/form-details',
      params: { methodTitle: title, apiEnv: 'enrollments' },
    });
  };

  if (!transactionResponse) {
    return (
      <ScrollView contentContainerStyle={globalStyle.screenContainer}>
        <NavHeaderComponent title='Payment Methods' />
        <View style={globalStyle.outerContainer}>
          <EmptyStateCard
            variant="error"
            message="No transaction found. Please go back and try again."
          />
        </View>
        <SpacerComponent height={100} />
      </ScrollView>
    );
  }

  return (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <NavHeaderComponent title='Payment Methods' onBackPress={handleBack} />
      <View style={{ flex: 1 }}>
        <View style={globalStyle.outerContainer}>
          { COMMON.PAYMENT_OPTIONS.map((option, idx) => {
            // credit/debit card only
            if (idx !== 0) return; 
            const isLast = idx === COMMON.PAYMENT_OPTIONS.length - 1;
            return (
              <PaymentMethodCardComponent
                key={option.id}
                option={option}
                onPress={() => handleSelect(option.title)}
                // style={!isLast ? { marginBottom: 12 } : undefined}
              />
            );
          })}
        </View>
      </View>
      <SpacerComponent height={100} />
    </GlobalScrollView>
  );
};

export default PaymentMethod;
