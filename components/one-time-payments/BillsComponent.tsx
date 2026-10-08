import { BRAND_ACTION_GRADIENT_COLORS, BRAND_ACTION_GRADIENT_LOCATIONS, GRADIENT_HORIZONTAL_END, GRADIENT_HORIZONTAL_START, SAVED_BILL_CARD_SNAP_INTERVAL, SAVED_BILL_SKELETON_COUNT, } from '@/constants';
import { useAllSavedBills } from '@/hooks/useAllSavedBills';
import { useGetBillersQuery } from '@/redux/features/biller/billerApi';
import { useGetBillsQuery } from '@/redux/features/bills/billsApi';
import { openAddBiller, openSavedBill } from '@/services/routeNavigation';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { billsComponentStyles as styles } from '@/styles/components/one-time-payments/BillsComponent';
import type { BillsComponentProps } from '@/types';
import { getBillerDueSummary, getBillerLogoMap, getSavedBillIdentity, getSavedBillsForDisplay, getUniqueSavedBills, shouldUseMockSavedBills, sortSavedBillsByUrgency, } from '@/utils/savedBills';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { AppText } from '../common/AppText';
import EmptyStateCard from '../common/EmptyStateCard';
import { SavedBillersSkeleton, SkeletonBlock, SkeletonGroup } from '../common/Loading';
import { SectionHeaderComponent } from '../common/SectionHeaderComponent';
import DueSummaryStrip from './DueSummaryStrip';
import SavedBillCard from './SavedBillCard';

const BillerSkeleton = () => (
  <View accessibilityLabel="Loading saved bill" style={styles.skeletonCard}>
    <SkeletonBlock borderRadius={20} height={40} style={globalStyle.skeletonOnCard} width={40} />
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
  variant = 'panel',
}: BillsComponentProps) {
  const isPlain = variant === 'plain';
  const billsQuery = useGetBillsQuery({ page: 0 }, { skip: isPlain });
  const allSavedBills = useAllSavedBills({ skip: !isPlain });
  const billersQuery = useGetBillersQuery({});
  const isUsingMockBills = !isPlain && shouldUseMockSavedBills(billsQuery.data);
  const bills = useMemo(() => {
    const savedBills = isPlain
      ? allSavedBills.bills
      : getUniqueSavedBills(getSavedBillsForDisplay(billsQuery.data));
    return isPlain ? sortSavedBillsByUrgency(savedBills) : savedBills;
  }, [allSavedBills.bills, billsQuery.data, isPlain]);
  const dueSummary = useMemo(() => (isPlain ? getBillerDueSummary(bills) : null), [bills, isPlain]);
  const billerLogosByMerchantId = useMemo(
    () => getBillerLogoMap(billersQuery.data),
    [billersQuery.data],
  );

  const savedBillsError = isPlain ? allSavedBills.isError : billsQuery.isError;
  const savedBillsLoading = isPlain ? allSavedBills.isLoading : billsQuery.isLoading;
  const savedBillsFetching = isPlain ? allSavedBills.isFetching : billsQuery.isFetching;
  const hasError = (savedBillsError || (!isPlain && billersQuery.isError)) && !isUsingMockBills;
  const isLoading = !isUsingMockBills && (
    savedBillsLoading || (!isPlain && billersQuery.isLoading)
    || (hasError && (savedBillsFetching || (!isPlain && billersQuery.isFetching)))
  );
  const isEmpty = bills.length === 0;

  const retry = () => {
    if (isPlain) {
      void allSavedBills.refetch();
      return;
    }

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

  const renderCarousel = () => (
    <ScrollView
      contentContainerStyle={isPlain ? styles.plainCarouselContent : styles.carouselContent}
      decelerationRate="fast"
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={SAVED_BILL_CARD_SNAP_INTERVAL}
      style={isPlain ? styles.plainCarouselViewport : styles.carouselViewport}
      testID="bills-carousel"
    >
      {bills.map((bill, index) => (
        <SavedBillCard
          bill={bill}
          key={getSavedBillIdentity(bill, index)}
          logoUrl={billerLogosByMerchantId.get(bill.merchant_id)}
          onPress={openSavedBill}
          variant="card"
        />
      ))}
    </ScrollView>
  );

  if (isLoading) {
    if (isPlain) {
      return <SavedBillersSkeleton />;
    }

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

  if (isPlain) {
    return (
      <View style={styles.plainSection} testID="bills-section">
        <SectionHeaderComponent
          containerStyle={styles.plainHeader}
          count={hasError || isEmpty ? undefined : bills.length}
          linkText={hasError || isEmpty ? null : sectionHeader?.linkText}
          onViewAllPress={handleViewAllPress}
          title={sectionHeader?.title}
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
            appearance="dashed"
            icon="bookmark"
            message="Billers you save will appear here for one-tap payments."
            title="No saved billers yet"
            variant="empty"
          />
        ) : (
          <View style={styles.plainBody}>
            {dueSummary ? <DueSummaryStrip summary={dueSummary} /> : null}
            {renderCarousel()}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={globalStyle.sectionPanel} testID="bills-section">
      <SectionHeaderComponent
        title={sectionHeader?.title}
        linkText={sectionHeader?.linkText}
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
        renderCarousel()
      )}
      {!hasError && sectionFooter?.button ? renderActions() : null}
    </View>
  );
}
