import AlphabetIndex from '@/components/common/AlphabetIndex';
import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import MerchantListRow from '@/components/common/MerchantListRow';
import SearchInput from '@/components/common/SearchInput';
import { BILLER_DIRECTORY_SEARCH_HEIGHT, BILLER_INDEX_BOTTOM_CLEARANCE, BILLER_INDEX_LETTER_HEIGHT, BILLER_INDEX_MIN_LETTER_HEIGHT, } from '@/constants/billerDirectory';
import { COMMON } from '@/constants/common';
import { useAlphabetIndex } from '@/hooks/useAlphabetIndex';
import type { Biller } from '@/redux/features/biller/billerTypes';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { searchMerchantsStyles as styles } from '@/styles/components/common/SearchMerchants';
import { SearchMerchantsProps } from '@/types/common';
import { filterBillersByName, foldSearchText, groupBillersByLetter, sortBillersByName } from '@/utils/billerDirectory';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, ScrollView, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTabBarScrollHandler } from './GlobalScrollView';
import { BillerDirectorySkeleton, BillerListSkeleton } from './Loading';
import { SectionHeaderComponent } from './SectionHeaderComponent';

const getMerchantName = (item: any, searchProperty: string): string => (
  String(item[searchProperty] || item.merchant_name || item.name || '')
);

const getMerchantLogo = (item: any): string | undefined => (
  item.logoUrl || item.merchant_logo_url || item.boxedLogo || item.standardLogo
);

export default function SearchMerchants({
  data,
  searchProperty,
  onSelect,
  sectionTitle,
  isError = false,
  isLoading = false,
  activeCategoryId,
  onCategoryChange,
  apiEnv,
  layout = 'filters',
  header,
  savedMerchantIds,
  onRetry,
}: SearchMerchantsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;

    const term = foldSearchText(searchQuery);
    return data.filter((item) => {
      const value = item[searchProperty];
      return Boolean(value) && foldSearchText(String(value)).includes(term);
    });
  }, [data, searchQuery, searchProperty]);

  if (layout === 'directory') {
    return (
      <BillerDirectory
        billers={(data ?? []) as Biller[]}
        header={header}
        isError={isError}
        isLoading={isLoading}
        onSelect={onSelect}
        onRetry={onRetry}
        savedMerchantIds={savedMerchantIds ?? new Set()}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    );
  }

  const isEmpty = !isLoading && (!filteredData || filteredData.length === 0);

  return (
    <View style={globalStyle.outerContainer}>
      {sectionTitle ? <SectionHeaderComponent title={sectionTitle} /> : null}
      <View style={{ borderRadius: 8, overflow: 'hidden' }}>
        <SearchInput
          containerStyle={styles.searchInputSpacing}
          onChangeText={setSearchQuery}
          placeholder="Search biller"
          value={searchQuery}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          {COMMON.BILLER_CATEGORIES.map((category) => {
            const categories = apiEnv === 'enrollments' && category.id === 'real_estate';
            if (categories) return;

            const isActive = activeCategoryId === category.categoryId;
            const IconComponent = category.icon;

            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
                onPress={() => onCategoryChange && onCategoryChange(category.categoryId)}
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

        {isLoading ? (
          <BillerListSkeleton rows={6} label="Loading billers" />
        ) : isError ? (
          <EmptyStateCard
            variant="error"
            message="Unable to load billers at the moment. Please try again later."
          />
        ) : isEmpty ? (
          <EmptyStateCard
            variant='empty'
            message="No billers found matching your search."
          />
        ) : (
          filteredData.map((item, index) => {
            const name = getMerchantName(item, searchProperty);

            return (
              <MerchantListRow
                key={item.id || item.merchant_id || index}
                logoUrl={getMerchantLogo(item)}
                name={name}
                onPress={onSelect ? () => onSelect(item) : undefined}
                testID={item.merchant_id ? `biller-row-${item.merchant_id}` : undefined}
              />
            );
          })
        )}
      </View>
    </View>
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
  searchQuery,
  setSearchQuery,
}: {
  billers: Biller[];
  header?: React.ReactNode;
  savedMerchantIds: ReadonlySet<number>;
  isLoading: boolean;
  isError: boolean;
  onSelect?: (biller: Biller) => void;
  onRetry?: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const searchTerm = searchQuery.trim();
  const isSearching = searchTerm.length > 0;

  const sortedBillers = useMemo(() => sortBillersByName(billers), [billers]);
  const results = useMemo(() => filterBillersByName(sortedBillers, searchTerm), [sortedBillers, searchTerm]);
  const groups = useMemo(() => (isSearching ? [] : groupBillersByLetter(sortedBillers)), [isSearching, sortedBillers]);
  const letters = useMemo(() => groups.map((group) => group.letter), [groups]);
  const alphabetIndex = useAlphabetIndex(letters);
  const scrollHandler = useTabBarScrollHandler(alphabetIndex.handleScroll);

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

  const railTop = headerHeight + BILLER_DIRECTORY_SEARCH_HEIGHT;
  const availableHeight = viewHeight - railTop - BILLER_INDEX_BOTTOM_CLEARANCE;
  const letterHeight = Math.max(
    BILLER_INDEX_MIN_LETTER_HEIGHT,
    Math.min(BILLER_INDEX_LETTER_HEIGHT, Math.floor(availableHeight / Math.max(letters.length, 1))),
  );
  const showSearch = !isLoading && !isError;
  const showIndex = !isSearching && showSearch && letters.length > 0;

  const renderRow = (biller: Biller) => (
    <MerchantListRow
      badge={savedMerchantIds.has(biller.merchant_id) ? 'Saved' : undefined}
      key={biller.merchant_id}
      logoUrl={biller.merchant_logo_url}
      name={biller.merchant_name}
      onPress={onSelect ? () => onSelect(biller) : undefined}
      testID={`biller-row-${biller.merchant_id}`}
    />
  );

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
