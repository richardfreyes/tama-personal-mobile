import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import BillsComponent from '../../../components/one-time-payments/BillsComponent';
import { renderWithProviders } from '../../../utils/test-utils';

// --- Mock RTK Query hooks ---

const mockUseGetBillersQuery = jest.fn();
const mockUseGetBillsQuery = jest.fn();

jest.mock('@/redux/features/biller/billerApi', () => ({
  useGetBillersQuery: (...args: any[]) => mockUseGetBillersQuery(...args),
}));

jest.mock('@/redux/features/bills/billsApi', () => ({
  useGetBillsQuery: (...args: any[]) => mockUseGetBillsQuery(...args),
}));

// --- Test data ---

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
  });

  // ---- Loading states ----

  it('shows loading indicator when billers are loading', () => {
    mockUseGetBillersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('My Bills')).toBeTruthy();
    expect(screen.getByTestId('horizontal-card-skeleton')).toBeTruthy();
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
    expect(screen.getByTestId('horizontal-card-skeleton')).toBeTruthy();
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
    expect(screen.getByTestId('horizontal-card-skeleton')).toBeTruthy();
  });

  // ---- Error state ----

  it('shows error message when billers query fails', () => {
    mockUseGetBillersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: 'Server Error' },
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(
      screen.getByText(
        'Unable to load bills at the moment. Please try again later.',
      ),
    ).toBeTruthy();
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

  // ---- Empty states ----

  it('shows empty state when bills data is an empty array', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(
      screen.getByText(
        "It looks like you don't have any bills added yet.",
      ),
    ).toBeTruthy();
  });

  it('shows empty state when bills data is null', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(
      screen.getByText(
        "It looks like you don't have any bills added yet.",
      ),
    ).toBeTruthy();
  });

  it('shows empty state when bills data is undefined', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(
      screen.getByText(
        "It looks like you don't have any bills added yet.",
      ),
    ).toBeTruthy();
  });

  it('shows error state when bills query fails', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: 'Server Error' },
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(
      screen.getByText(
        'Unable to load bills at the moment. Please try again later.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Pay Now')).toBeNull();
  });

  // ---- Success state rendering ----

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
    expect(screen.getByText('₱1,500.00')).toBeTruthy();
    expect(screen.getByText('₱800.00')).toBeTruthy();
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

  // ---- Section header ----

  it('renders section header title', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('My Bills')).toBeTruthy();
  });

  it('shows section header linkText when bills exist', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('View All')).toBeTruthy();
  });

  it('hides section header linkText when bills list is empty', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.queryByText('View All')).toBeNull();
  });

  // ---- Footer buttons ----

  it('shows Pay Now button when sectionFooter.button is true', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(screen.getByText('Pay Now')).toBeTruthy();
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

  // ---- User interactions ----

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

  it('opens the One Time Payments overview on View All press', () => {
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

  // ---- Query invocation ----

  it('calls useGetBillersQuery with empty params', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(mockUseGetBillersQuery).toHaveBeenCalledWith({});
  });

  it('calls useGetBillsQuery with page 0', () => {
    renderWithProviders(<BillsComponent {...defaultProps} />);
    expect(mockUseGetBillsQuery).toHaveBeenCalledWith({ page: 0 });
  });
});
