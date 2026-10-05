
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking } from 'react-native';
import EnrollmentDetailsScreen from '../../../../app/(app)/bills/enrollments/details';
import enrollmentSelectionReducer, { setSelectedEnrollment, } from '../../../../redux/features/enrollmentSelection/enrollmentSelectionSlice';
import { renderWithProviders } from '../../../../utils/test-utils';

const mockUseGetEnrollmentsQuery = jest.fn();
const mockRefetch = jest.fn<() => Promise<unknown>>();

jest.mock('@/redux/features/enrollments/enrollmentApi', () => ({
  useGetEnrollmentsQuery: (...args: any[]) => mockUseGetEnrollmentsQuery(...args),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return { Feather: ({ name }: { name: string }) => <Text>{name}</Text> };
});

jest.mock('@/components/common/GlobalScrollView', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');

  return {
    GlobalScrollView: ({ children }: any) => <ScrollView>{children}</ScrollView>,
  };
});

jest.mock('@/components/layout/NavHeaderComponent', () => {
  const React = require('react');
  const { Text } = require('react-native');

  function MockNavHeaderComponent({ title }: { title: string }) {
    return <Text>{title}</Text>;
  }

  return MockNavHeaderComponent;
});

const sampleEnrollment = {
  adminNotes: 'Internal note that customers must not see',
  baseAmount: 13000,
  baseCurrency: 'PHP',
  completedPayments: 0,
  createdAt: '2026-07-21T09:46:00+08:00',
  customerEmail: 'richard@reyes.com',
  customerId: 'internal-customer-id',
  customerMobileNo: '+639770884111',
  customerName: 'Richard',
  customerReferenceId: 'P20251999325408',
  enrollmentLastPaymentAmount: 0,
  enrollmentLastPaymentDate: null,
  enrollmentMonths: 12,
  enrollmentPeriod: 'monthly',
  enrollmentStartDate: '2026-07-21T00:00:00+08:00',
  enrollmentType: 'fixed',
  expiresAt: '2026-08-20T01:46:00+08:00',
  fields: [
    { name: 'soNumber', text: 'SO Number', value: '2131312312' },
    { name: 'unitNumber', text: 'Unit Number', value: 'AM12345' },
  ],
  merchantId: 'internal-merchant-id',
  merchantName: 'Camella Homes',
  methodBrand: 'VISA',
  methodCardNumber: '4242424242424242',
  methodCustomerFullName: 'Richard',
  methodExpiry: '12/27',
  methodFingerprint: 'sensitive-fingerprint',
  methodProcessorId: 'processor-card-id',
  methodType: 'CREDIT_CARD',
  paymentMethodConfirmedAt: '2026-07-21T09:47:00+08:00',
  paymentMethodCurrency: 'USD',
  paymentTypeName: 'Monthly Amortization',
  referenceId: 'QW-E-F4LKN66E',
  status: 'ONGOING',
  submittedAt: '2026-07-21T09:47:00+08:00',
  transactionId: 'internal-transaction-id',
  wiremoCustomerId: 'internal-wiremo-id',
};

const createStore = () => configureStore({
  reducer: { enrollmentSelection: enrollmentSelectionReducer },
});

describe('EnrollmentDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    mockRefetch.mockResolvedValue({});
    mockUseGetEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mockRefetch,
    });
  });

  it('renders a customer-friendly enrollment summary without sensitive fields', () => {
    const store = createStore();
    store.dispatch(setSelectedEnrollment(sampleEnrollment));

    renderWithProviders(<EnrollmentDetailsScreen />, { store });

    expect(screen.getByText('Enrollment Details')).toBeTruthy();
    expect(screen.getByText('Camella Homes')).toBeTruthy();
    expect(screen.getByText('Monthly Amortization')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('QW-E-F4LKN66E')).toBeTruthy();
    expect(screen.getByText('₱13,000.00')).toBeTruthy();
    expect(screen.getByText('₱156,000.00')).toBeTruthy();
    expect(screen.getByText('Monthly')).toBeTruthy();
    expect(screen.getAllByText('12 months').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('No payments yet')).toBeTruthy();
    expect(screen.getByText('0 of 12 payments completed')).toBeTruthy();
    expect(screen.getByText('No payments recorded yet')).toBeTruthy();

    expect(screen.getByText('Visa')).toBeTruthy();
    expect(screen.getByLabelText('Card type: Visa')).toBeTruthy();
    expect(screen.getByText('•••• 4242')).toBeTruthy();
    expect(screen.getAllByText('Richard').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Dec 2027')).toBeTruthy();
    expect(screen.getByText('Credit card')).toBeTruthy();
    expect(screen.getByLabelText('Payment method: Credit card')).toBeTruthy();

    expect(screen.getByText('2131312312')).toBeTruthy();
    expect(screen.getByText('AM12345')).toBeTruthy();
    expect(screen.getByText('richard@reyes.com')).toBeTruthy();
    expect(screen.getByText('+63 977 088 4111')).toBeTruthy();
    expect(screen.getByText('P20251999325408')).toBeTruthy();

    expect(screen.getByText('Important Notes')).toBeTruthy();
    expect(screen.getByText('Automatic payments will be charged to your enrolled card based on the payment schedule shown above.')).toBeTruthy();
    expect(screen.getByText('Keep your card active and ensure sufficient available credit or funds before each scheduled payment.')).toBeTruthy();
    expect(screen.getByText('The cardholder must be authorized to use this card for the enrolled account.')).toBeTruthy();
    expect(screen.queryByText('Important dates')).toBeNull();
    expect(screen.queryByText('Enrollment link expires')).toBeNull();
    expect(screen.queryByText('August 20, 2026 at 1:46 AM')).toBeNull();

    expect(screen.getByText('support@aqwire.io')).toBeTruthy();
    expect(screen.queryByText('International: +1 408 400 3780')).toBeNull();
    expect(screen.queryByText('Local: +63 962 694 2113')).toBeNull();
    expect(screen.queryByText('Local: +63 962 694 0950')).toBeNull();

    expect(screen.queryByText('ONGOING')).toBeNull();
    expect(screen.queryByText('fixed')).toBeNull();
    expect(screen.queryByText('USD')).toBeNull();
    expect(screen.queryByText('Internal note that customers must not see')).toBeNull();
    expect(screen.queryByText('internal-customer-id')).toBeNull();
    expect(screen.queryByText('internal-merchant-id')).toBeNull();
    expect(screen.queryByText('internal-transaction-id')).toBeNull();
    expect(screen.queryByText('internal-wiremo-id')).toBeNull();
    expect(screen.queryByText('sensitive-fingerprint')).toBeNull();
    expect(screen.queryByText('processor-card-id')).toBeNull();
  });

  it('copies the customer-facing enrollment reference', async () => {
    const store = createStore();
    store.dispatch(setSelectedEnrollment(sampleEnrollment));

    renderWithProviders(<EnrollmentDetailsScreen />, { store });
    fireEvent.press(screen.getByTestId('copy-enrollment-reference'));

    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('QW-E-F4LKN66E');
    });
  });

  it('names the merchant in the contact reminders', () => {
    const store = createStore();
    store.dispatch(setSelectedEnrollment(sampleEnrollment));

    renderWithProviders(<EnrollmentDetailsScreen />, { store });

    expect(screen.getByText('Contact Camella Homes or Tama Support before your next payment if your card or enrollment details need to change.')).toBeTruthy();
    expect(screen.getByText('Contact Camella Homes or Tama Support and share your enrollment reference.')).toBeTruthy();
  });

  it('refers to "the merchant" when the enrollment has no merchant name', () => {
    const store = createStore();
    store.dispatch(setSelectedEnrollment({ referenceId: 'QW-E-NO-MERCHANT', status: 'ONGOING' }));

    renderWithProviders(<EnrollmentDetailsScreen />, { store });

    expect(screen.getByText('Contact the merchant or Tama Support before your next payment if your card or enrollment details need to change.')).toBeTruthy();
    expect(screen.getByText('Contact the merchant or Tama Support and share your enrollment reference.')).toBeTruthy();
  });

  it('says what is missing when the enrollment has no progress, card or contact details', () => {
    const store = createStore();
    store.dispatch(setSelectedEnrollment({ merchantName: 'Camella Homes', status: 'ONGOING' }));

    renderWithProviders(<EnrollmentDetailsScreen />, { store });

    expect(screen.getByText('Payment progress is not available for this enrollment.')).toBeTruthy();
    expect(screen.getByText('No payment method is available for this enrollment.')).toBeTruthy();
    expect(screen.getByText('No additional enrollment information is available.')).toBeTruthy();
    expect(screen.getByText('Customer information is not available.')).toBeTruthy();
  });

  it('opens an email to support from the help card', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const store = createStore();
    store.dispatch(setSelectedEnrollment(sampleEnrollment));

    renderWithProviders(<EnrollmentDetailsScreen />, { store });
    fireEvent.press(screen.getByRole('link', { name: 'Email Tama Support at support@aqwire.io' }));

    expect(openURL).toHaveBeenCalledWith('mailto:support@aqwire.io');
    openURL.mockRestore();
  });

  it('shows a structured loading state while recovering a deep link', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ enrollmentId: 'QW-E-F4LKN66E' });
    mockUseGetEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: true,
      isLoading: true,
      refetch: mockRefetch,
    });

    renderWithProviders(<EnrollmentDetailsScreen />, { store: createStore() });

    expect(screen.getByTestId('enrollment-details-skeleton')).toBeTruthy();
  });

  it('shows an error state with a retry action', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ enrollmentId: 'QW-E-F4LKN66E' });
    mockUseGetEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: mockRefetch,
    });

    renderWithProviders(<EnrollmentDetailsScreen />, { store: createStore() });
    fireEvent.press(screen.getByText('Try again'));

    expect(screen.getByText("We couldn't load this enrollment")).toBeTruthy();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('recovers enrollment details from the existing list query', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ enrollmentId: 'QW-E-F4LKN66E' });
    mockUseGetEnrollmentsQuery.mockReturnValue({
      data: { items: [sampleEnrollment] },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mockRefetch,
    });

    renderWithProviders(<EnrollmentDetailsScreen />, { store: createStore() });

    expect(screen.getByText('Camella Homes')).toBeTruthy();
    expect(mockUseGetEnrollmentsQuery).toHaveBeenCalledWith({
      count: 10,
      page: 0,
      searchQuery: 'QW-E-F4LKN66E',
    });
  });

  it('shows a recovery state when no enrollment is selected', () => {
    renderWithProviders(<EnrollmentDetailsScreen />, { store: createStore() });

    expect(screen.getByText('This enrollment is no longer available. Return to the list and open it again.')).toBeTruthy();
  });
});
