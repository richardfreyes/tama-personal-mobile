import AutoIcon from '@/assets/icons/auto.svg';
import CheckIcon from '@/assets/icons/check.svg';
import FilterIcon from '@/assets/icons/filter.svg';
import SearchInput from '@/components/common/SearchInput';
import { TRANSACTION_HISTORY_PAGE_SIZE, TRANSACTION_STATUS_GROUPS, TRANSACTION_STATUS_TONE_COLORS } from '@/constants/transaction';
import { useGetEnrollmentTransactionHistoryQuery } from '@/redux/features/enrollmentTransactionHistory/enrollmentTransactionHistoryApi';
import { useGetTransactionsQuery } from '@/redux/features/transactions/transactionApi';
import { globalStyle } from '@/styles/common/globals';
import { transactionHistoryComponentStyles as styles } from '@/styles/components/transactions/TransactionHistoryComponent';
import { ComponentsProps, RecentTransactionRowProps, TransactionHistoryRef, TransactionItemProps, TransactionStatusTone, UnifiedTransaction } from '@/types';
import { formatApiDate, getStartOfDay } from '@/utils/date';
import { formatMoney } from '@/utils/format';
import { formatTransactionDebitAmount, formatTransactionStatus, getTransactionStatusBadge, getTransactionStatusTone, mergeTransactions, normalizeEnrollmentTransaction, normalizeOneTimePaymentTransaction, sortTransactionsNewestFirst, transactionMatchesSearch } from '@/utils/transactionHistory';
import { router, useFocusEffect } from 'expo-router';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { AppText } from '../common/AppText';
import EmptyStateCard from '../common/EmptyStateCard';
import { InlineLoadingIndicator, SkeletonBlock, SkeletonGroup, TransactionHistorySkeleton } from '../common/Loading';
import MerchantLogo from '../common/MerchantLogo';
import { SectionHeaderComponent } from '../common/SectionHeaderComponent';
import { SpacerComponent } from '../common/SpacerComponent';

const getStatusText = (item: UnifiedTransaction, tone: TransactionStatusTone): string => {
  if (item.source === 'enrollment') return item.statusLabel;
  if (tone === 'success') return 'Paid';
  if (item.status?.toLowerCase() === 'uncaptured') return 'Pending';
  return formatTransactionStatus(item.statusLabel || item.status || 'Unknown');
};

const getStatusDisplay = (item: UnifiedTransaction) => {
  const tone = getTransactionStatusTone(item);
  return { ...TRANSACTION_STATUS_TONE_COLORS[tone], text: getStatusText(item, tone) };
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

const openTransaction = (item: UnifiedTransaction) => {
  router.push({
    pathname: '/transactions/[invoiceReferenceId]',
    params: item.source === 'enrollment'
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

const DateSeparator = ({ date }: { date: string }) => (
  <AppText weight="bold" variant="bodyMedium" style={styles.dateSeparatorText}>{date}</AppText>
);

const TransactionItem = ({ item }: TransactionItemProps) => {
  const statusDisplay = getStatusDisplay(item);
  const formattedAmount = formatMoney([item.currency, item.amount]);
  const formattedDate = formatApiDate(item.createdAt, 'MM/dd/yy - h:mmaaaa');
  const isEnrollment = item.source === 'enrollment';

  return (
    <TouchableOpacity
      accessibilityHint={`Opens ${item.typeLabel.toLowerCase()} transaction details`}
      accessibilityLabel={`${item.merchantName}, ${item.typeLabel}, ${formattedAmount}`}
      accessibilityRole="button"
      onPress={() => openTransaction(item)}
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
        <View style={[styles.statusDisplay, { backgroundColor: statusDisplay.backgroundColor }]}>
          <View style={[styles.dot, { backgroundColor: statusDisplay.dotColor }]} />
          <AppText style={[styles.dateText, { color: statusDisplay.textColor }]} size="extraSmall">
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

const RecentTransactionRow = ({ transaction }: RecentTransactionRowProps) => {
  const badge = getTransactionStatusBadge(transaction);
  const amount = formatTransactionDebitAmount(transaction);
  const date = formatApiDate(transaction.createdAt, 'MMM d');
  const type = transaction.source === 'enrollment' ? 'Auto Debit' : 'One Time Payment';
  const meta = [date, type].filter(Boolean).join(' • ');
  const initials = transaction.merchantName.trim().slice(0, 2).toUpperCase() || '?';

  return (
    <Pressable
      accessibilityHint="Opens transaction details"
      accessibilityLabel={`${transaction.merchantName}, ${meta}, ${amount}${badge ? `, ${badge.label}` : ''}`}
      accessibilityRole="button"
      onPress={() => openTransaction(transaction)}
      style={styles.recentRow}
      testID={`recent-transaction-${transaction.key}`}
    >
      <MerchantLogo initials={initials} logoUrl={transaction.merchantLogoUrl} />
      <View style={styles.recentDetails}>
        <AppText numberOfLines={1} weight="500" style={styles.recentMerchant}>
          {transaction.merchantName}
        </AppText>
        <AppText numberOfLines={1} style={styles.recentMeta}>{meta}</AppText>
      </View>
      <View style={styles.recentAmountColumn}>
        <AppText numberOfLines={1} weight="600" style={styles.recentAmount}>{amount}</AppText>
        {badge ? (
          <View style={[styles.recentBadge, { backgroundColor: badge.backgroundColor }]}>
            <View style={[styles.recentBadgeDot, { backgroundColor: badge.dotColor }]} />
            <AppText numberOfLines={1} weight="500" style={[styles.recentBadgeText, { color: badge.textColor }]}>
              {badge.label}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const RecentTransactionsSkeleton = ({ count }: { count: number }) => (
  <SkeletonGroup label="Loading recent transactions" style={globalStyle.listCard} testID="recent-transactions-loading">
    {Array.from({ length: count }, (_, index) => (
      <React.Fragment key={index}>
        {index > 0 ? <View style={styles.recentDivider} /> : null}
        <View style={styles.recentRow}>
          <SkeletonBlock borderRadius={12} height={40} style={globalStyle.skeletonOnCard} width={40} />
          <View style={styles.recentSkeletonDetails}>
            <SkeletonBlock height={12} style={globalStyle.skeletonOnCard} width="60%" />
            <SkeletonBlock height={10} style={globalStyle.skeletonOnCard} width="40%" />
          </View>
          <SkeletonBlock height={12} style={globalStyle.skeletonOnCard} width={76} />
        </View>
      </React.Fragment>
    ))}
  </SkeletonGroup>
);

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
  ({ sectionHeader, onOpenFilterSheet, isFilterVisible, activeFilters, limit }, ref) => {
    const pageSize = limit ?? TRANSACTION_HISTORY_PAGE_SIZE;
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
      count: pageSize,
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
      count: pageSize,
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

    const recentTransactions = useMemo(
      () => (limit === undefined ? [] : filteredItems.slice(0, limit)),
      [filteredItems, limit],
    );

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

    const retryFailedSources = () => {
      if (isOneTimePaymentError) void refetchOneTimePayments();
      if (isEnrollmentError) void refetchEnrollments();
    };

    const sourceErrorNotices = (
      <>
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
      </>
    );

    const isSearchResolving = searchQuery.trim() !== debouncedSearch.trim() || isFetching;
    const showSearchResultsSkeleton = (
      isTransactionHistoryEmpty
      && searchQuery.trim().length > 0
      && isSearchResolving
    );

    if (limit !== undefined) {

      const isRetrying = (isOneTimePaymentError || isEnrollmentError) && isFetching && allItems.length === 0;

      return (
        <View style={globalStyle.sectionPanel} testID="recent-transactions">
          <SectionHeaderComponent
            title={sectionHeader?.title}
            linkText={sectionHeader?.linkText}
            onViewAllPress={handleViewAll}
          />
          {sourceErrorNotices}
          {showInitialLoader || isRetrying ? (
            <RecentTransactionsSkeleton count={limit} />
          ) : bothSourcesFailed ? (
            <EmptyStateCard
              message="Unable to load recent transactions."
              onRetry={retryFailedSources}
              retryLabel="Try loading recent transactions again"
              variant="error"
            />
          ) : recentTransactions.length === 0 ? (
            <EmptyStateCard
              icon="clock"
              message="Your bill payments will appear here."
              title="No transactions yet"
              variant="empty"
            />
          ) : (
            <View style={globalStyle.listCard}>
              {recentTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.key}>
                  {index > 0 ? <View style={styles.recentDivider} /> : null}
                  <RecentTransactionRow transaction={transaction} />
                </React.Fragment>
              ))}
            </View>
          )}
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={globalStyle.sectionPanel}>
          <SectionHeaderComponent
            title={sectionHeader?.title}
            linkText={sectionHeader?.linkText}
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

            {sourceErrorNotices}

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
