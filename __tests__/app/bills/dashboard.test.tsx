import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import Bills from '@/app/(app)/bills';

const mockUseGetEnrollmentsQuery = jest.fn();
const mockUseGetBillsQuery = jest.fn();

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/redux/features/enrollments/enrollmentApi', () => ({
  useGetEnrollmentsQuery: (...args: any[]) => mockUseGetEnrollmentsQuery(...args),
}));
jest.mock('@/redux/features/bills/billsApi', () => ({
  useGetBillsQuery: (...args: any[]) => mockUseGetBillsQuery(...args),
}));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Nav:${title || ''}`}</Text>;
  }
));

const buildBill = (id: number, amount: string) => ({
  billing_id: id,
  billing_name: `Bill ${id}`,
  billing_reference_id: `REF-${id}`,
  billing_type: 'utility',
  client_notes: '',
  custom_fields: { amount: { text: 'Amount', value: amount } },
  customer_id: 1,
  merchant_category_name: 'Utilities',
  merchant_id: id,
  merchant_name: `Merchant ${id}`,
  payment_type_id: 1,
  project_id: 1,
});

describe('Bills dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetBillsQuery.mockReturnValue({ data: [buildBill(1, '500')], isLoading: false, isError: false });
    mockUseGetEnrollmentsQuery.mockReturnValue({ data: { items: [] }, isLoading: false });
  });

  it('renders the summary and the primary payment CTA, and navigates to the one-time-payment flow', () => {
    render(<Bills />);
    expect(screen.getByText('Nav:Bills')).toBeTruthy();
    expect(screen.getByText('One Time Payment')).toBeTruthy();
    expect(screen.getByText('Make a One Time Payment')).toBeTruthy();

    fireEvent.press(screen.getByText('Make a One Time Payment'));
    expect(router.push).toHaveBeenCalledWith('/bills/one-time-payments');
  });

  it('shows the enroll card when there is no active enrollment and opens the enroll flow', () => {
    render(<Bills />);
    expect(screen.getByText('No active enrollments')).toBeTruthy();
    expect(screen.getByText('Not enrolled')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'View Auto Debit' }));
    expect(router.push).toHaveBeenCalledWith('/bills/enrollments');
  });

  it('shows the Auto Debit status and opens the enrolled list when there is an active enrollment', () => {
    mockUseGetEnrollmentsQuery.mockReturnValue({
      data: { items: [{ status: 'active', referenceId: 'E1' }, { status: 'cancelled' }] },
      isLoading: false,
    });
    render(<Bills />);

    expect(screen.getByText('1 active enrollment')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.queryByText('No active enrollments')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'View Auto Debit' }));
    expect(router.push).toHaveBeenCalledWith('/(app)/bills/enrollments/enrolled');
  });

  it('shows a loading placeholder for the AutoPay section while enrollments load', () => {
    mockUseGetEnrollmentsQuery.mockReturnValue({ data: undefined, isLoading: true });
    render(<Bills />);
    expect(screen.getByTestId('auto-debit-loading')).toBeTruthy();
    expect(screen.queryByText('No active enrollments')).toBeNull();
  });
});
