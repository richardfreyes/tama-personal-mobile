import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import PaymentMethodCardComponent from '@/components/payments/PaymentMethodCardComponent';
import { COMMON } from '@/constants/common';
import { globalStyle } from '@/styles/common/globals';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function OneTimePaymentMethodsScreen() {
  const { billingReferenceId, baseAmount, baseCurrency, returnTo, returnAmount } = useLocalSearchParams<{
    billingReferenceId?: string;
    baseAmount?: string;
    baseCurrency?: string;
    returnTo?: string;
    returnAmount?: string;
  }>();

  const handleSelect = (title: string) => {
    if (title === 'Philippine Banks') {
      router.push({
        pathname: '/payment-methods/direct-debit',
        params: { returnTo, billingReferenceId, returnAmount },
      });
      return;
    }
    if (title === 'QRPH') {
      router.push({
        pathname: '/payment-methods/qrph',
        params: {
          returnTo,
          billingReferenceId,
          baseAmount: baseAmount || returnAmount,
          baseCurrency: baseCurrency || 'PHP',
        },
      });
      return;
    }
    if (title === 'PayPal') {
      router.push({
        pathname: '/payment-methods/paypal',
        params: {
          returnTo,
          billingReferenceId,
          baseAmount: baseAmount || returnAmount,
          baseCurrency: baseCurrency || 'PHP',
        },
      });
      return;
    }
    router.push({
      pathname: '/payment-methods/form-details',
      params: {
        apiEnv: 'one-time',
        methodTitle: title,
        billingReferenceId,
        baseAmount,
        baseCurrency,
      },
    });
  };

  return (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <NavHeaderComponent title='Payment Methods' />
      <View style={{ flex: 1 }}>
        <View style={ globalStyle.outerContainer }>
          {COMMON.PAYMENT_OPTIONS.map((option, idx) => {
            // Credit/debit card and Philippine bank direct debit for one-time payments.
            const isDirectDebit = option.title === 'Philippine Banks';
            const isQrph = option.title === 'QRPH';
            const isPayPal = option.title === 'PayPal';
            if (idx !== 0 && !isDirectDebit && !isQrph && !isPayPal) return null;
            return (
              <PaymentMethodCardComponent
                key={option.id}
                option={option}
                onPress={() => handleSelect(option.title)}
              />
            );
          })}
          </View>
      </View>
      <SpacerComponent height={100} />
    </GlobalScrollView>
  );
};
