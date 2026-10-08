import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import TransactionHistoryComponent from '../../../components/transactions/TransactionHistoryComponent';
import { TRANSACTION_STATUS_TONE_COLORS } from '../../../constants/transaction';

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: (...args: any[]) => mockRouterPush(...args) },
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(() => {
        const cleanup = cb();
        return typeof cleanup === 'function' ? cleanup : undefined;

      }, []);
    },
  };
});

jest.mock('react-native-gesture-handler', () => {
  const RN = require('react-native');
  return {
    TouchableOpacity: RN.TouchableOpacity,
    ScrollView: RN.ScrollView,
  };
});

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

  it('colours each status from the shared transaction palette', () => {
    mockUseGetTransactionsQuery.mockReturnValue({
      data: {
        items: [
          makeTx({ externalTransactionId: 'ext-paid', invoiceReferenceId: 'invoice-paid', status: 'captured' }),
          makeTx({ externalTransactionId: 'ext-pending', invoiceReferenceId: 'invoice-pending', status: 'pending' }),
          makeTx({ externalTransactionId: 'ext-failed', invoiceReferenceId: 'invoice-failed', status: 'failed' }),
          makeTx({ externalTransactionId: 'ext-refunded', invoiceReferenceId: 'invoice-refunded', status: 'refunded' }),
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetchOneTimePayments,
    });

    render(<TransactionHistoryComponent {...defaultProps} />);

    const textColor = (label: RegExp) => StyleSheet.flatten(screen.getByText(label).props.style).color;
    expect(textColor(/Paid/)).toBe(TRANSACTION_STATUS_TONE_COLORS.success.textColor);
    expect(textColor(/Pending/)).toBe(TRANSACTION_STATUS_TONE_COLORS.pending.textColor);
    expect(textColor(/Failed/)).toBe(TRANSACTION_STATUS_TONE_COLORS.failed.textColor);
    expect(textColor(/Refunded/)).toBe(TRANSACTION_STATUS_TONE_COLORS.neutral.textColor);
  });

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

    fireEvent.changeText(screen.getByTestId('transaction-search-input'), 'ENR-PAY-101');

    expect(screen.getByText('Avida Land')).toBeTruthy();
    expect(screen.queryByText(/No results found/)).toBeNull();
  });

  it('shows a searching loader instead of "No results" while a search is still resolving', () => {
    jest.useFakeTimers();

    try {
      render(<TransactionHistoryComponent {...defaultProps} isFilterVisible />);

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

  it('shows the end-of-list message when there are no more pages', () => {

    render(<TransactionHistoryComponent {...defaultProps} />);
    expect(
      screen.getByText("You've reached the bottom of the page"),
    ).toBeTruthy();
  });

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

describe('TransactionHistoryComponent recent preview', () => {
  const previewProps = {
    limit: 3,
    sectionHeader: { title: 'Recent Transactions', linkText: 'View All' },
  };

  const oneTimeResult = (items: ReturnType<typeof makeTx>[] = []) => ({
    data: { items },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mockRefetchOneTimePayments,
  });

  const enrollmentResult = (transactions: ReturnType<typeof makeEnrollmentTx>[] = []) => ({
    data: { transactions, pagination: { offset: 0, limit: 3, total: transactions.length } },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mockRefetchEnrollments,
  });

  const oneTime = (suffix: string, overrides: Record<string, any> = {}) => makeTx({
    externalTransactionId: `ONE-${suffix}`,
    invoiceReferenceId: `INV-${suffix}`,
    merchantName: 'Electric Corp',
    baseAmount: 1500,
    status: 'captured',
    createdAt: '2026-09-20T10:00:00Z',
    ...overrides,
  });

  const autoDebit = (id: number, overrides: Record<string, any> = {}) => makeEnrollmentTx({
    enrollmentTransactionId: id,
    externalTransactionId: `AUTO-${id}`,
    enrollmentReferenceId: `ENR-${id}`,
    merchantName: 'Housing Co',
    baseAmount: 35000,
    paymentStatus: 'paid',
    paymentStatusName: 'Paid',
    createdAt: '2026-09-28T10:00:00Z',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetTransactionsQuery.mockReturnValue(oneTimeResult());
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue(enrollmentResult());
  });

  it('merges both sources, shows only the newest few, and opens each detail route', () => {
    mockUseGetTransactionsQuery.mockReturnValue(oneTimeResult([
      oneTime('NEW', { merchantName: 'Telecom', status: 'pending', createdAt: '2026-10-01T10:00:00Z' }),
      oneTime('OLD'),
    ]));
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue(enrollmentResult([
      autoDebit(201, { paymentStatus: 'declined', paymentStatusName: 'Declined' }),
      autoDebit(202, { merchantName: 'Old Housing', createdAt: '2026-08-01T10:00:00Z' }),
    ]));

    render(<TransactionHistoryComponent {...previewProps} />);

    expect(mockUseGetTransactionsQuery).toHaveBeenCalledWith({ page: 1, count: 3, searchQuery: '' });
    expect(mockUseGetEnrollmentTransactionHistoryQuery).toHaveBeenCalledWith({ page: 0, count: 3, searchQuery: '' });
    expect(screen.getAllByTestId(/^recent-transaction-/).map((row) => row.props.testID)).toEqual([
      'recent-transaction-oneTimePayment:ONE-NEW',
      'recent-transaction-enrollment:201',
      'recent-transaction-oneTimePayment:ONE-OLD',
    ]);
    expect(screen.getByText('Oct 1 • One Time Payment')).toBeTruthy();
    expect(screen.getByText('Sep 28 • Auto Debit')).toBeTruthy();
    expect(screen.getAllByText('−₱ 1,500.00')).toHaveLength(2);
    expect(screen.getByText('−₱ 35,000.00')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.getByText('Failed')).toBeTruthy();
    expect(screen.queryByText('Paid')).toBeNull();
    expect(screen.queryByText('Old Housing')).toBeNull();

    fireEvent.press(screen.getByTestId('recent-transaction-oneTimePayment:ONE-NEW'));
    expect(mockRouterPush).toHaveBeenLastCalledWith({
      pathname: '/transactions/[invoiceReferenceId]',
      params: { invoiceReferenceId: 'INV-NEW', isAutoPay: 'One Time Payment' },
    });

    fireEvent.press(screen.getByTestId('recent-transaction-enrollment:201'));
    expect(mockRouterPush).toHaveBeenLastCalledWith({
      pathname: '/transactions/[invoiceReferenceId]',
      params: { invoiceReferenceId: 'ENR-201', transactionId: 'AUTO-201', transactionType: 'enrollment' },
    });

    fireEvent.press(screen.getByRole('button', { name: 'View All Recent Transactions' }));
    expect(mockRouterPush).toHaveBeenLastCalledWith('/transactions');
  });

  it('is a plain preview: no search, filters, date groups or end-of-list message', () => {
    mockUseGetTransactionsQuery.mockReturnValue(oneTimeResult([oneTime('1')]));

    render(<TransactionHistoryComponent {...previewProps} isFilterVisible />);

    expect(screen.getByTestId('recent-transaction-oneTimePayment:ONE-1')).toBeTruthy();
    expect(screen.queryByTestId('transaction-search-input')).toBeNull();
    expect(screen.queryByTestId('transaction-filter-button')).toBeNull();
    expect(screen.queryByText('September 2026')).toBeNull();
    expect(screen.queryByText(/reached the bottom/)).toBeNull();
  });

  it('shows the empty state, with View All, when both sources have no transactions', () => {
    render(<TransactionHistoryComponent {...previewProps} />);

    expect(screen.getByText('No transactions yet')).toBeTruthy();
    expect(screen.getByText('Your bill payments will appear here.')).toBeTruthy();
    expect(screen.queryAllByTestId(/^recent-transaction-/)).toHaveLength(0);
    expect(screen.getByText('View All')).toBeTruthy();
  });

  it('keeps loaded transactions visible during a background refresh', () => {
    mockUseGetTransactionsQuery.mockReturnValue({ ...oneTimeResult([oneTime('1')]), isFetching: true });

    render(<TransactionHistoryComponent {...previewProps} />);

    expect(screen.getByTestId('recent-transaction-oneTimePayment:ONE-1')).toBeTruthy();
    expect(screen.queryByTestId('recent-transactions-loading')).toBeNull();
  });

  it('shows the section skeleton while either source is loading', () => {
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({
      ...enrollmentResult(),
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    render(<TransactionHistoryComponent {...previewProps} />);

    expect(screen.getByTestId('recent-transactions-loading')).toBeTruthy();
    expect(screen.getByLabelText('Loading recent transactions')).toBeTruthy();
    expect(screen.queryByText('No transactions yet')).toBeNull();
  });

  it('shows a section error and retries both transaction sources', () => {
    mockUseGetTransactionsQuery.mockReturnValue({ ...oneTimeResult(), data: undefined, isError: true });
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({ ...enrollmentResult(), data: undefined, isError: true });

    render(<TransactionHistoryComponent {...previewProps} />);

    expect(screen.getByText('Unable to load recent transactions.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Try loading recent transactions again' }));
    expect(mockRefetchOneTimePayments).toHaveBeenCalledTimes(1);
    expect(mockRefetchEnrollments).toHaveBeenCalledTimes(1);
  });

  it('shows the skeleton again while failed sources are being retried', () => {
    mockUseGetTransactionsQuery.mockReturnValue({ ...oneTimeResult(), data: undefined, isError: true, isFetching: true });
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({ ...enrollmentResult(), data: undefined, isError: true, isFetching: true });

    render(<TransactionHistoryComponent {...previewProps} />);

    expect(screen.getByTestId('recent-transactions-loading')).toBeTruthy();
    expect(screen.queryByText('Unable to load recent transactions.')).toBeNull();
  });

  it('keeps transactions visible when only one source fails, with a retry for that source', () => {
    mockUseGetTransactionsQuery.mockReturnValue(oneTimeResult([oneTime('1')]));
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue({ ...enrollmentResult(), data: undefined, isError: true });

    render(<TransactionHistoryComponent {...previewProps} />);

    expect(screen.getByTestId('recent-transaction-oneTimePayment:ONE-1')).toBeTruthy();
    expect(screen.getByText("Enrollment transactions couldn't be loaded.")).toBeTruthy();
    expect(screen.queryByText('Unable to load recent transactions.')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: "Retry Enrollment transactions couldn't be loaded." }));
    expect(mockRefetchEnrollments).toHaveBeenCalledTimes(1);
    expect(mockRefetchOneTimePayments).not.toHaveBeenCalled();
  });

  it('labels a status it does not recognise instead of calling it Pending', () => {
    mockUseGetTransactionsQuery.mockReturnValue(oneTimeResult([oneTime('1', { status: 'partially_refunded' })]));

    render(<TransactionHistoryComponent {...previewProps} />);

    expect(screen.getByText('Partially Refunded')).toBeTruthy();
    expect(screen.queryByText('Pending')).toBeNull();
  });

  it('colours Pending and Failed from the palette shared with the full history', () => {
    mockUseGetTransactionsQuery.mockReturnValue(oneTimeResult([oneTime('1', { status: 'pending' })]));
    mockUseGetEnrollmentTransactionHistoryQuery.mockReturnValue(enrollmentResult([
      autoDebit(201, { paymentStatus: 'declined', paymentStatusName: 'Declined' }),
    ]));

    render(<TransactionHistoryComponent {...previewProps} />);

    const textColor = (label: string) => StyleSheet.flatten(screen.getByText(label).props.style).color;
    expect(textColor('Pending')).toBe(TRANSACTION_STATUS_TONE_COLORS.pending.textColor);
    expect(textColor('Failed')).toBe(TRANSACTION_STATUS_TONE_COLORS.failed.textColor);
  });
});
