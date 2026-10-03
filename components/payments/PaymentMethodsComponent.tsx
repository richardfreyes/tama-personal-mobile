import { PAYMENT_METHOD_SKELETON_COUNT } from '@/constants';
import { useGetPaymentMethodsQuery } from '@/redux/features/paymentMethods/paymentMethodApi';
import { openPaymentMethod } from '@/services/routeNavigation';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { paymentMethodsComponentStyles as styles } from '@/styles/components/payments/PaymentMethodsComponent';
import { ComponentsProps, PaymentMethodRowProps } from '@/types';
import { formatLastFourDigits, getCardIcon, getProviderDisplay, getSavedPaymentMethods } from '@/utils/card';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';
import EmptyStateCard from '../common/EmptyStateCard';
import { SkeletonBlock, SkeletonGroup } from '../common/Loading';
import { SectionHeaderComponent } from '../common/SectionHeaderComponent';

const PaymentMethodRow = ({ method, route }: PaymentMethodRowProps) => {
  const provider = getProviderDisplay(method.paymentMethodProvider);
  const lastFour = formatLastFourDigits(method.lastFourCardDigits);
  const CardLogo = getCardIcon(method.paymentMethodProvider).uri;

  return (
    <Pressable
      accessibilityHint="Opens this payment method"
      accessibilityLabel={`${provider} ending in ${lastFour}${method.isPrimary ? ', Default' : ''}`}
      accessibilityRole="button"
      onPress={() => openPaymentMethod(method.referenceId, route)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      testID={`payment-method-${method.referenceId}`}
    >
      <View style={styles.brandTile}>
        <CardLogo height={26} width={40} />
      </View>
      <View style={styles.methodDetails}>
        <AppText numberOfLines={1} weight="500" style={styles.methodName}>{provider}</AppText>
        <AppText numberOfLines={1} style={styles.lastFour}>•••• {lastFour}</AppText>
      </View>
      {method.isPrimary ? (
        <View style={styles.defaultBadge}>
          <View style={styles.defaultDot} />
          <AppText weight="500" style={styles.defaultText}>Default</AppText>
        </View>
      ) : null}
    </Pressable>
  );
};

export default function PaymentMethodsComponent({
  sectionHeader,
  sectionFooter,
  route,
  onAddPaymentMethod,
  isRefreshable = true,
}: ComponentsProps) {
  const { data, isLoading, isFetching, isError, refetch } = useGetPaymentMethodsQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const methods = getSavedPaymentMethods(data);
  const isPaymentMethodsEmpty = methods.length === 0;
  const showAddButton = !isError && sectionFooter?.button !== false;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetch]);

  if (isLoading || (isError && isFetching)) {
    return (
      <View style={globalStyle.sectionPanel}>
        <SectionHeaderComponent title={sectionHeader?.title} />
        <SkeletonGroup label="Loading payment methods" style={globalStyle.listCard} testID="payment-methods-loading">
          {Array.from({ length: PAYMENT_METHOD_SKELETON_COUNT }, (_, index) => (
            <React.Fragment key={index}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <SkeletonBlock borderRadius={6} height={30} style={globalStyle.skeletonOnCard} width={44} />
                <View style={styles.skeletonDetails}>
                  <SkeletonBlock height={12} style={globalStyle.skeletonOnCard} width="36%" />
                  <SkeletonBlock height={10} style={globalStyle.skeletonOnCard} width="48%" />
                </View>
              </View>
            </React.Fragment>
          ))}
        </SkeletonGroup>
      </View>
    );
  }

  const content = isError ? (
    <EmptyStateCard
      message="Unable to load payment methods."
      onRetry={() => { void refetch(); }}
      retryLabel="Try loading payment methods again"
      variant="error"
    />
  ) : isPaymentMethodsEmpty ? (
    <EmptyStateCard
      icon="credit-card"
      message="Cards you save for paying bills will appear here."
      title="No payment methods yet"
      variant="empty"
    />
  ) : (
    <View style={globalStyle.listCard}>
      {methods.map((method, index) => (
        <React.Fragment key={method.referenceId}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <PaymentMethodRow method={method} route={route} />
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <View style={globalStyle.sectionPanel}>
      <SectionHeaderComponent
        title={sectionHeader?.title}
        linkText={isPaymentMethodsEmpty ? null : sectionHeader?.linkText}
        onViewAllPress={() => router.push('/payment-methods')}
      />
      {isRefreshable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.red10}
              colors={[Colors.red10]}
            />
          }
        >
          {content}
        </ScrollView>
      ) : content}
      {showAddButton ? (
        <AppButton
          title="Add Payment Method"
          variant="secondary"
          buttonStyle={styles.addButton}
          onPress={onAddPaymentMethod}
          route={onAddPaymentMethod ? undefined : '/payment-methods/add-card'}
        />
      ) : null}
    </View>
  );
}
