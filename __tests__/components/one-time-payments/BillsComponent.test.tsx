import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import BillsComponent from '../../../components/one-time-payments/BillsComponent';
import { renderWithProviders } from '../../../utils/test-utils';

const mockUseGetBillersQuery = jest.fn();
const mockUseGetBillsQuery = jest.fn<(...args: any[]) => any>();
const mockUseAllSavedBills = jest.fn<(...args: any[]) => any>();

jest.mock('@/hooks/useAllSavedBills', () => ({
  useAllSavedBills: (options: unknown) => mockUseAllSavedBills(options),
}));

jest.mock('@/redux/features/biller/billerApi', () => ({
  useGetBillersQuery: (...args: any[]) => mockUseGetBillersQuery(...args),
}));

jest.mock('@/redux/features/bills/billsApi', () => ({
  useGetBillsQuery: (...args: any[]) => mockUseGetBillsQuery(...args),
}));

const mockBillers = [
  {
    merchant_id: 1,
    merchant_name: 'Electric Corp',
    merchant_logo_url: 'https://example.com/logo1.png',
    merchant_code: 'ELEC',
    address_one: '',
    address_two: '',
    address_three: '',
    created_at: '',
    is_active: true,
    is_public: true,
    merchant_status: 'active',
    merchant_timezone: '',
    updated_at: '',
  },
  {
    merchant_id: 2,
    merchant_name: 'Water Utils',
    merchant_logo_url: 'https://example.com/logo2.png',
    merchant_code: 'WATER',
    address_one: '',
    address_two: '',
    address_three: '',
    created_at: '',
    is_active: true,
    is_public: true,
    merchant_status: 'active',
    merchant_timezone: '',
    updated_at: '',
  },
];

const mockBills = [
  {
    billing_id: 101,
    billing_name: 'My Electric Bill',
    billing_reference_id: 'ref-001',
    billing_type: 'utility',
    client_notes: '',
    custom_fields: { amount: { text: 'Amount', value: '₱1,500.00' } },
    customer_id: 1,
    merchant_category_name: 'Utilities',
    merchant_id: 1,
    merchant_name: 'Electric Corp',
    payment_type_id: 1,
    project_id: 1,
  },
  {
    billing_id: 102,
    billing_name: 'My Water Bill',
    billing_reference_id: 'ref-002',
    billing_type: 'utility',
    client_notes: '',
    custom_fields: { amount: { text: 'Amount', value: '₱800.00' } },
    customer_id: 1,
    merchant_category_name: 'Utilities',
    merchant_id: 2,
    merchant_name: 'Water Utils',
    payment_type_id: 1,
    project_id: 1,
  },
];

const defaultProps = {
  sectionHeader: { title: 'My Bills', linkText: 'View All' },
  sectionFooter: { button: true },
};

const successBillers = {
  data: mockBillers,
  isLoading: false,
  isError: false,
  error: null,
};

const successBills = {
  data: mockBills,
  isLoading: false,
  isError: false,
  error: null,
};

describe('BillsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetBillersQuery.mockReturnValue(successBillers);
    mockUseGetBillsQuery.mockReturnValue(successBills);
    mockUseAllSavedBills.mockImplementation(({ skip }: { skip: boolean }) => {
      if (skip) {
        return { bills: [], isLoading: false, isFetching: false, isError: false, refetch: jest.fn() };
      }

      const query = mockUseGetBillsQuery({ page: 0 });
      return {
        bills: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        refetch: query.refetch ?? jest.fn(),
      };
    });
  });

  it('shows loading indicator when billers are loading', () => {
    mockUseGetBillersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('My Bills')).toBeTruthy();
    expect(screen.getByTestId('bills-loading')).toBeTruthy();
    expect(screen.queryByText('My Electric Bill')).toBeNull();
  });

  it('shows loading indicator when bills are loading', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('My Bills')).toBeTruthy();
    expect(screen.getByTestId('bills-loading')).toBeTruthy();
    expect(screen.queryByText('My Electric Bill')).toBeNull();
  });

  it('shows loading indicator when both queries are loading', () => {
    mockUseGetBillersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('My Bills')).toBeTruthy();
    expect(screen.getByTestId('bills-loading')).toBeTruthy();
  });

  it('shows error message when billers query fails', () => {
    mockUseGetBillersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: 'Server Error' },
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('Unable to load your billers.')).toBeTruthy();
  });

  it('hides bill cards when billers query has error', () => {
    mockUseGetBillersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: 'Server Error' },
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.queryByText('My Electric Bill')).toBeNull();
    expect(screen.queryByText('My Water Bill')).toBeNull();
  });

  it('hides footer buttons when billers query has error', () => {
    mockUseGetBillersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: 'Server Error' },
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.queryByText('Pay Now')).toBeNull();
  });

  it('shows empty state when bills data is an empty array', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('No one-time payments yet')).toBeTruthy();
    expect(screen.getByText('Billers you add for one-time payments will show up here.')).toBeTruthy();
  });

  it('shows empty state when bills data is null', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('No one-time payments yet')).toBeTruthy();
    expect(screen.getByText('Billers you add for one-time payments will show up here.')).toBeTruthy();
  });

  it('shows empty state when bills data is undefined', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('No one-time payments yet')).toBeTruthy();
    expect(screen.getByText('Billers you add for one-time payments will show up here.')).toBeTruthy();
  });

  it('shows error state when bills query fails', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: 'Server Error' },
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('Unable to load your billers.')).toBeTruthy();
    expect(screen.queryByText('Pay Now')).toBeNull();
  });

  it('retries both queries from the error state', () => {
    const billsRefetch = jest.fn(() => Promise.resolve());
    const billersRefetch = jest.fn(() => Promise.resolve());
    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 500, data: 'Server Error' },
      refetch: billsRefetch,
    });
    mockUseGetBillersQuery.mockReturnValue({ ...successBillers, refetch: billersRefetch });
    renderWithProviders(<BillsComponent {...defaultProps} />);

    fireEvent.press(screen.getByRole('button', { name: 'Try loading your billers again' }));
    expect(billsRefetch).toHaveBeenCalledTimes(1);
    expect(billersRefetch).toHaveBeenCalledTimes(1);
  });

  it('shows the skeleton again while a failed request is being retried', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: true,
      isError: true,
      error: { status: 500, data: 'Server Error' },
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);

    expect(screen.getByTestId('bills-loading')).toBeTruthy();
    expect(screen.queryByText('Unable to load your billers.')).toBeNull();
  });

  it('renders bill cards with billing names', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('My Electric Bill')).toBeTruthy();
    expect(screen.getByText('My Water Bill')).toBeTruthy();
  });

  it('does not render duplicate saved bills', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [mockBills[0], { ...mockBills[0], billing_name: 'Duplicate Bill' }],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);

    expect(screen.getAllByText('My Electric Bill')).toHaveLength(1);
    expect(screen.queryByText('Duplicate Bill')).toBeNull();
  });

  it('renders merchant names on bill cards', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('Electric Corp')).toBeTruthy();
    expect(screen.getByText('Water Utils')).toBeTruthy();
  });

  it('renders amount values on bill cards', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('₱ 1,500.00')).toBeTruthy();
    expect(screen.getByText('₱ 800.00')).toBeTruthy();
  });

  it('formats pesos to two decimals and keeps foreign or missing amounts as they are', () => {
    const billWithAmount = (id: number, amount?: string) => ({
      ...mockBills[0],
      billing_id: id,
      billing_reference_id: `ref-amount-${id}`,
      billing_name: `Bill ${id}`,
      custom_fields: amount === undefined ? {} : { amount: { text: 'Amount', value: amount } },
    });
    mockUseGetBillsQuery.mockReturnValue({
      ...successBills,
      data: [billWithAmount(1, '₱1,750'), billWithAmount(2, 'USD 25.5'), billWithAmount(3)],
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);

    expect(screen.getByText('₱ 1,750.00')).toBeTruthy();
    expect(screen.getByText('USD 25.5')).toBeTruthy();
    expect(screen.getByText('Enter amount')).toBeTruthy();
  });

  it('renders bill card without crashing when biller has no matching logo', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [{ ...mockBills[0], merchant_id: 999 }],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('My Electric Bill')).toBeTruthy();
  });

  it('shows a biller logo when the biller has one and falls back to initials otherwise', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [mockBills[0], { ...mockBills[1], merchant_id: 999 }],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);

    expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(1);
    expect(screen.UNSAFE_getByType(Image).props.source).toEqual({ uri: 'https://example.com/logo1.png' });
    expect(screen.getByText('WU')).toBeTruthy();
  });

  it('renders section header title', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('My Bills')).toBeTruthy();
  });

  it('shows section header linkText when bills exist', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('View All')).toBeTruthy();
  });

  it('keeps section header linkText when bills list is empty', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('View All')).toBeTruthy();
  });

  it('shows Pay Now button when sectionFooter.button is true', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('Pay Now')).toBeTruthy();
  });

  it('offers Add Biller but not Pay Now while there are no saved bills', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);

    expect(screen.queryByText('Pay Now')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Add Biller' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments',
      params: { view: 'add' },
    });
  });

  it('hides Pay Now button when sectionFooter.button is false', () => {
    renderWithProviders(
      <BillsComponent
        {...defaultProps}
        sectionFooter={{ button: false }}
      />,
    );
    expect(screen.queryByText('Pay Now')).toBeNull();
  });

  it('hides Pay Now button when sectionFooter is undefined', () => {
    renderWithProviders(
      <BillsComponent sectionHeader={defaultProps.sectionHeader} />,
    );
    expect(screen.queryByText('Pay Now')).toBeNull();
  });

  it('navigates to bill payment screen on bill card press', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('My Electric Bill'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
      params: {
        billingReferenceId: 'ref-001',
        merchantName: 'Electric Corp',
      },
    });
  });

  it('navigates with correct params for a different bill card', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('My Water Bill'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
      params: {
        billingReferenceId: 'ref-002',
        merchantName: 'Water Utils',
      },
    });
  });

  it('opens the One Time Payments screen on View All press', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('View All'));
    expect(router.push).toHaveBeenCalledWith('/bills/one-time-payments');
  });

  it('uses the screen View All handler when supplied', () => {
    const onViewAllPress = jest.fn();
    renderWithProviders(
      <BillsComponent
        {...defaultProps}
        onViewAllPress={onViewAllPress}
      />,
    );

    fireEvent.press(screen.getByText('View All'));
    expect(onViewAllPress).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();
  });

  it('opens the add-biller view from Add Biller', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('Add Biller'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments',
      params: { view: 'add' },
    });
  });

  it('opens the saved-bills view from Pay Now', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('Pay Now'));
    expect(router.push).toHaveBeenCalledWith('/bills/one-time-payments/saved');
  });

  it('uses dashboard action handlers immediately when supplied', () => {
    const onAddBillerPress = jest.fn();
    const onPayNowPress = jest.fn();
    renderWithProviders(
      <BillsComponent
        {...defaultProps}
        onAddBillerPress={onAddBillerPress}
        onPayNowPress={onPayNowPress}
      />,
    );

    fireEvent.press(screen.getByText('Add Biller'));
    expect(onAddBillerPress).toHaveBeenCalledTimes(1);
    expect(onPayNowPress).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Pay Now'));
    expect(onPayNowPress).toHaveBeenCalledTimes(1);
  });

  it('calls useGetBillersQuery with empty params', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(mockUseGetBillersQuery).toHaveBeenCalledWith({});
  });

  it('calls useGetBillsQuery with page 0', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(mockUseGetBillsQuery).toHaveBeenCalledWith({ page: 0 }, { skip: false });
  });

  describe('plain variant', () => {
    const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
    const plainProps = {
      sectionHeader: { title: 'Saved billers', linkText: 'Manage' },
      variant: 'plain' as const,
    };
    const billWith = (index: number, overrides: Record<string, unknown> = {}) => ({
      ...mockBills[0],
      billing_id: 200 + index,
      billing_reference_id: `ref-plain-${index}`,
      billing_name: `Bill ${index}`,
      ...overrides,
    });

    it('shows how many billers are saved beside the title, with a Manage link', () => {
      renderWithProviders(<BillsComponent {...plainProps} />);

      expect(screen.getByText('Saved billers')).toBeTruthy();
      expect(screen.getByTestId('section-header-count')).toBeTruthy();
      expect(screen.getByText('2')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Manage Saved billers' })).toBeTruthy();
    });

    it('includes saved billers beyond the first page in the count and carousel', () => {
      mockUseAllSavedBills.mockReturnValue({
        bills: [...mockBills, billWith(3)],
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: jest.fn(),
      });
      renderWithProviders(<BillsComponent {...plainProps} />);

      expect(screen.getByText('3')).toBeTruthy();
      expect(screen.getAllByTestId(/^biller-card-/)).toHaveLength(3);
    });

    it('sits flat on the page rather than in a section panel', () => {
      renderWithProviders(<BillsComponent {...plainProps} />);

      const section = StyleSheet.flatten(screen.getByTestId('bills-section').props.style);
      expect(section.backgroundColor).toBeUndefined();
      expect(section).toEqual(expect.objectContaining({ paddingHorizontal: 20, paddingTop: 8 }));
    });

    it('keeps the panel around the panel layout', () => {
      renderWithProviders(<BillsComponent {...defaultProps} />);

      expect(StyleSheet.flatten(screen.getByTestId('bills-section').props.style)).toEqual(
        expect.objectContaining({ backgroundColor: '#FCFBFB', borderRadius: 24 }),
      );
    });

    it('opens the saved bills from Manage', () => {
      const onViewAllPress = jest.fn();
      renderWithProviders(<BillsComponent {...plainProps} onViewAllPress={onViewAllPress} />);

      fireEvent.press(screen.getByText('Manage'));
      expect(onViewAllPress).toHaveBeenCalledTimes(1);
    });

    it('leaves out the due summary and the status when the API reports neither', () => {
      renderWithProviders(<BillsComponent {...plainProps} />);

      expect(screen.queryByTestId('due-summary-strip')).toBeNull();
      expect(screen.queryByTestId('biller-status-due')).toBeNull();
      expect(screen.queryByTestId('biller-status-overdue')).toBeNull();
    });

    it('keeps saved cards visible when biller logos cannot be loaded', () => {
      mockUseGetBillersQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true, isFetching: false });
      renderWithProviders(<BillsComponent {...plainProps} />);

      expect(screen.getAllByTestId(/^biller-card-/)).toHaveLength(2);
      expect(screen.queryByText('Unable to load your billers.')).toBeNull();
    });

    it('summarises what is due and lists the most urgent biller first', () => {
      mockUseGetBillsQuery.mockReturnValue({
        ...successBills,
        data: [
          billWith(1, { custom_fields: { amount: { text: 'Amount', value: '₱8,450' } }, date_paid: daysFromNow(-5) }),
          billWith(2, { custom_fields: { amount: { text: 'Amount', value: '₱10,000' } }, due_date: daysFromNow(2) }),
          billWith(3, { custom_fields: { amount: { text: 'Amount', value: '₱32,321' } }, due_date: daysFromNow(-3) }),
        ],
      });
      renderWithProviders(<BillsComponent {...plainProps} />);

      expect(screen.getByText('2 bills to pay · 1 overdue')).toBeTruthy();
      expect(screen.getByText('₱ 42,321.00')).toBeTruthy();
      expect(screen.getByText('Next: Bill 2', { exact: false })).toBeTruthy();
      const order = screen.getAllByTestId(/^biller-card-/).map((card) => card.props.testID);
      expect(order).toEqual(['biller-card-ref-plain-3', 'biller-card-ref-plain-2', 'biller-card-ref-plain-1']);
      expect(screen.getByText('Overdue 3 days')).toBeTruthy();
      expect(screen.getByText(/^Paid /)).toBeTruthy();
    });

    it('keeps the order of the API for the panel layout', () => {
      mockUseGetBillsQuery.mockReturnValue({
        ...successBills,
        data: [billWith(1, { date_paid: daysFromNow(-5) }), billWith(2, { due_date: daysFromNow(-3) })],
      });
      renderWithProviders(<BillsComponent {...defaultProps} />);

      const order = screen.getAllByTestId(/^biller-card-/).map((card) => card.props.testID);
      expect(order).toEqual(['biller-card-ref-plain-1', 'biller-card-ref-plain-2']);
    });

    it('invites the user to save a biller when there are none, without a count or Manage', () => {
      mockUseGetBillsQuery.mockReturnValue({ data: [], isLoading: false, isError: false, error: null });
      renderWithProviders(<BillsComponent {...plainProps} />);

      expect(screen.getByText('No saved billers yet')).toBeTruthy();
      expect(screen.getByText('Billers you save will appear here for one-tap payments.')).toBeTruthy();
      expect(screen.queryByTestId('section-header-count')).toBeNull();
      expect(screen.queryByText('Manage')).toBeNull();
      expect(screen.queryByTestId('due-summary-strip')).toBeNull();
    });

    it('shows the skeleton while loading', () => {
      mockUseGetBillsQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null });
      renderWithProviders(<BillsComponent {...plainProps} />);

      expect(screen.getByTestId('bills-loading')).toBeTruthy();
      expect(screen.queryByText('Manage')).toBeNull();
    });

    it('offers to retry when the billers cannot be loaded', () => {
      const billsRefetch = jest.fn(() => Promise.resolve());
      const billersRefetch = jest.fn(() => Promise.resolve());
      mockUseGetBillsQuery.mockReturnValue({
        data: undefined, isLoading: false, isFetching: false, isError: true, error: { status: 500 }, refetch: billsRefetch,
      });
      mockUseGetBillersQuery.mockReturnValue({ ...successBillers, refetch: billersRefetch });
      renderWithProviders(<BillsComponent {...plainProps} />);

      expect(screen.getByText('Unable to load your billers.')).toBeTruthy();
      expect(screen.queryByTestId('section-header-count')).toBeNull();
      fireEvent.press(screen.getByRole('button', { name: 'Try loading your billers again' }));
      expect(billsRefetch).toHaveBeenCalledTimes(1);
      expect(billersRefetch).not.toHaveBeenCalled();
    });

    it('has no Add Biller or Pay Now buttons', () => {
      renderWithProviders(<BillsComponent {...plainProps} sectionFooter={{ button: true }} />);

      expect(screen.queryByText('Add Biller')).toBeNull();
      expect(screen.queryByText('Pay Now')).toBeNull();
    });

    it('opens a biller to pay when its card is pressed', () => {
      renderWithProviders(<BillsComponent {...plainProps} />);

      fireEvent.press(screen.getByText('My Water Bill'));
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
        params: { billingReferenceId: 'ref-002', merchantName: 'Water Utils' },
      });
    });
  });
});
