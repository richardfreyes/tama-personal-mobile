import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import TransactionHistoryComponent from '../../../components/transactions/TransactionHistoryComponent';

// --- expo-router: provide router + useFocusEffect (not in the global mock) ---
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: (...args: any[]) => mockRouterPush(...args) },
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(() => {
        const cleanup = cb();
        return typeof cleanup === 'function' ? cleanup : undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    },
  };
});

// --- gesture-handler: the global mock omits TouchableOpacity, so provide it ---
jest.mock('react-native-gesture-handler', () => {
  const RN = require('react-native');
  return {
    TouchableOpacity: RN.TouchableOpacity,
    ScrollView: RN.ScrollView,
  };
});

// --- RTK Query hook ---
const mockUseGetTransactionsQuery = jest.fn();
const mockUseGetEnrollmentTransactionHistoryQuery = jest.fn();
const mockRefetchOneTimePayments = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
const mockRefetchEnrollments = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
jest.mock('@/redux/features/transactions/transactionApi', () => ({
  useGetTransactionsQuery: (...args: any[]) => mockUseGetTransactionsQuery(...args),
}));
jest.mock('@/redux/features/enrollmentTransactionHistory/enrollmentTransactionHistoryApi', () => ({
  useGetEnrollmentTransactionHistoryQuery: (...args: any[]) => (
    mockUseGetEnrollmentTransactionHistoryQuery(...args)
  ),
}));

const makeTx = (overrides: Record<string, any> = {}) => ({
  invoiceReferenceId: 'QW-I-001',
  externalTransactionId: 'ext-001',
  merchantName: 'Electric Corp',
  billingName: 'October Bill',
  baseCurrency: 'PHP',
  baseAmount: 4000,
  status: 'captured',
  type: 'OneTime',
  createdAt: '2025-10-23T10:00:00Z',
  ...overrides,
});

const makeEnrollmentTx = (overrides: Record<string, any> = {}) => ({
  enrollmentTransactionId: 101,
  externalTransactionId: 'enr-ext-101',
  enrollmentReferenceId: 'QW-E-101',
  enrollmentStatus: 'ONGOING',
  merchantId: 10,
  merchantCode: 'avida',
  merchantName: 'Avida Land',
  invoiceId: 501,
  invoiceReferenceId: 'ENR-INV-101',
  paymentReferenceId: 'ENR-PAY-101',
  paymentStatus: 'PAID',
  paymentStatusName: 'Paid',
  description: 'Monthly Amortization',
  customerName: 'Ada Lovelace',
  baseCurrency: 'PHP',
  baseAmount: 25000,
  convertedCurrency: null,
  convertedAmount: null,
  feeCurrency: 'PHP',
  feeAmount: 500,
  totalCurrency: 'PHP',
  totalAmount: 25500,
  processorCode: null,
  dueAt: null,
  submittedAt: null,
  paidAt: '2025-11-16T00:00:00Z',
  createdAt: '2025-11-15T10:00:00Z',
  updatedAt: '2025-11-16T00:00:00Z',
  ...overrides,
});

const defaultProps = {
  sectionHeader: { title: 'Transactions', linkText: 'View All' },
  onOpenFilterSheet: jest.fn(),
  isFilterVisible: false,
  activeFilters: undefined,
};

const successOneItem = {
  data: { items: [makeTx()] },
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: mockRefetchOneTimePayments,
};

describe('TransactionHistoryComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetTransactionsQuery.mockReturnValue(successOneItem);
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: {
        transactions: [],
        pagination: { offset: 0, limit: 10, total: 0 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchEnrollments,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Loading ----

  it('shows the initial loader while loading with no items', () => {
    mockUseGetTransactionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: mockRefetchOneTimePayments,
    });
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(screen.getByTestId('transaction-history-skeleton')).toBeTruthy();
  });

  // ---- Error ----

  it('shows the error state when the query fails', () => {
    mockUseGetTransactionsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mockRefetchOneTimePayments,
    });
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mockRefetchEnrollments,
    });
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(
      screen.getByText('Unable to load transactions. Please try again later.'),
    ).toBeTruthy();
  });

  // ---- Empty ----

  it('shows the default empty message when there are no transactions', () => {
    mockUseGetTransactionsQuery.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchOneTimePayments,
    });
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(screen.getByText('No transactions found.')).toBeTruthy();
  });

  // ---- Success rendering ----

  it('renders the section title', () => {
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(screen.getByText('Transactions')).toBeTruthy();
  });

  it('renders a transaction item with merchant, bill name and amount', () => {
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(screen.getByText('Electric Corp')).toBeTruthy();
    expect(screen.getByText('October Bill')).toBeTruthy();
    expect(screen.getByText('PHP 4,000.00')).toBeTruthy();
  });

  it('renders the merchant logo when the transaction provides one', () => {
    mockUseGetTransactionsQuery.mockReturnValue({
      data: { items: [makeTx({ merchantLogoUrl: 'https://cdn.example.com/electric.png' })] },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchOneTimePayments,
    });
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(screen.getByTestId('transaction-logo-oneTimePayment:ext-001')).toBeTruthy();
    expect(screen.queryByTestId('transaction-initial-oneTimePayment:ext-001')).toBeNull();
  });

  it('falls back to the merchant initial when no logo is provided', () => {
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(screen.getByTestId('transaction-initial-oneTimePayment:ext-001')).toBeTruthy();
    expect(screen.getByText('E')).toBeTruthy();
    expect(screen.queryByTestId('transaction-logo-oneTimePayment:ext-001')).toBeNull();
  });

  it('merges enrollment and one-time payments with distinct badges', () => {
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: {
        transactions: [makeEnrollmentTx()],
        pagination: { offset: 0, limit: 10, total: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchEnrollments,
    });

    render(<TransactionHistoryComponent {...defaultProps} />);

    expect(screen.getByText('Avida Land')).toBeTruthy();
    expect(screen.getByText('Monthly Amortization')).toBeTruthy();
    expect(screen.getByText('PHP 25,000.00')).toBeTruthy();
    expect(screen.getByLabelText('Transaction type: Enrollment')).toBeTruthy();
    expect(screen.getByLabelText('Transaction type: One Time Payment')).toBeTruthy();
    expect(screen.getByText('November 2025')).toBeTruthy();
    expect(screen.getByText('October 2025')).toBeTruthy();
  });

  it('groups transactions under a month/year date separator', () => {
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(screen.getByText('October 2025')).toBeTruthy();
  });

  it('renders the Paid status for captured transactions', () => {
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(screen.getByText(/Paid/)).toBeTruthy();
  });

  it('renders the Pending status for uncaptured transactions', () => {
    mockUseGetTransactionsQuery.mockReturnValue({
      data: { items: [makeTx({ status: 'uncaptured' })] },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchOneTimePayments,
    });
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(screen.getByText(/Pending/)).toBeTruthy();
  });

  it('renders pending and failed one-time statuses from the backend correctly', () => {
    mockUseGetTransactionsQuery.mockReturnValue({
      data: {
        items: [
          makeTx({
            externalTransactionId: 'ext-pending',
            invoiceReferenceId: 'invoice-pending',
            status: 'pending',
          }),
          makeTx({
            externalTransactionId: 'ext-failed',
            invoiceReferenceId: 'invoice-failed',
            status: 'failed',
          }),
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchOneTimePayments,
    });

    render(<TransactionHistoryComponent {...defaultProps} />);

    expect(screen.getByText(/Pending/)).toBeTruthy();
    expect(screen.getByText(/Failed/)).toBeTruthy();
    expect(screen.queryByText(/Paid/)).toBeNull();
  });

  // ---- Search bar (filter visibility) ----

  it('hides the search bar when isFilterVisible is false', () => {
    render(<TransactionHistoryComponent {...defaultProps} isFilterVisible={false} />);
    expect(
      screen.queryByPlaceholderText('Search ID, Merchant, Bill Name'),
    ).toBeNull();
  });

  it('shows the search bar when isFilterVisible is true', () => {
    render(<TransactionHistoryComponent {...defaultProps} isFilterVisible />);
    expect(
      screen.getByPlaceholderText('Search ID, Merchant, Bill Name'),
    ).toBeTruthy();
  });

  it('filters transactions by ID, merchant, and bill name while typing', () => {
    mockUseGetTransactionsQuery.mockReturnValue({
      data: {
        items: [
          makeTx(),
          makeTx({
            billingName: 'November Water Bill',
            externalTransactionId: 'water-ext-002',
            invoiceReferenceId: 'QW-I-WATER-002',
            merchantName: 'Water Utility',
          }),
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchOneTimePayments,
    });

    render(<TransactionHistoryComponent {...defaultProps} isFilterVisible />);

    fireEvent.changeText(screen.getByTestId('transaction-search-input'), 'water');

    expect(screen.getByText('Water Utility')).toBeTruthy();
    expect(screen.queryByText('Electric Corp')).toBeNull();
  });

  it('searches enrollment fields and filters paid enrollment status as successful', () => {
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: {
        transactions: [makeEnrollmentTx()],
        pagination: { offset: 0, limit: 10, total: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchEnrollments,
    });

    render(
      <TransactionHistoryComponent
        {...defaultProps}
        activeFilters={{
          statusFilters: ['successful'],
          transactionTypeFilters: [],
          createdAtRange: '',
          project: '',
          paymentType: '',
        }}
        isFilterVisible
      />,
    );

    fireEvent.changeText(screen.getByTestId('transaction-search-input'), 'Ada Lovelace');
    expect(screen.getByText('Avida Land')).toBeTruthy();
  });

  it('keeps an enrollment visible when searching by its payment reference id', () => {
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: {
        transactions: [makeEnrollmentTx()],
        pagination: { offset: 0, limit: 10, total: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchEnrollments,
    });

    render(<TransactionHistoryComponent {...defaultProps} isFilterVisible />);

    // "ENR-PAY-101" is the paymentReferenceId surfaced as the detail "Reference ID".
    fireEvent.changeText(screen.getByTestId('transaction-search-input'), 'ENR-PAY-101');

    expect(screen.getByText('Avida Land')).toBeTruthy();
    expect(screen.queryByText(/No results found/)).toBeNull();
  });

  it('shows a searching loader instead of "No results" while a search is still resolving', () => {
    jest.useFakeTimers();

    try {
      render(<TransactionHistoryComponent {...defaultProps} isFilterVisible />);

      // No loaded item matches; before the debounce fires the client filter is
      // empty but the server search has not resolved, so it must not flash empty.
      fireEvent.changeText(screen.getByTestId('transaction-search-input'), 'ZZZ-NOMATCH');

      expect(screen.getByTestId('transaction-history-skeleton')).toBeTruthy();
      expect(screen.queryByText(/No results found/)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('shows the "No results" message once a search settles with no matches', () => {
    jest.useFakeTimers();

    try {
      mockUseGetTransactionsQuery.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: mockRefetchOneTimePayments,
      });
      mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
        data: { transactions: [], pagination: { offset: 0, limit: 10, total: 0 } },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: mockRefetchEnrollments,
      });

      render(<TransactionHistoryComponent {...defaultProps} isFilterVisible />);
      fireEvent.changeText(screen.getByTestId('transaction-search-input'), 'ZZZ-NOMATCH');

      // Past the debounce with both sources reporting not-fetching: search settled.
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(screen.getByText('No results found for "ZZZ-NOMATCH".')).toBeTruthy();
      expect(screen.queryByTestId('transaction-history-skeleton')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('filters the unified list to enrollment transactions', () => {
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: {
        transactions: [makeEnrollmentTx()],
        pagination: { offset: 0, limit: 10, total: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchEnrollments,
    });

    render(
      <TransactionHistoryComponent
        {...defaultProps}
        activeFilters={{
          statusFilters: [],
          transactionTypeFilters: ['enrollment'],
          createdAtRange: '',
          project: '',
          paymentType: '',
        }}
      />,
    );

    expect(screen.getByText('Avida Land')).toBeTruthy();
    expect(screen.queryByText('Electric Corp')).toBeNull();
  });

  it('filters the unified list to one-time payment transactions', () => {
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: {
        transactions: [makeEnrollmentTx()],
        pagination: { offset: 0, limit: 10, total: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchEnrollments,
    });

    render(
      <TransactionHistoryComponent
        {...defaultProps}
        activeFilters={{
          statusFilters: [],
          transactionTypeFilters: ['oneTimePayment'],
          createdAtRange: '',
          project: '',
          paymentType: '',
        }}
      />,
    );

    expect(screen.getByText('Electric Corp')).toBeTruthy();
    expect(screen.queryByText('Avida Land')).toBeNull();
  });

  it('sends the search term to the transaction query after the debounce', () => {
    jest.useFakeTimers();

    try {
      render(<TransactionHistoryComponent {...defaultProps} isFilterVisible />);

      fireEvent.changeText(screen.getByTestId('transaction-search-input'), 'QW-I-001');
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockUseGetTransactionsQuery).toHaveBeenLastCalledWith({
        count: 10,
        page: 1,
        searchQuery: 'QW-I-001',
      });
      expect(mockUseGetEnrollmentTransactionHistoryQuery).toHaveBeenLastCalledWith({
        count: 10,
        page: 0,
        searchQuery: 'QW-I-001',
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('calls onOpenFilterSheet when the filter icon is pressed', () => {
    const onOpenFilterSheet = jest.fn();
    render(
      <TransactionHistoryComponent
        {...defaultProps}
        isFilterVisible
        onOpenFilterSheet={onOpenFilterSheet}
      />,
    );
    fireEvent.press(screen.getByTestId('transaction-filter-button'));
    expect(onOpenFilterSheet).toHaveBeenCalledTimes(1);
  });

  // ---- Navigation ----

  it('navigates to the transactions list on View All press', () => {
    render(<TransactionHistoryComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('View All'));
    expect(mockRouterPush).toHaveBeenCalledWith('/transactions');
  });

  it('navigates to the transaction detail on item press', () => {
    render(<TransactionHistoryComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('Electric Corp'));
    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/transactions/[invoiceReferenceId]',
        params: expect.objectContaining({ invoiceReferenceId: 'QW-I-001' }),
      }),
    );
  });

  it('opens enrollment items through the enrollment transaction detail branch', () => {
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: {
        transactions: [makeEnrollmentTx()],
        pagination: { offset: 0, limit: 10, total: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchEnrollments,
    });

    render(<TransactionHistoryComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('Avida Land'));

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: '/transactions/[invoiceReferenceId]',
      params: {
        invoiceReferenceId: 'QW-E-101',
        transactionId: 'enr-ext-101',
        transactionType: 'enrollment',
      },
    });
  });

  it('keeps one source visible when the other fails and retries only the failed source', () => {
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mockRefetchEnrollments,
    });

    render(<TransactionHistoryComponent {...defaultProps} />);

    expect(screen.getByText('Electric Corp')).toBeTruthy();
    expect(screen.getByText("Enrollment transactions couldn't be loaded.")).toBeTruthy();
    fireEvent.press(screen.getByText('Retry'));
    expect(mockRefetchEnrollments).toHaveBeenCalledTimes(1);
    expect(mockRefetchOneTimePayments).not.toHaveBeenCalled();
  });

  // ---- Pagination footer ----

  it('shows the end-of-list message when there are no more pages', () => {
    // Fewer than LIMIT (10) items => hasMore becomes false after load.
    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(
      screen.getByText("You've reached the bottom of the page"),
    ).toBeTruthy();
  });

  // ---- Imperative ref ----

  it('exposes a loadMore method via ref that advances the page', () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      makeTx({
        invoiceReferenceId: `QW-I-${i}`,
        externalTransactionId: `ext-${i}`,
      }),
    );
    mockUseGetTransactionsQuery.mockReturnValue({
      data: { items },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchOneTimePayments,
    });
    const ref = React.createRef<any>();
    render(<TransactionHistoryComponent {...defaultProps} ref={ref} />);

    expect(typeof ref.current.loadMore).toBe('function');

    act(() => {
      ref.current.loadMore();
    });

    const calledWithPageTwo = mockUseGetTransactionsQuery.mock.calls.some(
      (call) => (call[0] as any)?.page === 2,
    );
    expect(calledWithPageTwo).toBe(true);
  });

  it('refreshes both transaction sources', async () => {
    const ref = React.createRef<any>();
    render(<TransactionHistoryComponent {...defaultProps} ref={ref} />);

    await act(async () => {
      await ref.current.refresh();
    });

    expect(mockRefetchOneTimePayments).toHaveBeenCalledTimes(1);
    expect(mockRefetchEnrollments).toHaveBeenCalledTimes(1);
  });

  it('paginates both sources using their native page semantics', () => {
    const paymentItems = Array.from({ length: 10 }, (_, index) => makeTx({
      invoiceReferenceId: `QW-I-${index}`,
      externalTransactionId: `ext-${index}`,
    }));
    const enrollmentItems = Array.from({ length: 10 }, (_, index) => makeEnrollmentTx({
      enrollmentTransactionId: index,
      externalTransactionId: `enrollment-${index}`,
    }));
    mockUseGetTransactionsQuery.mockReturnValue({
      data: { items: paymentItems },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchOneTimePayments,
    });
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      data: {
        transactions: enrollmentItems,
        pagination: { offset: 0, limit: 10, total: 20 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchEnrollments,
    });
    const ref = React.createRef<any>();
    render(<TransactionHistoryComponent {...defaultProps} ref={ref} />);

    act(() => {
      ref.current.loadMore();
    });

    expect(mockUseGetTransactionsQuery.mock.calls.some(
      (call) => (call[0] as any)?.page === 2,
    )).toBe(true);
    expect(mockUseGetEnrollmentTransactionHistoryQuery.mock.calls.some(
      (call) => (call[0] as any)?.page === 10,
    )).toBe(true);
  });
});
