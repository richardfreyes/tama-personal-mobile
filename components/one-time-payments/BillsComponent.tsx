import {
  BRAND_ACTION_GRADIENT_COLORS,
  BRAND_ACTION_GRADIENT_LOCATIONS,
  GRADIENT_HORIZONTAL_END,
  GRADIENT_HORIZONTAL_START,
  SAVED_BILL_CARD_SNAP_INTERVAL,
  SAVED_BILL_NO_AMOUNT_LABEL,
  SAVED_BILL_SKELETON_COUNT,
} from '@/constants';
import { useGetBillersQuery } from '@/redux/features/biller/billerApi';
import { useGetBillsQuery } from '@/redux/features/bills/billsApi';
import { openAddBiller, openSavedBill } from '@/services/routeNavigation';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { billsComponentStyles as styles } from '@/styles/components/one-time-payments/BillsComponent';
import type { BillerCardProps, BillsComponentProps } from '@/types';
import {
  formatSavedBillAmount,
  getBillerLogoMap,
  getSavedBillIdentity,
  getSavedBillInitials,
  getSavedBillsForDisplay,
  getUniqueSavedBills,
  shouldUseMockSavedBills,
} from '@/utils/savedBills';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { AppText } from '../common/AppText';
import EmptyStateCard from '../common/EmptyStateCard';
import { SkeletonBlock, SkeletonGroup } from '../common/Loading';
import MerchantLogo from '../common/MerchantLogo';
import { SectionHeaderComponent } from '../common/SectionHeaderComponent';

const BillerCard = ({ bill, logoUrl }: BillerCardProps) => {
  const amount = formatSavedBillAmount(bill);
  const hasAmount = amount !== SAVED_BILL_NO_AMOUNT_LABEL;
  const name = bill.billing_name || bill.merchant_name;

  return (
    <Pressable
      accessibilityHint="Opens this saved bill for payment"
      accessibilityLabel={`${name}, ${bill.merchant_name}, ${amount}`}
      accessibilityRole="button"
      onPress={() => openSavedBill(bill)}
      style={({ pressed }) => [styles.billerCard, pressed && styles.cardPressed]}
      testID={`biller-card-${bill.billing_reference_id || bill.billing_id}`}
    >
      <MerchantLogo initials={getSavedBillInitials(bill.merchant_name || name)} logoUrl={logoUrl} />
      <View style={styles.billerDetails}>
        <AppText numberOfLines={1} weight="600" style={styles.nickname}>{name}</AppText>
        <AppText numberOfLines={2} style={styles.merchantName}>{bill.merchant_name}</AppText>
      </View>
      <AppText
        adjustsFontSizeToFit={hasAmount}
        minimumFontScale={0.8}
        numberOfLines={1}
        weight={hasAmount ? '600' : 'regular'}
        style={hasAmount ? styles.amount : styles.noAmount}
      >
        {amount}
      </AppText>
    </Pressable>
  );
};

const BillerSkeleton = () => (
  <View accessibilityLabel="Loading saved bill" style={styles.skeletonCard}>
    <SkeletonBlock borderRadius={12} height={40} style={globalStyle.skeletonOnCard} width={40} />
    <View style={styles.skeletonDetails}>
      <SkeletonBlock height={12} style={globalStyle.skeletonOnCard} width={90} />
      <SkeletonBlock height={10} style={globalStyle.skeletonOnCard} width={110} />
    </View>
    <SkeletonBlock height={14} style={[globalStyle.skeletonOnCard, styles.skeletonAmount]} width={84} />
  </View>
);

export default function BillsComponent({
  sectionHeader,
  sectionFooter,
  onViewAllPress,
  onAddBillerPress,
  onPayNowPress,
}: BillsComponentProps) {
  const billsQuery = useGetBillsQuery({ page: 0 });
  const billersQuery = useGetBillersQuery({});
  const isUsingMockBills = shouldUseMockSavedBills(billsQuery.data);
  const bills = useMemo(
    () => getUniqueSavedBills(getSavedBillsForDisplay(billsQuery.data)),
    [billsQuery.data],
  );
  const billerLogosByMerchantId = useMemo(
    () => getBillerLogoMap(billersQuery.data),
    [billersQuery.data],
  );

  const hasError = (billsQuery.isError || billersQuery.isError) && !isUsingMockBills;
  const isLoading = !isUsingMockBills && (
    billsQuery.isLoading || billersQuery.isLoading
    || (hasError && (billsQuery.isFetching || billersQuery.isFetching))
  );
  const isEmpty = bills.length === 0;

  const retry = () => {
    void Promise.allSettled([billsQuery.refetch(), billersQuery.refetch()]);
  };

  const handleViewAllPress = () => {
    if (onViewAllPress) {
      onViewAllPress();
      return;
    }

    router.push('/bills/one-time-payments');
  };

  const handlePayNowPress = () => {
    if (onPayNowPress) {
      onPayNowPress();
      return;
    }

    router.push('/bills/one-time-payments/saved');
  };

  const renderActions = () => (
    <View style={styles.actionRow}>
      <Pressable
        accessibilityLabel="Add Biller"
        accessibilityRole="button"
        onPress={onAddBillerPress ?? openAddBiller}
        style={({ pressed }) => [styles.addBillerButton, pressed && styles.addBillerPressed]}
      >
        <Feather color={Colors.red09} name="plus" size={18} />
        <AppText weight="600" style={styles.addBillerText}>Add Biller</AppText>
      </Pressable>
      {isEmpty ? null : (
        <Pressable
          accessibilityLabel="Pay Now with a saved bill"
          accessibilityRole="button"
          onPress={handlePayNowPress}
          style={({ pressed }) => [styles.payNowButton, pressed && styles.payNowPressed]}
        >
          <LinearGradient
            colors={BRAND_ACTION_GRADIENT_COLORS}
            end={GRADIENT_HORIZONTAL_END}
            locations={BRAND_ACTION_GRADIENT_LOCATIONS}
            start={GRADIENT_HORIZONTAL_START}
            style={styles.payNowGradient}
          >
            <AppText weight="600" style={styles.payNowText}>Pay Now</AppText>
            <Feather color={Colors.neutral01} name="arrow-right" size={18} />
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={globalStyle.sectionPanel}>
        <SectionHeaderComponent title={sectionHeader?.title} />
        <SkeletonGroup label="Loading saved bills" style={styles.carouselViewport} testID="bills-loading">
          <View style={styles.carouselContent}>
            {Array.from({ length: SAVED_BILL_SKELETON_COUNT }, (_, index) => <BillerSkeleton key={index} />)}
          </View>
        </SkeletonGroup>
      </View>
    );
  }

  return (
    <View style={globalStyle.sectionPanel}>
      <SectionHeaderComponent
        title={sectionHeader?.title}
        linkText={isEmpty ? null : sectionHeader?.linkText}
        onViewAllPress={handleViewAllPress}
      />
      {hasError ? (
        <EmptyStateCard
          message="Unable to load your billers."
          onRetry={retry}
          retryLabel="Try loading your billers again"
          variant="error"
        />
      ) : isEmpty ? (
        <EmptyStateCard
          icon="file-text"
          message="Billers you add for one-time payments will show up here."
          title="No one-time payments yet"
          variant="empty"
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.carouselContent}
          decelerationRate="fast"
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SAVED_BILL_CARD_SNAP_INTERVAL}
          style={styles.carouselViewport}
        >
          {bills.map((bill, index) => (
            <BillerCard
              bill={bill}
              key={getSavedBillIdentity(bill, index)}
              logoUrl={billerLogosByMerchantId.get(bill.merchant_id)}
            />
          ))}
        </ScrollView>
      )}
      {!hasError && sectionFooter?.button ? renderActions() : null}
    </View>
  );
}
