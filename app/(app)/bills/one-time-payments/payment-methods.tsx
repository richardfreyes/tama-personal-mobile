import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import PaymentMethodCardComponent from '@/components/payments/PaymentMethodCardComponent';
import { COMMON } from '@/constants/common';
import { openOneTimePaymentMethod } from '@/services/routeNavigation';
import { globalStyle } from '@/styles/common/globals';
import { useLocalSearchParams } from 'expo-router';
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
    openOneTimePaymentMethod({ title, billingReferenceId, baseAmount, baseCurrency, returnTo, returnAmount });
  };

  return (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <NavHeaderComponent title='Payment Methods' />
      <View style={{ flex: 1 }}>
        <View style={ globalStyle.outerContainer }>
          {COMMON.PAYMENT_OPTIONS.map((option, idx) => {

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
