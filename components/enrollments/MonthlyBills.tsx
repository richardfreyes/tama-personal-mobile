import BillIcon from '@/assets/icons/invoices.svg';
import { useGetMonthlyBillsEnrollmentsQuery } from '@/redux/features/enrollments/enrollmentApi';
import { setSelectedEnrollment } from '@/redux/features/enrollmentSelection/enrollmentSelectionSlice';
import { useAppDispatch } from '@/redux/hooks';
import { monthlyBillsStyles as styles } from '@/styles/components/enrollments/MonthlyBills';
import type { UpcomingEnrollmentBill } from '@/types/bill';
import { getIndicatorSlots, getNearestBillIndexForSlot } from '@/utils/monthlyBillIndicators';
import { getUpcomingBillsForMonth } from '@/utils/upcomingBills';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, type LayoutChangeEvent, type ListRenderItemInfo, type NativeScrollEvent, type NativeSyntheticEvent, Platform, Pressable, View } from 'react-native';
import { AppText } from '../common/AppText';
import { SkeletonBlock } from '../common/Loading';
import UpcomingBillCard from './UpcomingBillCard';

const MonthlyBillsSkeleton = () => (
  <View
    accessibilityLabel="Loading upcoming bills"
    accessibilityLiveRegion="polite"
    accessibilityRole="progressbar"
    accessibilityState={{ busy: true }}
    style={styles.loadingContainer}
    testID="monthly-bills-loading"
  >
    <View style={styles.loadingCard}>
      <SkeletonBlock width="42%" height={16} />
      <SkeletonBlock width="62%" height={30} borderRadius={6} />
      <SkeletonBlock width="52%" height={16} />
    </View>
    <View style={styles.loadingIndicatorRow}>
      <View style={styles.loadingIndicatorDots}>
        <SkeletonBlock width={18} height={6} borderRadius={3} />
        <SkeletonBlock width={6} height={6} borderRadius={3} />
        <SkeletonBlock width={6} height={6} borderRadius={3} />
      </View>
      <SkeletonBlock width={40} height={12} borderRadius={6} />
    </View>
  </View>
);

export const MonthlyBillsComponent = () => {
  const dispatch = useAppDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<UpcomingEnrollmentBill>>(null);
  const { data, isError, isLoading } = useGetMonthlyBillsEnrollmentsQuery();
  const upcomingBills = useMemo(
    () => getUpcomingBillsForMonth(data?.items || []),
    [data?.items],
  );
  const indicatorSlots = useMemo(
    () => getIndicatorSlots(upcomingBills.length),
    [upcomingBills.length],
  );
  const pageWidth = Math.max(containerWidth, 1);

  const handleBillPress = useCallback((bill: UpcomingEnrollmentBill) => {
    dispatch(setSelectedEnrollment(bill.enrollment));
    router.push({
      pathname: '/(app)/bills/enrollments/details',
      params: {
        enrollmentId: bill.enrollment.referenceId || bill.enrollment.transactionId || bill.key,
      },
    });
  }, [dispatch]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth <= 0 || nextWidth === containerWidth) return;

    setContainerWidth(nextWidth);
    const nextOffset = activeIndex * nextWidth;
    scrollX.setValue(nextOffset);
    listRef.current?.scrollToOffset({ animated: false, offset: nextOffset });
  }, [activeIndex, containerWidth, scrollX]);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth <= 0) return;
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / containerWidth));
  }, [containerWidth]);

  const handleIndicatorPress = useCallback((slotIndex: number) => {
    const billIndex = getNearestBillIndexForSlot(
      slotIndex,
      activeIndex,
      upcomingBills.length,
    );
    setActiveIndex(billIndex);
    listRef.current?.scrollToOffset({
      animated: true,
      offset: billIndex * pageWidth,
    });
  }, [activeIndex, pageWidth, upcomingBills.length]);

  const renderBill = useCallback(({ item, index }: ListRenderItemInfo<UpcomingEnrollmentBill>) => (
    <UpcomingBillCard
      bill={item}
      index={index}
      onPress={handleBillPress}
      pageWidth={pageWidth}
      scrollX={scrollX}
    />
  ), [handleBillPress, pageWidth, scrollX]);

  const renderIndicators = () => {
    if (upcomingBills.length <= 1) return null;

    return (
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorTrack} testID="monthly-bill-indicator-track">
          {indicatorSlots.map((slotIndex) => {
            const isActive = slotIndex === activeIndex % indicatorSlots.length;
            const inputRange = upcomingBills.map((_, billIndex) => billIndex * pageWidth);
            const activeOutputRange = upcomingBills.map((_, billIndex) => (
              billIndex % indicatorSlots.length === slotIndex ? 1 : 0
            ));
            const scaleX = scrollX.interpolate({
              extrapolate: 'clamp',
              inputRange,
              outputRange: activeOutputRange.map((value) => (value ? 1 : 6 / 19)),
            });
            const opacity = scrollX.interpolate({
              extrapolate: 'clamp',
              inputRange,
              outputRange: activeOutputRange,
            });
            const targetBillIndex = getNearestBillIndexForSlot(
              slotIndex,
              activeIndex,
              upcomingBills.length,
            );

            return (
              <Pressable
                accessibilityLabel={`Show bill ${targetBillIndex + 1} of ${upcomingBills.length}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                hitSlop={6}
                key={slotIndex}
                onPress={() => handleIndicatorPress(slotIndex)}
                style={styles.indicatorSlot}
                testID={`monthly-bill-indicator-${slotIndex}`}
              >
                <View style={styles.indicatorVisual}>
                  <View style={styles.monthlyIndicatorInactive} />
                  <Animated.View
                    style={[
                      styles.monthlyIndicatorActive,
                      { opacity, transform: [{ scaleX }] },
                    ]}
                    testID={`monthly-bill-indicator-active-${slotIndex}`}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
        <AppText
          accessibilityLabel={`Bill ${activeIndex + 1} of ${upcomingBills.length}`}
          size="extraSmall"
          weight="600"
          style={styles.indicatorCount}
          testID="monthly-bill-indicator-count"
        >
          {activeIndex + 1} / {upcomingBills.length}
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <MonthlyBillsSkeleton />
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <BillIcon height={28} width={28} />
          <AppText size="small" weight="600" style={styles.emptyTitle}>Unable to load upcoming bills</AppText>
          <AppText size="extraSmall" style={styles.emptySubtitle}>Please try again later.</AppText>
        </View>
      ) : upcomingBills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BillIcon height={28} width={28} />
          <AppText size="small" weight="600" style={styles.emptyTitle}>No upcoming bills this month</AppText>
          <AppText size="extraSmall" style={styles.emptySubtitle}>
            You&apos;re all caught up. Upcoming Auto Debit bills will appear here automatically.
          </AppText>
        </View>
      ) : (
        <>
          <View onLayout={handleLayout} style={styles.carouselViewport}>
            <Animated.FlatList
              data={upcomingBills}
              decelerationRate="fast"
              disableIntervalMomentum
              getItemLayout={(_, index) => ({ index, length: pageWidth, offset: pageWidth * index })}
              horizontal
              initialNumToRender={2}
              keyExtractor={(item) => item.key}
              maxToRenderPerBatch={3}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true },
              )}
              pagingEnabled
              ref={listRef}
              removeClippedSubviews={Platform.OS !== 'web'}
              renderItem={renderBill}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={pageWidth}
              style={styles.carousel}
              testID="monthly-bills-carousel"
              windowSize={3}
            />
          </View>
          {renderIndicators()}
        </>
      )}
    </View>
  );
};
