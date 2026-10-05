import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { SkeletonBlock } from '@/components/common/Loading';
import { BRAND_ACTION_GRADIENT_COLORS, BRAND_ACTION_GRADIENT_LOCATIONS, BRAND_SOFT_GRADIENT_COLORS, DASHBOARD_BILL_CAROUSEL_GAP, DASHBOARD_BILL_PAGE_INSET, GRADIENT_DIAGONAL_END, GRADIENT_DIAGONAL_START, GRADIENT_HORIZONTAL_END, GRADIENT_HORIZONTAL_START, } from '@/constants';
import { useGetMonthlyBillsEnrollmentsQuery } from '@/redux/features/enrollments/enrollmentApi';
import { setSelectedEnrollment } from '@/redux/features/enrollmentSelection/enrollmentSelectionSlice';
import { useAppDispatch } from '@/redux/hooks';
import { openAddBiller } from '@/services/routeNavigation';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { monthlyBillsStyles as styles } from '@/styles/components/enrollments/MonthlyBills';
import type { UpcomingEnrollmentBill } from '@/types/bill';
import { getIndicatorSlots, getNearestBillIndexForSlot } from '@/utils/monthlyBillIndicators';
import { getUpcomingBillsForMonth } from '@/utils/upcomingBills';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, type LayoutChangeEvent, type ListRenderItemInfo, type NativeScrollEvent, type NativeSyntheticEvent, Platform, Pressable, View, useWindowDimensions } from 'react-native';
import UpcomingBillCard from './UpcomingBillCard';

const MonthlyBillsSkeleton = () => (
  <View
    accessibilityLabel="Loading upcoming bills"
    accessibilityLiveRegion="polite"
    accessibilityRole="progressbar"
    accessibilityState={{ busy: true }}
    style={styles.loadingCard}
    testID="monthly-bills-loading"
  >
    <View style={styles.loadingHeadingRow}>
      <View style={styles.loadingHeadingColumn}>
        <SkeletonBlock borderRadius={5} height={10} style={globalStyle.skeletonOnCard} width={92} />
        <SkeletonBlock borderRadius={7} height={14} style={globalStyle.skeletonOnCard} width={140} />
      </View>
      <SkeletonBlock borderRadius={12} height={24} style={globalStyle.skeletonOnCard} width={88} />
    </View>
    <View style={styles.loadingAmountColumn}>
      <SkeletonBlock borderRadius={10} height={38} style={globalStyle.skeletonOnCard} width={210} />
      <SkeletonBlock borderRadius={5} height={10} style={globalStyle.skeletonOnCard} width={128} />
    </View>
    <SkeletonBlock borderRadius={14} height={48} style={globalStyle.skeletonOnCard} />
  </View>
);

export const MonthlyBillsComponent = () => {
  const dispatch = useAppDispatch();
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(windowWidth);
  const listRef = useRef<FlatList<UpcomingEnrollmentBill>>(null);
  const { data, isError, isLoading, isFetching, refetch } = useGetMonthlyBillsEnrollmentsQuery();
  const upcomingBills = useMemo(
    () => getUpcomingBillsForMonth(data?.items || []),
    [data?.items],
  );
  const hasEnrollments = (data?.items.length ?? 0) > 0;
  const indicatorSlots = useMemo(
    () => getIndicatorSlots(upcomingBills.length),
    [upcomingBills.length],
  );
  const pageWidth = Math.max(containerWidth - DASHBOARD_BILL_PAGE_INSET * 2, 1);
  const pageStride = pageWidth + DASHBOARD_BILL_CAROUSEL_GAP;

  useEffect(() => {
    setActiveIndex((previousIndex) => Math.min(previousIndex, Math.max(upcomingBills.length - 1, 0)));
  }, [upcomingBills.length]);

  const handleBillPress = useCallback((bill: UpcomingEnrollmentBill) => {
    dispatch(setSelectedEnrollment(bill.enrollment));
    router.push({
      pathname: '/(app)/bills/enrollments/details',
      params: {
        enrollmentId: bill.enrollment.referenceId || bill.enrollment.transactionId || bill.key,
      },
    });
  }, [dispatch]);

  const handleEnrollAutoDebit = useCallback(() => {
    router.push('/(app)/bills/enrollments');
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth <= 0 || nextWidth === containerWidth) return;

    setContainerWidth(nextWidth);
    const nextStride = Math.max(nextWidth - DASHBOARD_BILL_PAGE_INSET * 2, 1) + DASHBOARD_BILL_CAROUSEL_GAP;
    listRef.current?.scrollToOffset({ animated: false, offset: activeIndex * nextStride });
  }, [activeIndex, containerWidth]);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.max(0, Math.min(
      upcomingBills.length - 1,
      Math.round(event.nativeEvent.contentOffset.x / pageStride),
    )));
  }, [pageStride, upcomingBills.length]);

  const handleIndicatorPress = useCallback((slotIndex: number) => {
    const billIndex = getNearestBillIndexForSlot(
      slotIndex,
      activeIndex,
      upcomingBills.length,
    );
    setActiveIndex(billIndex);
    listRef.current?.scrollToOffset({
      animated: true,
      offset: billIndex * pageStride,
    });
  }, [activeIndex, pageStride, upcomingBills.length]);

  const renderBill = useCallback(({ item, index }: ListRenderItemInfo<UpcomingEnrollmentBill>) => (
    <UpcomingBillCard
      bill={item}
      index={index}
      onEnroll={handleEnrollAutoDebit}
      onPress={handleBillPress}
      pageWidth={pageWidth}
    />
  ), [handleBillPress, handleEnrollAutoDebit, pageWidth]);

  const renderIndicators = () => {
    if (upcomingBills.length <= 1) return null;

    return (
      <View style={styles.indicatorContainer}>
        <View accessibilityRole="tablist" style={styles.indicatorTrack} testID="monthly-bill-indicator-track">
          {indicatorSlots.map((slotIndex) => {
            const isActive = slotIndex === activeIndex % indicatorSlots.length;
            const targetBillIndex = getNearestBillIndexForSlot(
              slotIndex,
              activeIndex,
              upcomingBills.length,
            );

            return (
              <Pressable
                accessibilityLabel={`Bill ${targetBillIndex + 1} of ${upcomingBills.length}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                key={slotIndex}
                onPress={() => handleIndicatorPress(slotIndex)}
                style={[styles.indicatorSlot, isActive && styles.indicatorSlotActive]}
                testID={`monthly-bill-indicator-${slotIndex}`}
              >
                {isActive ? (
                  <View style={styles.monthlyIndicatorActive} testID={`monthly-bill-indicator-active-${slotIndex}`}>
                    <LinearGradient
                      colors={BRAND_ACTION_GRADIENT_COLORS}
                      locations={BRAND_ACTION_GRADIENT_LOCATIONS}
                      start={GRADIENT_HORIZONTAL_START}
                      end={GRADIENT_HORIZONTAL_END}
                      style={styles.indicatorGradient}
                    />
                  </View>
                ) : <View style={styles.monthlyIndicatorInactive} />}
              </Pressable>
            );
          })}
        </View>
        <AppText
          accessibilityLabel={`Bill ${activeIndex + 1} of ${upcomingBills.length}`}
          weight="500"
          style={styles.indicatorCount}
          testID="monthly-bill-indicator-count"
        >
          {activeIndex + 1} / {upcomingBills.length}
        </AppText>
      </View>
    );
  };

  if (isLoading || (isError && isFetching)) return <MonthlyBillsSkeleton />;

  if (isError) {
    return (
      <EmptyStateCard
        message="Unable to load upcoming bills."
        onRetry={() => { void refetch(); }}
        retryLabel="Try loading upcoming bills again"
        variant="error"
      />
    );
  }

  if (upcomingBills.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <LinearGradient colors={BRAND_SOFT_GRADIENT_COLORS} start={GRADIENT_DIAGONAL_START} end={GRADIENT_DIAGONAL_END} style={styles.emptyIcon}>
          <Feather name="file-text" size={24} color={Colors.red09} />
        </LinearGradient>
        <View style={styles.emptyCopy}>
          <AppText weight="600" style={styles.emptyTitle}>
            {hasEnrollments ? 'No upcoming bills' : 'No bills yet'}
          </AppText>
          <AppText style={styles.emptySubtitle}>
            {hasEnrollments
              ? 'Your next scheduled bill will appear here when available.'
              : 'Add your first biller to quickly manage and pay your bills from TamaPay.'}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={openAddBiller}
          style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
        >
          <LinearGradient colors={BRAND_ACTION_GRADIENT_COLORS} locations={BRAND_ACTION_GRADIENT_LOCATIONS} start={GRADIENT_HORIZONTAL_START} end={GRADIENT_HORIZONTAL_END} style={styles.emptyButtonGradient}>
            <Feather name="plus" size={18} color={Colors.neutral01} />
            <AppText weight="600" style={styles.emptyButtonText}>Add Biller</AppText>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View onLayout={handleLayout} style={styles.carouselViewport}>
        <FlatList
          contentContainerStyle={styles.carouselContent}
          data={upcomingBills}
          decelerationRate="fast"
          disableIntervalMomentum
          getItemLayout={(_, index) => ({ index, length: pageStride, offset: pageStride * index })}
          horizontal
          initialNumToRender={2}
          keyExtractor={(item) => item.key}
          maxToRenderPerBatch={3}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          pagingEnabled
          ref={listRef}
          removeClippedSubviews={Platform.OS !== 'web'}
          renderItem={renderBill}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={pageStride}
          style={styles.carousel}
          testID="monthly-bills-carousel"
          windowSize={3}
        />
      </View>
      {renderIndicators()}
    </View>
  );
};
