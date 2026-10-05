import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { useTabBarScrollHandler } from '@/components/common/GlobalScrollView';
import { InlineLoadingIndicator, SkeletonList } from '@/components/common/Loading';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import SavedBillCard from '@/components/one-time-payments/SavedBillCard';
import { useGetBillersQuery } from '@/redux/features/biller/billerApi';
import { useGetBillsQuery } from '@/redux/features/bills/billsApi';
import type { Bill } from '@/redux/features/bills/billsTypes';
import { openSavedBill } from '@/services/routeNavigation';
import { billsStyles } from '@/styles/app/bills/one-time-payments';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { enrollmentListComponentStyles } from '@/styles/components/enrollments/EnrollmentListComponent';
import { getActiveSavedBillCount, getBillerLogoMap, getSavedBillIdentity, getSavedBillsForDisplay, getUniqueSavedBills, shouldUseMockSavedBills } from '@/utils/savedBills';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, RefreshControl, View } from 'react-native';
import Animated from 'react-native-reanimated';

export default function SavedBillsScreen() {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Bill[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsRef = useRef<Bill[]>([]);
  const isLoadingMoreRef = useRef(false);
  const refreshFirstPageRef = useRef(false);
  const lastProcessedResponseRef = useRef('');
  const scrollHandler = useTabBarScrollHandler();
  const {
    data,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetBillsQuery({ page });
  const { data: billers } = useGetBillersQuery({});
  const billerLogosByMerchantId = useMemo(() => getBillerLogoMap(billers), [billers]);
  const isUsingMockData = page === 0 && shouldUseMockSavedBills(data);

  useEffect(() => {
    if (!data && !isUsingMockData) {
      return;
    }

    const displayData = page === 0 ? getSavedBillsForDisplay(data) : data;
    const responseSignature = `${page}:${JSON.stringify(displayData)}`;
    if (lastProcessedResponseRef.current === responseSignature) {
      return;
    }
    lastProcessedResponseRef.current = responseSignature;

    const pageItems = getUniqueSavedBills(displayData);
    const previousItems = page === 0 ? [] : itemsRef.current;
    const nextItems = getUniqueSavedBills([...previousItems, ...pageItems]);
    const addedItemCount = nextItems.length - previousItems.length;

    itemsRef.current = nextItems;
    setItems(nextItems);
    setHasMore(
      !isUsingMockData
      && pageItems.length > 0
      && (page === 0 || addedItemCount > 0),
    );
    isLoadingMoreRef.current = false;
  }, [data, isUsingMockData, page]);

  useFocusEffect(
    useCallback(() => () => {
      setPage(0);
      setHasMore(true);
      isLoadingMoreRef.current = false;
      lastProcessedResponseRef.current = '';
    }, []),
  );

  useEffect(() => {
    if (page !== 0 || !refreshFirstPageRef.current) {
      return;
    }

    refreshFirstPageRef.current = false;
    void refetch().finally(() => setIsRefreshing(false));
  }, [page, refetch]);

  const loadMore = useCallback(() => {
    if (
      itemsRef.current.length > 0
      && hasMore
      && !isFetching
      && !isLoadingMoreRef.current
    ) {
      isLoadingMoreRef.current = true;
      setPage((currentPage) => currentPage + 1);
    }
  }, [hasMore, isFetching]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setHasMore(true);
    isLoadingMoreRef.current = false;

    if (page !== 0) {
      refreshFirstPageRef.current = true;
      setPage(0);
      return;
    }

    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [page, refetch]);

  const showInitialLoader = (isLoading || isFetching) && !isUsingMockData && items.length === 0;
  const showInitialError = isError && !isUsingMockData && items.length === 0;
  const activeCount = getActiveSavedBillCount(items);
  const countLabel = showInitialLoader
    ? 'Loading'
    : showInitialError
      ? 'Unavailable'
      : `${activeCount} active`;
  const summaryAccessibilityLabel = showInitialLoader
    ? 'Saved Bills, loading active bill count'
    : showInitialError
      ? 'Saved Bills, active bill count unavailable'
      : `Saved Bills, ${activeCount} active`;

  const listHeader = (
    <View
      accessibilityLabel={summaryAccessibilityLabel}
      accessible
      style={billsStyles.header}
      testID="saved-bills-banner"
    >
      <AppText color="neutral07" size="small">Pay a Bill</AppText>
      <AppText color="red10" size="small">{countLabel}</AppText>
    </View>
  );

  const renderEmpty = () => {
    if (showInitialLoader) {
      return (
        <SkeletonList
          label="Loading saved bills"
          rowStyle={globalStyle.optionHolder}
          rows={6}
        />
      );
    }

    if (showInitialError) {
      return (
        <EmptyStateCard
          message="Unable to load saved bills. Please try again later."
          variant="error"
        />
      );
    }

    return (
      <EmptyStateCard
        message="You don't have any saved bills yet."
        variant="empty"
      />
    );
  };

  const renderFooter = () => (
    <View>
      {isFetching && page > 0 ? (
        <InlineLoadingIndicator
          label="Loading more bills…"
          style={enrollmentListComponentStyles.loadingMore}
        />
      ) : null}
      {isError && !isUsingMockData && items.length > 0 ? (
        <EmptyStateCard
          message="Unable to load more bills. Pull to refresh and try again."
          variant="error"
        />
      ) : null}
    </View>
  );

  return (
    <View style={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
      <NavHeaderComponent title="Saved Bills" />
      <Animated.FlatList<Bill>
        contentContainerStyle={[
          globalStyle.outerContainer,
        ]}
        data={items}
        initialNumToRender={8}
        keyExtractor={getSavedBillIdentity}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={listHeader}
        maxToRenderPerBatch={8}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        onScroll={scrollHandler}
        refreshControl={(
          <RefreshControl
            colors={[Colors.red10]}
            onRefresh={refresh}
            refreshing={isRefreshing}
            tintColor={Colors.red10}
          />
        )}
        removeClippedSubviews={Platform.OS !== 'web'}
        renderItem={({ item }) => (
          <SavedBillCard
            bill={item}
            logoUrl={billerLogosByMerchantId.get(item.merchant_id)}
            onPress={openSavedBill}
          />
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={enrollmentListComponentStyles.list}
        testID="saved-bills-list"
        windowSize={7}
      />
    </View>
  );
}
