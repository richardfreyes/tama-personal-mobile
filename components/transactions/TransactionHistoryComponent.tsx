import AutoIcon from '@/assets/icons/auto.svg';
import CheckIcon from '@/assets/icons/check.svg';
import FilterIcon from '@/assets/icons/filter.svg';
import SearchInput from '@/components/common/SearchInput';
import { TRANSACTION_HISTORY_PAGE_SIZE, TRANSACTION_STATUS_GROUPS } from '@/constants/transaction';
import { useGetEnrollmentTransactionHistoryQuery } from '@/redux/features/enrollmentTransactionHistory/enrollmentTransactionHistoryApi';
import { useGetTransactionsQuery } from '@/redux/features/transactions/transactionApi';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { transactionHistoryComponentStyles as styles } from '@/styles/components/transactions/TransactionHistoryComponent';
import { ComponentsProps, TransactionHistoryRef, TransactionItemProps, UnifiedTransaction } from '@/types';
import { formatApiDate, getStartOfDay } from '@/utils/date';
import { formatMoney } from '@/utils/format';
import { mergeTransactions, normalizeEnrollmentTransaction, normalizeOneTimePaymentTransaction, sortTransactionsNewestFirst, transactionMatchesSearch } from '@/utils/transactionHistory';
import { router, useFocusEffect } from 'expo-router';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { AppText } from '../common/AppText';
import EmptyStateCard from '../common/EmptyStateCard';
import { InlineLoadingIndicator, TransactionHistorySkeleton } from '../common/Loading';
import { SectionHeaderComponent } from '../common/SectionHeaderComponent';
import { SpacerComponent } from '../common/SpacerComponent';

const formatBackendStatus = (status: string): string => (
  status
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
);

const getStatusDisplay = (item: UnifiedTransaction) => {
  const statusLower = item.status?.toLowerCase() || '';

  if (item.source === 'oneTimePayment') {
    if (TRANSACTION_STATUS_GROUPS.INCOMPLETE.has(statusLower)) {
      const pendingLabel = statusLower === 'uncaptured'
        ? 'Pending'
        : formatBackendStatus(item.statusLabel || item.status);
      return { color: Colors.amber10, bg: Colors.amber01, text: pendingLabel };
    }
    if (TRANSACTION_STATUS_GROUPS.FAILED.has(statusLower)) {
      return {
        color: Colors.error06,
        bg: Colors.error01,
        text: formatBackendStatus(item.statusLabel || item.status),
      };
    }
    if (TRANSACTION_STATUS_GROUPS.SUCCESSFUL.has(statusLower)) {
      return { color: Colors.success09, bg: Colors.success01, text: 'Paid' };
    }
    return {
      color: Colors.maroon10,
      bg: Colors.maroon01,
      text: formatBackendStatus(item.statusLabel || item.status || 'Unknown'),
    };
  }

  if (['pending', 'incomplete', 'uncaptured', 'submitted', 'processing'].includes(statusLower)) {
    return { color: Colors.amber10, bg: Colors.amber01, text: item.statusLabel };
  }
  if (TRANSACTION_STATUS_GROUPS.FAILED.has(statusLower)) {
    return { color: Colors.error06, bg: Colors.error01, text: item.statusLabel };
  }
  return { color: Colors.success09, bg: Colors.success01, text: item.statusLabel };
};

const groupTransactionsByDate = (transactions: UnifiedTransaction[] = []) => {
  const grouped: Record<string, UnifiedTransaction[]> = {};
  const today = new Date().toDateString();

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.createdAt);
    const transactionDateString = transactionDate.toDateString();
    const groupKey = transactionDateString === today
      ? 'Today'
      : transactionDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(transaction);
  });

  return grouped;
};

const DateSeparator = ({ date }: { date: string }) => (
  <AppText weight="bold" variant="bodyMedium" style={styles.dateSeparatorText}>{date}</AppText>
);

const TransactionItem = ({ item }: TransactionItemProps) => {
  const statusDisplay = getStatusDisplay(item);
  const formattedAmount = formatMoney([item.currency, item.amount]);
  const formattedDate = formatApiDate(item.createdAt, 'MM/dd/yy - h:mmaaaa');
  const isEnrollment = item.source === 'enrollment';

  const handlePress = () => {
    router.push({
      pathname: '/transactions/[invoiceReferenceId]',
      params: isEnrollment
        ? {
            invoiceReferenceId: item.detailReferenceId,
            transactionId: item.transactionId,
            transactionType: item.source,
          }
        : {
            invoiceReferenceId: item.detailReferenceId,
            isAutoPay: 'One Time Payment',
          },
    });
  };

  return (
    <TouchableOpacity
      accessibilityHint={`Opens ${item.typeLabel.toLowerCase()} transaction details`}
      accessibilityLabel={`${item.merchantName}, ${item.typeLabel}, ${formattedAmount}`}
      accessibilityRole="button"
      onPress={handlePress}
      style={styles.itemContainer}
      testID={`transaction-item-${item.key}`}
    >
      <View style={styles.colLeft}>
        <View style={[styles.iconPlaceholder, item.merchantLogoUrl ? styles.iconWithLogo : null]}>
          {item.merchantLogoUrl ? (
            <Image
              accessible={false}
              resizeMode="contain"
              source={{ uri: item.merchantLogoUrl }}
              style={styles.avatarLogo}
              testID={`transaction-logo-${item.key}`}
            />
          ) : (
            <AppText
              style={{ color: 'white', fontWeight: 'bold' }}
              testID={`transaction-initial-${item.key}`}
            >
              {item.merchantName?.charAt(0)?.toUpperCase() || '?'}
            </AppText>
          )}
        </View>
        <View style={styles.textDetails}>
          <AppText weight="600" style={styles.merchantName} size="extraSmall">{item.merchantName}</AppText>
          <AppText size="extraSmall">{item.billingName || item.customerName || item.transactionId}</AppText>
        </View>
      </View>
      <View style={styles.colRight}>
        <View style={[styles.statusDisplay, { backgroundColor: statusDisplay.bg }]}>
          <View style={[styles.dot, { backgroundColor: statusDisplay.color }]} />
          <AppText style={[styles.dateText, { color: statusDisplay.color }]} size="extraSmall">
            {statusDisplay.text}{' '}
          </AppText>
          <View
            accessibilityLabel={`Transaction type: ${item.typeLabel}`}
            style={[
              styles.paymentTypeWrapper,
              isEnrollment ? styles.enrollmentTypeBadge : styles.oneTimePaymentTypeBadge,
            ]}
          >
            {isEnrollment
              ? <AutoIcon width={15} height={15} style={styles.paymentType} />
              : <CheckIcon width={15} height={15} style={styles.paymentType} />}
            <AppText
              size="tiny"
              style={isEnrollment ? styles.enrollmentTypeText : styles.oneTimePaymentTypeText}
            >
              {item.typeLabel}
            </AppText>
          </View>
        </View>
        <View style={styles.statusRow}>
          <AppText style={styles.statusText} weight="600" size="small">{formattedAmount}</AppText>
        </View>
        <AppText style={styles.dateText} size="tiny">{formattedDate}</AppText>
      </View>
    </TouchableOpacity>
  );
};

const SourceErrorNotice = ({ message, onRetry }: { message: string; onRetry: () => void; }) => (
  <View accessibilityRole="alert" style={styles.sourceErrorNotice}>
    <AppText size="extraSmall" style={styles.sourceErrorText}>{message}</AppText>
    <TouchableOpacity
      accessibilityLabel={`Retry ${message}`}
      accessibilityRole="button"
      onPress={onRetry}
      style={styles.sourceRetryButton}
    >
      <AppText size="extraSmall" weight="600" style={styles.sourceRetryText}>Retry</AppText>
    </TouchableOpacity>
  </View>
);

const statusMatchesFilter = (transaction: UnifiedTransaction, selectedStatus: string): boolean => {
  const filter = selectedStatus.toLowerCase();
  const statuses = [transaction.status, transaction.statusLabel].map((status) => status.toLowerCase());

  if (filter === 'successful') {
    return statuses.some((status) => TRANSACTION_STATUS_GROUPS.SUCCESSFUL.has(status));
  }
  if (filter === 'incomplete') {
    return statuses.some((status) => TRANSACTION_STATUS_GROUPS.INCOMPLETE.has(status));
  }
  if (filter === 'cancelled') {
    return statuses.some((status) => status === 'cancelled' || status === 'canceled');
  }
  if (filter === 'declined') {
    return statuses.some((status) => status === 'declined' || status === 'failed');
  }

  return statuses.includes(filter);
};

const TransactionHistoryComponent = forwardRef<TransactionHistoryRef, ComponentsProps>(
  ({ sectionHeader, onOpenFilterSheet, isFilterVisible, activeFilters }, ref) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [oneTimePaymentHasMore, setOneTimePaymentHasMore] = useState(true);
    const [enrollmentHasMore, setEnrollmentHasMore] = useState(true);
    const [oneTimePaymentPage, setOneTimePaymentPage] = useState(1);
    const [enrollmentOffset, setEnrollmentOffset] = useState(0);
    const [oneTimePaymentItems, setOneTimePaymentItems] = useState<UnifiedTransaction[]>([]);
    const [enrollmentItems, setEnrollmentItems] = useState<UnifiedTransaction[]>([]);
    const isLoadingMore = useRef(false);

    const {
      data: oneTimePaymentData,
      isLoading: isOneTimePaymentLoading,
      isFetching: isOneTimePaymentFetching,
      isError: isOneTimePaymentError,
      refetch: refetchOneTimePayments,
    } = useGetTransactionsQuery({
      page: oneTimePaymentPage,
      count: TRANSACTION_HISTORY_PAGE_SIZE,
      searchQuery: debouncedSearch,
    });

    const {
      data: enrollmentData,
      isLoading: isEnrollmentLoading,
      isFetching: isEnrollmentFetching,
      isError: isEnrollmentError,
      refetch: refetchEnrollments,
    } = useGetEnrollmentTransactionHistoryQuery({
      page: enrollmentOffset,
      count: TRANSACTION_HISTORY_PAGE_SIZE,
      searchQuery: debouncedSearch,
    });

    useImperativeHandle(ref, () => ({
      loadMore() {
        if (isLoadingMore.current || isOneTimePaymentFetching || isEnrollmentFetching) {
          return;
        }

        const canLoadOneTimePayments = oneTimePaymentHasMore && !isOneTimePaymentError;
        const canLoadEnrollments = enrollmentHasMore && !isEnrollmentError;
        if (canLoadOneTimePayments || canLoadEnrollments) {
          isLoadingMore.current = true;
          if (canLoadOneTimePayments) {
            setOneTimePaymentPage((previousPage) => previousPage + 1);
          }
          if (canLoadEnrollments) {
            setEnrollmentOffset((previousOffset) => previousOffset + TRANSACTION_HISTORY_PAGE_SIZE);
          }
        }
      },
      async refresh() {
        isLoadingMore.current = false;
        setOneTimePaymentHasMore(true);
        setEnrollmentHasMore(true);
        setOneTimePaymentPage(1);
        setEnrollmentOffset(0);

        await Promise.allSettled([
          refetchOneTimePayments(),
          refetchEnrollments(),
        ]);
      },
    }), [
      enrollmentHasMore,
      isEnrollmentError,
      isEnrollmentFetching,
      isOneTimePaymentError,
      isOneTimePaymentFetching,
      oneTimePaymentHasMore,
      refetchEnrollments,
      refetchOneTimePayments,
    ]);

    useFocusEffect(
      useCallback(() => () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setOneTimePaymentPage(1);
        setEnrollmentOffset(0);
        setOneTimePaymentHasMore(true);
        setEnrollmentHasMore(true);
      }, []),
    );

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearch(searchQuery);
        setOneTimePaymentPage(1);
        setEnrollmentOffset(0);
        setOneTimePaymentHasMore(true);
        setEnrollmentHasMore(true);
        isLoadingMore.current = false;
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }, [searchQuery]);

    useEffect(() => {
      if (!oneTimePaymentData?.items) {
        return;
      }

      const responsePage = oneTimePaymentData.currentPage ?? oneTimePaymentPage;
      if (responsePage !== oneTimePaymentPage) {
        return;
      }

      const normalizedItems = oneTimePaymentData.items.map(normalizeOneTimePaymentTransaction);
      setOneTimePaymentItems((previousItems) => mergeTransactions(
        previousItems,
        normalizedItems,
        oneTimePaymentPage === 1,
      ));

      const hasKnownTotal = typeof oneTimePaymentData.totalCount === 'number';
      setOneTimePaymentHasMore(
        hasKnownTotal
          ? oneTimePaymentPage * TRANSACTION_HISTORY_PAGE_SIZE < oneTimePaymentData.totalCount
          : oneTimePaymentData.items.length >= TRANSACTION_HISTORY_PAGE_SIZE,
      );
    }, [oneTimePaymentData, oneTimePaymentPage]);

    useEffect(() => {
      if (!enrollmentData?.transactions) {
        return;
      }

      const responseOffset = enrollmentData.pagination?.offset ?? enrollmentOffset;
      if (responseOffset !== enrollmentOffset) {
        return;
      }

      const normalizedItems = enrollmentData.transactions.map(normalizeEnrollmentTransaction);
      setEnrollmentItems((previousItems) => mergeTransactions(
        previousItems,
        normalizedItems,
        enrollmentOffset === 0,
      ));

      const pagination = enrollmentData.pagination;
      setEnrollmentHasMore(
        pagination
          ? pagination.offset + enrollmentData.transactions.length < pagination.total
          : enrollmentData.transactions.length >= TRANSACTION_HISTORY_PAGE_SIZE,
      );
    }, [enrollmentData, enrollmentOffset]);

    useEffect(() => {
      if (!isOneTimePaymentFetching && !isEnrollmentFetching) {
        isLoadingMore.current = false;
      }
    }, [isEnrollmentFetching, isOneTimePaymentFetching]);

    const allItems = useMemo(
      () => sortTransactionsNewestFirst(mergeTransactions(oneTimePaymentItems, enrollmentItems)),
      [enrollmentItems, oneTimePaymentItems],
    );

    const filterTransactions = useCallback((
      items: UnifiedTransaction[],
      filters: ComponentsProps['activeFilters'],
    ): UnifiedTransaction[] => {
      if (!items || items.length === 0) {
        return [];
      }

      return items.filter((item) => {
        let isStatusMatch = true;
        let isDateMatch = true;
        let isTransactionTypeMatch = true;

        if (filters?.statusFilters && filters.statusFilters.length > 0) {
          isStatusMatch = filters.statusFilters.some((status) => statusMatchesFilter(item, status));
        }

        if (filters?.transactionTypeFilters && filters.transactionTypeFilters.length > 0) {
          isTransactionTypeMatch = filters.transactionTypeFilters.includes(item.source);
        }

        if (filters?.startDate && filters?.endDate) {
          const itemTime = getStartOfDay(item.createdAt);
          const startTime = getStartOfDay(filters.startDate);
          const endTime = getStartOfDay(filters.endDate);

          if (itemTime < startTime || itemTime > endTime) {
            isDateMatch = false;
          }
        }

        return isStatusMatch && isDateMatch && isTransactionTypeMatch;
      });
    }, []);

    const filteredItems = useMemo(() => {
      const filteredByActiveFilters = filterTransactions(allItems, activeFilters);
      return filteredByActiveFilters.filter((item) => transactionMatchesSearch(item, searchQuery));
    }, [activeFilters, allItems, filterTransactions, searchQuery]);

    const isTransactionHistoryEmpty = filteredItems.length === 0;
    const groupedTransactions = groupTransactionsByDate(filteredItems);
    const sortedKeys = Object.keys(groupedTransactions);

    const handleViewAll = () => {
      router.push('/transactions');
    };

    const handleOpenFilters = () => {
      onOpenFilterSheet?.();
    };

    const showInitialLoader = (
      allItems.length === 0
      && (isOneTimePaymentLoading || isEnrollmentLoading)
    );
    const bothSourcesFailed = (
      isOneTimePaymentError
      && isEnrollmentError
      && allItems.length === 0
    );
    const isFetching = isOneTimePaymentFetching || isEnrollmentFetching;
    const hasMore = oneTimePaymentHasMore || enrollmentHasMore;

    const isSearchResolving = searchQuery.trim() !== debouncedSearch.trim() || isFetching;
    const showSearchResultsSkeleton = (
      isTransactionHistoryEmpty
      && searchQuery.trim().length > 0
      && isSearchResolving
    );

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={globalStyle.outerContainer}>
          <SectionHeaderComponent
            title={sectionHeader?.title}
            linkText={isTransactionHistoryEmpty ? null : sectionHeader?.linkText}
            onViewAllPress={handleViewAll}
          />

          <View>
            {isFilterVisible ? (
              <View>
                <View style={styles.searchBarWrapper}>
                  <View style={styles.searchBarInner}>
                    <SearchInput
                      accessibilityLabel="Search transactions"
                      autoCapitalize="none"
                      onChangeText={setSearchQuery}
                      placeholder="Search ID, Merchant, Bill Name"
                      returnKeyType="search"
                      testID="transaction-search-input"
                      value={searchQuery}
                    />
                  </View>
                  <TouchableOpacity
                    testID="transaction-filter-button"
                    style={styles.filterIconContainer}
                    onPress={handleOpenFilters}
                  >
                    <FilterIcon width={16} height={16} style={styles.btnFilter} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            <SpacerComponent height={12} />

            {isOneTimePaymentError && !bothSourcesFailed ? (
              <SourceErrorNotice
                message="One-time payment transactions couldn't be loaded."
                onRetry={() => { void refetchOneTimePayments(); }}
              />
            ) : null}
            {isEnrollmentError && !bothSourcesFailed ? (
              <SourceErrorNotice
                message="Enrollment transactions couldn't be loaded."
                onRetry={() => { void refetchEnrollments(); }}
              />
            ) : null}

            {showInitialLoader ? (
              <TransactionHistorySkeleton rows={5} label="Loading transactions" />
            ) : bothSourcesFailed ? (
              <View>
                <EmptyStateCard
                  variant="error"
                  message="Unable to load transactions. Please try again later."
                />
                <SourceErrorNotice
                  message="One-time payment transaction history"
                  onRetry={() => { void refetchOneTimePayments(); }}
                />
                <SourceErrorNotice
                  message="Enrollment transaction history"
                  onRetry={() => { void refetchEnrollments(); }}
                />
              </View>
            ) : showSearchResultsSkeleton ? (
              <TransactionHistorySkeleton rows={3} label="Searching transactions" />
            ) : isTransactionHistoryEmpty ? (
              <EmptyStateCard
                variant="empty"
                message={searchQuery.trim() ? `No results found for "${searchQuery.trim()}".` : 'No transactions found.'}
              />
            ) : (
              sortedKeys.map((dateKey) => (
                <View key={dateKey}>
                  <DateSeparator date={dateKey} />
                  {groupedTransactions[dateKey].map((item) => (
                    <TransactionItem key={item.key} item={item} />
                  ))}
                </View>
              ))
            )}
          </View>

          {!showInitialLoader && !showSearchResultsSkeleton && isFetching && (
            <InlineLoadingIndicator
              label={oneTimePaymentPage === 1 && enrollmentOffset === 0
                ? 'Refreshing transactions'
                : 'Loading more transactions'}
              style={{ marginVertical: 16 }}
            />
          )}

          {!hasMore && !isFetching && !isTransactionHistoryEmpty && (
            <AppText style={{ textAlign: 'center', marginVertical: 24 }}>
              You&apos;ve reached the bottom of the page
            </AppText>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  },
);

TransactionHistoryComponent.displayName = 'TransactionHistoryComponent';

export default TransactionHistoryComponent;
