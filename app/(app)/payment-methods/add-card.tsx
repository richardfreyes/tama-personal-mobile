import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import PaymentMethodCardComponent from '@/components/payments/PaymentMethodCardComponent';
import { COMMON } from '@/constants/common';
import { globalStyle } from '@/styles/common/globals';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

const AddCard = () => {
  const { returnTo, billingReferenceId, returnAmount } = useLocalSearchParams<{ returnTo?: string, billingReferenceId?: string, returnAmount?: string }>();

  const handleSelect = (title: string) => {
    router.push({
      pathname: '/payment-methods/form-details',
      params: { methodTitle: title, returnTo, billingReferenceId, returnAmount },
    });
  };

  return (
    <ScrollView contentContainerStyle={globalStyle.screenContainer}>
      <NavHeaderComponent title='Payment Methods' />
      <View style={{ flex: 1 }}>
        <View style={ globalStyle.outerContainer }>
          {COMMON.PAYMENT_OPTIONS.map((option, idx) => {
            // credit/debit card only
            if (idx !== 0) return null;
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
    </ScrollView>
  );
};

export default AddCard;