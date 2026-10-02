import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import OneTimePaymentCard from '../../../components/bills/OneTimePaymentCard';

const mockUseGetBillsQuery = jest.fn();

jest.mock('@/redux/features/bills/billsApi', () => ({
  useGetBillsQuery: (...args: any[]) => mockUseGetBillsQuery(...args),
}));

const buildBill = (id: number, amount?: string | number) => ({
  billing_id: id,
  billing_name: `Bill ${id}`,
  billing_reference_id: `REF-${id}`,
  billing_type: 'utility',
  client_notes: '',
  custom_fields: amount === undefined ? {} : { amount: { text: 'Amount', value: amount } },
  customer_id: 1,
  merchant_category_name: 'Utilities',
  merchant_id: id,
  merchant_name: `Merchant ${id}`,
  payment_type_id: 1,
  project_id: 1,
});

describe('OneTimePaymentCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetBillsQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
  });

  it('always renders the section header and the make-payment button', () => {
    render(<OneTimePaymentCard onMakePayment={jest.fn()} />);
    expect(screen.getByText('One Time Payment')).toBeTruthy();
    expect(screen.getByText('Make a One Time Payment')).toBeTruthy();
  });

  it('shows a skeleton while loading', () => {
    mockUseGetBillsQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<OneTimePaymentCard onMakePayment={jest.fn()} />);
    expect(screen.getByTestId('one-time-payment-loading')).toBeTruthy();
  });

  it('shows an error message when the query fails', () => {
    mockUseGetBillsQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<OneTimePaymentCard onMakePayment={jest.fn()} />);
    expect(screen.getByText(/Unable to load your saved bills/)).toBeTruthy();
  });

  it('shows an empty message when there are no saved bills', () => {
    render(<OneTimePaymentCard onMakePayment={jest.fn()} />);
    expect(screen.getByText(/No saved bills yet/)).toBeTruthy();
  });

  it('shows the saved bills count for active bills', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [buildBill(1, '1000'), buildBill(2, '2000')],
      isLoading: false,
      isError: false,
    });
    render(<OneTimePaymentCard onMakePayment={jest.fn()} />);
    expect(screen.getByText('2 saved bills')).toBeTruthy();
    expect(screen.queryByText('Total due')).toBeNull();
  });

  it('uses the singular label for a single saved bill', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: [buildBill(1, '1000')],
      isLoading: false,
      isError: false,
    });
    render(<OneTimePaymentCard onMakePayment={jest.fn()} />);
    expect(screen.getByText('1 saved bill')).toBeTruthy();
  });

  it('calls onMakePayment when the button is pressed', () => {
    const onMakePayment = jest.fn();
    render(<OneTimePaymentCard onMakePayment={onMakePayment} />);
    fireEvent.press(screen.getByText('Make a One Time Payment'));
    expect(onMakePayment).toHaveBeenCalledTimes(1);
  });
});
