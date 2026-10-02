import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { useTabBarScrollHandler } from '@/components/common/GlobalScrollView';
import { HorizontalCardSkeleton, InlineLoadingIndicator, TransactionHistorySkeleton } from '@/components/common/Loading';
import SearchInput from '@/components/common/SearchInput';
import { SectionHeaderComponent } from '@/components/common/SectionHeaderComponent';
import EnrollmentSummaryCard from '@/components/enrollments/EnrollmentSummaryCard';
import { DEFAULT_ENROLLMENT_COUNT } from '@/constants/enrollment';
import { useGetEnrollmentsQuery } from '@/redux/features/enrollments/enrollmentApi';
import { setSelectedEnrollment } from '@/redux/features/enrollmentSelection/enrollmentSelectionSlice';
import { useGetMerchantsQuery } from '@/redux/features/merchants/merchantApi';
import { useAppDispatch } from '@/redux/hooks';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { enrollmentListComponentStyles as styles } from '@/styles/components/enrollments/EnrollmentListComponent';
import type { Enrollment, EnrollmentListComponentProps, EnrollmentListRef } from '@/types';
import { getEnrollmentKey } from '@/utils/enrollment';
import { router, useFocusEffect } from 'expo-router';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, RefreshControl, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';

const normalizeMerchantIdentifier = (value: unknown): string | null => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;

  const normalized = String(value).trim().toLowerCase();
  return normalized || null;
};

const getMerchantIdentifiers = (merchant: any): unknown[] => [
  merchant.id,
  merchant.pid,
  merchant.code,
  merchant.merchantId,
  merchant.merchant_id,
  merchant.merchantCode,
  merchant.merchant_code,
  merchant.name,
];

const getEnrollmentMerchantIdentifiers = (enrollment: Enrollment): unknown[] => [
  enrollment.merchantId,
  enrollment.merchant_id,
  enrollment.merchantNid,
  enrollment.merchant_nid,
  enrollment.merchantCode,
  enrollment.merchant_code,
  enrollment.pid,
  enrollment.merchantName,
  enrollment.merchant_name,
  enrollment.merchant?.id,
  enrollment.merchant?.pid,
  enrollment.merchant?.code,
  enrollment.merchant?.name,
];

const getEnrollmentLogoUrl = (
  enrollment: Enrollment,
  merchantLogosByIdentifier: Map<string, string>,
): string | undefined => {
  const directLogoUrl = enrollment.logoUrl
    || enrollment.merchantLogoUrl
    || enrollment.merchant_logo_url
    || enrollment.merchant?.logoUrl;

  if (directLogoUrl) return directLogoUrl;

  for (const identifier of getEnrollmentMerchantIdentifiers(enrollment)) {
    const normalizedIdentifier = normalizeMerchantIdentifier(identifier);
    if (!normalizedIdentifier) continue;

    const logoUrl = merchantLogosByIdentifier.get(normalizedIdentifier);
    if (logoUrl) return logoUrl;
  }

  return undefined;
};

const EnrollmentListComponent = forwardRef<EnrollmentListRef, EnrollmentListComponentProps>(({
  variant = 'list',
  screenHeader,
  screenFooter,
}, ref) => {
  const dispatch = useAppDispatch();
  const { width: windowWidth } = useWindowDimensions();
  const tabBarScrollHandler = useTabBarScrollHandler();
  const isCarousel = variant === 'carousel';
  const carouselCardWidth = Math.min(Math.max(windowWidth - 88, 260), 340);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Enrollment[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isLoadingMore = useRef(false);
  const { data: merchants } = useGetMerchantsQuery('');

  const { data, isLoading, isFetching, isError, refetch } = useGetEnrollmentsQuery({
    page,
    count: DEFAULT_ENROLLMENT_COUNT,
    searchQuery: debouncedSearch,
  });

  const merchantLogosByIdentifier = useMemo(() => {
    const logoMap = new Map<string, string>();

    merchants?.forEach((merchant) => {
      const logoUrl = merchant.logoUrl || merchant.boxedLogo || merchant.standardLogo;
      if (!logoUrl) return;

      getMerchantIdentifiers(merchant).forEach((identifier) => {
        const normalizedIdentifier = normalizeMerchantIdentifier(identifier);
        if (normalizedIdentifier && !logoMap.has(normalizedIdentifier)) {
          logoMap.set(normalizedIdentifier, logoUrl);
        }
      });
    });

    return logoMap;
  }, [merchants]);

  const loadMore = useCallback(() => {
    if (!isCarousel && !isLoadingMore.current && hasMore && !isFetching) {
      isLoadingMore.current = true;
      setPage((previousPage) => previousPage + 1);
    }
  }, [hasMore, isCarousel, isFetching]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    isLoadingMore.current = false;
    setHasMore(true);

    try {
      if (page !== 0) {
        setPage(0);
        return;
      }

      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [page, refetch]);

  useImperativeHandle(ref, () => ({ loadMore, refresh }), [loadMore, refresh]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setPage(0);
        setHasMore(true);
        isLoadingMore.current = false;
      };
    }, [])
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
      setHasMore(true);
      isLoadingMore.current = false;
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!data) return;

    setItems((previousItems) => {
      if (data.currentPage === 0) {
        return [...data.items];
      }

      const merged = new Map<string, Enrollment>();
      previousItems.forEach((item, index) => merged.set(getEnrollmentKey(item, index), item));
      data.items.forEach((item, index) => merged.set(getEnrollmentKey(item, data.offset + index), item));
      return Array.from(merged.values());
    });

    const loadedCount = data.currentPage === 0
      ? data.items.length
      : Math.min(data.offset + data.items.length, data.totalCount);
    setHasMore(loadedCount < data.totalCount);
    isLoadingMore.current = false;
  }, [data]);

  const handleEnrollmentPress = useCallback((item: Enrollment) => {
    dispatch(setSelectedEnrollment(item));
    router.push({
      pathname: '/(app)/bills/enrollments/details',
      params: { enrollmentId: getEnrollmentKey(item) },
    });
  }, [dispatch]);

  const handleViewAll = useCallback(() => {
    router.push('/(app)/bills/enrollments/enrolled');
  }, []);

  const showInitialLoader = isLoading && items.length === 0;
  const isEmpty = !showInitialLoader && items.length === 0;

  if (isCarousel) {
    return (
      <View style={globalStyle.outerContainer}>
        <SectionHeaderComponent
          linkText={!showInitialLoader && !isError && !isEmpty ? 'View All' : null}
          onViewAllPress={handleViewAll}
          title="Enrollments"
        />

        {showInitialLoader ? (
          <HorizontalCardSkeleton
            itemHeight={280}
            itemWidth={carouselCardWidth}
            items={2}
            label="Loading enrollments"
          />
        ) : isError ? (
          <EmptyStateCard
            message="Unable to load enrollments. Please try again later."
            variant="error"
          />
        ) : isEmpty ? (
          <EmptyStateCard message="No enrollments found." variant="empty" />
        ) : (
          <FlatList
            contentContainerStyle={styles.carouselContent}
            data={items}
            decelerationRate="fast"
            disableIntervalMomentum
            horizontal
            initialNumToRender={4}
            keyExtractor={getEnrollmentKey}
            maxToRenderPerBatch={4}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => (
              <EnrollmentSummaryCard
                index={index}
                item={item}
                logoUrl={getEnrollmentLogoUrl(item, merchantLogosByIdentifier)}
                onPress={handleEnrollmentPress}
                wrapperStyle={[styles.carouselCardWrapper, { width: carouselCardWidth }]}
              />
            )}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={carouselCardWidth + 12}
            style={styles.carouselList}
            testID="enrollment-carousel"
            windowSize={5}
          />
        )}
      </View>
    );
  }

  const listHeader = (
    <View>
      {screenHeader}
      <View style={styles.searchBarWrapper}>
        <SearchInput
          accessibilityLabel="Search enrollments"
          autoCapitalize="none"
          onChangeText={setSearchQuery}
          placeholder="Search enrollments"
          returnKeyType="search"
          testID="enrollment-search-input"
          value={searchQuery}
        />
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (showInitialLoader) {
      return <TransactionHistorySkeleton rows={4} label="Loading enrollments" />;
    }

    if (isError) {
      return (
        <EmptyStateCard
          containerStyle={styles.emptyState}
          message="Unable to load enrollments. Please try again later."
          variant="error"
        />
      );
    }

    return (
      <EmptyStateCard
        containerStyle={styles.emptyState}
        message={debouncedSearch ? `No results found for "${debouncedSearch}".` : 'No enrollments found.'}
        variant="empty"
      />
    );
  };

  const renderFooter = () => (
    <View>
      {!showInitialLoader && isFetching && page > 0 ? (
        <InlineLoadingIndicator label="Loading more enrollments" style={styles.loadingMore} />
      ) : null}
      {!hasMore && !isFetching && !isEmpty ? (
        <AppText color="neutral07" size="extraSmall" style={styles.footerText}>
          You&apos;ve reached the bottom of the list
        </AppText>
      ) : null}
      {screenFooter}
    </View>
  );

  return (
    <View style={[globalStyle.outerContainer, styles.listPanel]}>
      <Animated.FlatList
        contentContainerStyle={styles.listContent}
        data={items}
        initialNumToRender={8}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={getEnrollmentKey}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={listHeader}
        maxToRenderPerBatch={8}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        onScroll={tabBarScrollHandler}
        refreshControl={(
          <RefreshControl
            colors={[Colors.aqua10]}
            onRefresh={refresh}
            refreshing={isRefreshing}
            tintColor={Colors.aqua10}
          />
        )}
        removeClippedSubviews={Platform.OS !== 'web'}
        renderItem={({ item, index }) => (
          <EnrollmentSummaryCard
            index={index}
            item={item}
            logoUrl={getEnrollmentLogoUrl(item, merchantLogosByIdentifier)}
            onPress={handleEnrollmentPress}
          />
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        testID="enrollment-full-list"
        windowSize={7}
      />
    </View>
  );
});

EnrollmentListComponent.displayName = 'EnrollmentListComponent';

export default EnrollmentListComponent;
