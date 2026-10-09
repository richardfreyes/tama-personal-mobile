import AlphabetIndex from '@/components/common/AlphabetIndex';
import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import MerchantListRow from '@/components/common/MerchantListRow';
import SearchInput from '@/components/common/SearchInput';
import { BILLER_DIRECTORY_SEARCH_HEIGHT, BILLER_INDEX_BOTTOM_CLEARANCE, BILLER_INDEX_LETTER_HEIGHT, BILLER_INDEX_MIN_LETTER_HEIGHT, } from '@/constants/billerDirectory';
import { COMMON } from '@/constants/common';
import { useAlphabetIndex } from '@/hooks/useAlphabetIndex';
import { Colors } from '@/styles/common/colors';
import { searchMerchantsStyles as styles } from '@/styles/components/common/SearchMerchants';
import { SearchMerchantsProps } from '@/types/common';
import { filterBillersByName, groupBillersByLetter, sortBillersByName } from '@/utils/billerDirectory';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTabBarScrollHandler } from './GlobalScrollView';
import { BillerDirectorySkeleton, BillerListSkeleton } from './Loading';

const getMerchantName = (item: any, searchProperty: string): string => (
  String(item[searchProperty] || item.merchant_name || item.name || '')
);

const getMerchantLogo = (item: any): string | undefined => (
  item.logoUrl || item.merchant_logo_url || item.boxedLogo || item.standardLogo
);

const getMerchantKey = (item: any, index: number): string | number => (
  item.merchant_id ?? item.id ?? index
);

export default function SearchMerchants({
  data,
  searchProperty,
  onSelect,
  isError = false,
  isLoading = false,
  activeCategoryId,
  onCategoryChange,
  header,
  savedMerchantIds,
  onRetry,
  refreshControl,
}: SearchMerchantsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  const categoryPills = onCategoryChange ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
      {COMMON.BILLER_CATEGORIES.map((category) => {
        const isActive = activeCategoryId === category.categoryId;
        const IconComponent = category.icon;

        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
            onPress={() => onCategoryChange(category.categoryId)}
          >
            <IconComponent
              style={{ marginRight: 8 }}
              {...category.iconProps}
              fill={isActive ? Colors.red10 : Colors.neutral10}
            />
            <AppText size='small' style={{ color: isActive ? Colors.red10 : Colors.neutral10 }}>
              {category.name}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  ) : null;

  return (
    <BillerDirectory
      billers={data ?? []}
      header={categoryPills || header ? <>{header}{categoryPills}</> : undefined}
      isError={isError}
      isLoading={isLoading}
      onSelect={onSelect}
      onRetry={onRetry}
      refreshControl={refreshControl}
      savedMerchantIds={savedMerchantIds ?? new Set()}
      searchProperty={searchProperty}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}

function BillerDirectory({
  billers,
  header,
  savedMerchantIds,
  isLoading,
  isError,
  onSelect,
  onRetry,
  refreshControl,
  searchProperty,
  searchQuery,
  setSearchQuery,
}: {
  billers: any[];
  header?: React.ReactNode;
  savedMerchantIds: ReadonlySet<number>;
  isLoading: boolean;
  isError: boolean;
  onSelect?: (biller: any) => void;
  onRetry?: () => void;
  refreshControl?: SearchMerchantsProps['refreshControl'];
  searchProperty: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const searchTerm = searchQuery.trim();
  const isSearching = searchTerm.length > 0;

  const getName = useCallback((item: any) => getMerchantName(item, searchProperty), [searchProperty]);
  const sortedBillers = useMemo(() => sortBillersByName(billers, getName), [billers, getName]);
  const results = useMemo(() => filterBillersByName(sortedBillers, searchTerm, getName), [sortedBillers, searchTerm, getName]);
  const groups = useMemo(
    () => (isSearching ? [] : groupBillersByLetter(sortedBillers, getName)),
    [isSearching, sortedBillers, getName],
  );
  const letters = useMemo(() => groups.map((group) => group.letter), [groups]);
  const alphabetIndex = useAlphabetIndex(letters);
  const [scrollY, setScrollY] = useState(0);
  const { handleScroll: handleIndexScroll } = alphabetIndex;
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(Math.min(Math.max(event.nativeEvent.contentOffset.y, 0), headerHeight));
    handleIndexScroll(event);
  }, [handleIndexScroll, headerHeight]);
  const scrollHandler = useTabBarScrollHandler(handleScroll);

  const clearSearch = () => {
    setSearchQuery('');
    alphabetIndex.scrollRef.current?.scrollTo({ animated: false, y: 0 });
  };
  const handleSearchChange = (value: string) => {
    if (isSearching !== Boolean(value.trim())) {
      alphabetIndex.scrollRef.current?.scrollTo({ animated: false, y: 0 });
    }
    setSearchQuery(value);
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => setHeaderHeight(event.nativeEvent.layout.height);
  const handleViewLayout = (event: LayoutChangeEvent) => setViewHeight(event.nativeEvent.layout.height);

  const trackedRailTop = headerHeight - scrollY + BILLER_DIRECTORY_SEARCH_HEIGHT;
  const lowestRailTop = viewHeight - BILLER_INDEX_BOTTOM_CLEARANCE - letters.length * BILLER_INDEX_MIN_LETTER_HEIGHT;
  const railTop = viewHeight > 0
    ? Math.max(Math.min(trackedRailTop, lowestRailTop), BILLER_DIRECTORY_SEARCH_HEIGHT)
    : trackedRailTop;
  const availableHeight = viewHeight - railTop - BILLER_INDEX_BOTTOM_CLEARANCE;
  const letterHeight = Math.max(
    BILLER_INDEX_MIN_LETTER_HEIGHT,
    Math.min(BILLER_INDEX_LETTER_HEIGHT, Math.floor(availableHeight / Math.max(letters.length, 1))),
  );
  const showSearch = !isLoading && !isError;
  const showIndex = !isSearching && showSearch && letters.length > 0;

  const renderRow = (biller: any, index: number) => {
    const key = getMerchantKey(biller, index);

    return (
      <MerchantListRow
        badge={savedMerchantIds.has(biller.merchant_id) ? 'Saved' : undefined}
        key={key}
        logoUrl={getMerchantLogo(biller)}
        name={getName(biller)}
        onPress={onSelect ? () => onSelect(biller) : undefined}
        testID={`biller-row-${key}`}
      />
    );
  };

  const renderBillers = () => {
    if (isError) {
      return (
        <EmptyStateCard
          message="Unable to load billers at the moment. Please try again later."
          onRetry={onRetry}
          retryLabel="Try loading billers again"
          variant="error"
        />
      );
    }

    if (isSearching) {
      if (results.length === 0) {
        return (
          <EmptyStateCard
            actionLabel="Clear Search"
            appearance="centered"
            icon="search"
            message={`Nothing matches “${searchTerm}”. Check the spelling or try the company’s registered name.`}
            onAction={clearSearch}
            title="No billers found"
          />
        );
      }

      return (
        <>
          <AppText style={styles.matchCount}>
            {`${results.length} ${results.length === 1 ? 'biller matches' : 'billers match'} “${searchTerm}”`}
          </AppText>
          {results.map(renderRow)}
        </>
      );
    }

    if (sortedBillers.length === 0) {
      return <EmptyStateCard message="No billers are available right now." variant="empty" />;
    }

    return groups.map((group) => (
      <View
        key={group.letter}
        onLayout={(event) => alphabetIndex.handleSectionLayout(group.letter, event)}
        testID={`biller-section-${group.letter}`}
      >
        <AppText weight="600" style={styles.letterHeading}>{group.letter}</AppText>
        {group.billers.map(renderRow)}
      </View>
    ));
  };

  return (
    <View onLayout={handleViewLayout} style={styles.directory} testID="biller-directory">
      <Animated.ScrollView
        contentContainerStyle={styles.directoryContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onScroll={scrollHandler}
        ref={alphabetIndex.scrollRef}
        refreshControl={refreshControl}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={showSearch ? [1] : undefined}
        testID="biller-directory-scroll"
      >
        <View onLayout={handleHeaderLayout} style={isSearching ? styles.hidden : undefined} testID="biller-directory-header">
          {header}
        </View>
        {isLoading ? (
          <BillerDirectorySkeleton />
        ) : showSearch ? (
          <View style={styles.searchWrapper}>
            <SearchInput
              accessibilityLabel="Search biller"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={handleSearchChange}
              onClear={clearSearch}
              placeholder={`Search ${billers.length} ${billers.length === 1 ? 'biller' : 'billers'}`}
              returnKeyType="search"
              testID="biller-search"
              value={searchQuery}
              variant="filled"
            />
          </View>
        ) : null}
        {isLoading ? null : (
          <View onLayout={alphabetIndex.handleListLayout} style={styles.directoryList} testID="biller-directory-list">
            {renderBillers()}
          </View>
        )}
      </Animated.ScrollView>
      {showIndex ? (
        <AlphabetIndex
          activeLetter={alphabetIndex.activeLetter}
          letterHeight={letterHeight}
          letters={letters}
          onScrub={(letter) => alphabetIndex.scrollToLetter(letter, false)}
          onSelect={alphabetIndex.scrollToLetter}
          style={[styles.rail, { top: railTop }]}
        />
      ) : null}
    </View>
  );
}
