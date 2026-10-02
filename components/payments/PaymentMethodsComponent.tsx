import { useGetPaymentMethodsQuery } from '@/redux/features/paymentMethods/paymentMethodApi';
import type { PaymentMethod } from '@/redux/features/paymentMethods/paymentMethodTypes';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { paymentMethodsComponentStyles as styles } from '@/styles/components/payments/PaymentMethodsComponent';
import { ComponentsProps } from '@/types';
import { formatLastFourDigits, getCardIcon, getProviderDisplay } from '@/utils/card';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';
import EmptyStateCard from '../common/EmptyStateCard';
import { PaymentMethodListSkeleton } from '../common/Loading';
import { SectionHeaderComponent } from '../common/SectionHeaderComponent';

export default function PaymentMethodsComponent({ sectionHeader, route, onAddPaymentMethod }: ComponentsProps) {
  const { data, isLoading, isError, refetch } = useGetPaymentMethodsQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Direct debit is a one-time-payment-only method offered inside the pay flow, so it
  // is never presented in the saved payment methods list.
  const methods = data?.filter((method) => method.paymentMethodName !== 'directdebit');
  const isPaymentMethodsEmpty = !methods || methods.length === 0;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetch]);

  if (isLoading) {
    return (
      <View style={globalStyle.outerContainer}>
        <SectionHeaderComponent title={sectionHeader?.title} />
        <PaymentMethodListSkeleton rows={3} label="Loading payment methods" />
      </View>
    );
  }

  const handleViewAllPress = () => {
    router.push('/payment-methods');
  }

  const handlePaymentMethodPress = (data: PaymentMethod) => {
    router.push(
      {
        pathname: '/payment-methods/update-card',
        params: {
          referenceId: data.referenceId,
          ...(route ? { route } : {}),
        },
      },
      { dangerouslySingular: true },
    );
  }

  return (
    <View>
      <View style={globalStyle.outerContainer}>
        <SectionHeaderComponent title={sectionHeader?.title} linkText={isPaymentMethodsEmpty ? null : sectionHeader?.linkText} onViewAllPress={handleViewAllPress} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isPaymentMethodsEmpty ? { paddingVertical: 12, } : null}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.red10}
              colors={[Colors.red10]}
            />
          }
        >
          { isError ? (
            <EmptyStateCard
              variant="error"
              message="Unable to load payment methods at the moment. Please try again later."
            />
          ) :
          isPaymentMethodsEmpty ? (
            <EmptyStateCard
              variant='empty'
              message="No payment methods added yet. Add one to start making payments."
            />
          ) : (
            methods?.map((method) => {
              const provider = method.paymentMethodProvider;
              const providerDisplay = getProviderDisplay(method.paymentMethodProvider);
              const lastFour = method.lastFourCardDigits;
              const maskedNumber = `••••  ••••  ••••  ${formatLastFourDigits(lastFour)}`;
              const { uri: IconComponent } = getCardIcon(provider);

              return (
                <TouchableOpacity key={method.referenceId} style={styles.cardContainer} onPress={() => handlePaymentMethodPress(method)}>
                  <View style={styles.detailsContainer}>
                    <IconComponent width={46} height={30} style={styles.cardIcon} />
                    <View>
                      <AppText style={styles.cardName}>{providerDisplay}</AppText>
                      <AppText style={styles.cardNumber}>{maskedNumber}</AppText>
                    </View>
                  </View>

                  {method.isPrimary && (
                    <View style={styles.defaultTag}>
                      <AppText style={styles.defaultText}>Default</AppText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
        { !isError ? (
          onAddPaymentMethod
            ? <AppButton title="Add Payment Method" variant="secondary" onPress={onAddPaymentMethod}/>
            : <AppButton title="Add Payment Method" variant="secondary" route='/payment-methods/add-card'/>
        ) : null }
      </View>
    </View>
  );
};
