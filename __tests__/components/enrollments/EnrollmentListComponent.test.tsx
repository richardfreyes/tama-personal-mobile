import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { configureStore } from '@reduxjs/toolkit';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import EnrollmentListComponent from '../../../components/enrollments/EnrollmentListComponent';
import enrollmentSelectionReducer from '../../../redux/features/enrollmentSelection/enrollmentSelectionSlice';
import { Colors } from '../../../styles/common/colors';
import { inputFocusColor } from '../../../styles/common/globals';
import { renderWithProviders } from '../../../utils/test-utils';

const mockUseGetEnrollmentsQuery = jest.fn();
const mockUseGetMerchantsQuery = jest.fn();
const mockRefetch = jest.fn<() => Promise<unknown>>();

jest.mock('@/redux/features/enrollments/enrollmentApi', () => ({
  useGetEnrollmentsQuery: (...args: any[]) => mockUseGetEnrollmentsQuery(...args),
}));

jest.mock('@/redux/features/merchants/merchantApi', () => ({
  useGetMerchantsQuery: (...args: any[]) => mockUseGetMerchantsQuery(...args),
}));

jest.mock('@/components/common/GlobalScrollView', () => ({
  useTabBarScrollHandler: () => jest.fn(),
}));

const enrollment = {
  referenceId: 'ENR-001',
  transactionId: 'txn-001',
  externalTransactionId: 'ext-001',
  propertyName: 'Acqua Private Residences',
  merchantName: 'Tama Homes',
  merchantCode: 'TAMA',
  customerName: 'Jane Customer',
  customerEmail: 'jane@example.com',
  customerMobileNo: '+639171234567',
  status: 'active',
  baseAmount: 1234.56,
  baseCurrency: 'PHP',
  enrollmentStartDate: '2026-01-15T00:00:00.000Z',
  enrollmentLastPaymentDate: '2026-02-15T00:00:00.000Z',
  nextDebitDate: '2026-03-15T00:00:00.000Z',
  paymentMethodBrand: 'Visa',
  tokenizedCardNumber: '****1111',
  paymentTypeName: 'Monthly Amortization',
  enrollmentMonths: 12,
  enrollmentPeriod: 'Monthly',
};

const successResponse = {
  data: {
    items: [enrollment],
    totalCount: 1,
    currentPage: 0,
    limit: 10,
    offset: 0,
  },
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: mockRefetch,
};

describe('EnrollmentListComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseGetEnrollmentsQuery.mockReturnValue(successResponse);
    mockUseGetMerchantsQuery.mockReturnValue({ data: [] });
    mockRefetch.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('shows the loading state', () => {
    mockUseGetEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: mockRefetch,
    });

    renderWithProviders(<EnrollmentListComponent />);

    expect(screen.getByTestId('transaction-history-skeleton')).toBeTruthy();
  });

  it('shows the empty state', () => {
    mockUseGetEnrollmentsQuery.mockReturnValue({
      data: {
        items: [],
        totalCount: 0,
        currentPage: 0,
        limit: 10,
        offset: 0,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderWithProviders(<EnrollmentListComponent />);

    expect(screen.getByText('No enrollments found.')).toBeTruthy();
  });

  it('shows the error state', () => {
    mockUseGetEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mockRefetch,
    });

    renderWithProviders(<EnrollmentListComponent />);

    expect(screen.getByText('Unable to load enrollments. Please try again later.')).toBeTruthy();
  });

  it('renders only the compact enrollment summary', () => {
    renderWithProviders(<EnrollmentListComponent />);

    expect(screen.getByText('TAMA')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('PHP 1,234.56')).toBeTruthy();
    expect(screen.getByText('Mar 15, 2026')).toBeTruthy();
    expect(screen.getByText('Visa ending in 1111')).toBeTruthy();
    expect(screen.getByText('ENR-001').props.numberOfLines).toBe(1);
    expect(screen.getByText('MONTHLY AMOUNT')).toBeTruthy();
    expect(screen.getByText('NEXT DEBIT')).toBeTruthy();

    expect(screen.queryByText('Acqua Private Residences')).toBeNull();
    expect(screen.queryByText('Tama Homes')).toBeNull();
    expect(screen.queryByText('Jane Customer')).toBeNull();
    expect(screen.queryByText('Monthly Amortization')).toBeNull();
    expect(screen.queryByText('Jan 15, 2026')).toBeNull();
    expect(screen.queryByText('Feb 15, 2026')).toBeNull();
    expect(screen.queryByText('jane@example.com')).toBeNull();
    expect(screen.queryByText('+639171234567')).toBeNull();
  });

  it('renders the matching merchant logo in the enrollment avatar', () => {
    const logoUrl = 'https://cdn.aqwire.io/portal/v3/client/16101/16101-logo.png';
    mockUseGetEnrollmentsQuery.mockReturnValue({
      ...successResponse,
      data: {
        ...successResponse.data,
        items: [{ ...enrollment, merchantId: '16101' }],
      },
    });
    mockUseGetMerchantsQuery.mockReturnValue({
      data: [{ id: '16101', name: '16-101 Enterprise, Inc.', logoUrl, pid: 1 }],
    });

    renderWithProviders(<EnrollmentListComponent />);

    const images = screen.UNSAFE_getAllByType(Image);
    const avatarStyle = StyleSheet.flatten(screen.getByTestId('enrollment-avatar-0').props.style);
    expect(images.some((image) => image.props.source?.uri === logoUrl)).toBe(true);
    expect(avatarStyle.backgroundColor).toBe(Colors.transparent);
    expect(avatarStyle.borderColor).toBe(Colors.neutral04);
    expect(avatarStyle.borderWidth).toBe(1);
    expect(screen.queryByText('A')).toBeNull();
    expect(mockUseGetMerchantsQuery).toHaveBeenCalledWith('');
  });

  it('renders a swipeable preview and opens the full enrollment list', () => {
    renderWithProviders(<EnrollmentListComponent variant="carousel" />);

    const carousel = screen.getByTestId('enrollment-carousel');
    const carouselStyle = StyleSheet.flatten(carousel.props.style);
    const contentStyle = StyleSheet.flatten(carousel.props.contentContainerStyle);

    expect(carousel.props.horizontal).toBe(true);
    expect(carousel.props.removeClippedSubviews).toBe(false);
    expect(carouselStyle.marginHorizontal).toBe(-8);
    expect(carouselStyle.marginVertical).toBe(-6);
    expect(contentStyle.paddingLeft).toBe(8);
    expect(contentStyle.paddingRight).toBe(20);
    expect(contentStyle.paddingTop).toBe(10);
    expect(contentStyle.paddingBottom).toBe(10);
    expect(screen.queryByPlaceholderText('Search enrollments')).toBeNull();

    fireEvent.press(screen.getByText('View All'));

    expect(router.push).toHaveBeenCalledWith('/(app)/bills/enrollments/enrolled');
  });

  it('selects the full enrollment and opens its details screen', () => {
    const store = configureStore({
      reducer: { enrollmentSelection: enrollmentSelectionReducer },
    });

    renderWithProviders(<EnrollmentListComponent />, { store });

    fireEvent.press(screen.getByTestId('enrollment-card-0'));

    expect(store.getState().enrollmentSelection.selectedEnrollment).toEqual(enrollment);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/bills/enrollments/details',
      params: { enrollmentId: 'ENR-001' },
    });
  });

  it('debounces search and resets to page zero', () => {
    renderWithProviders(<EnrollmentListComponent />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Search enrollments'),
      'ENR',
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockUseGetEnrollmentsQuery).toHaveBeenLastCalledWith({
      page: 0,
      count: 10,
      searchQuery: 'ENR',
    });
  });

  it('keeps the search input focused while typing consecutive characters', () => {
    renderWithProviders(<EnrollmentListComponent />);

    const input = screen.getByTestId('enrollment-search-input');
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 'E');

    const inputAfterFirstCharacter = screen.getByTestId('enrollment-search-input');
    expect(inputAfterFirstCharacter).toBe(input);
    expect(StyleSheet.flatten(inputAfterFirstCharacter.props.style).borderColor).toBe(inputFocusColor);

    fireEvent.changeText(inputAfterFirstCharacter, 'EN');

    const inputAfterSecondCharacter = screen.getByTestId('enrollment-search-input');
    expect(inputAfterSecondCharacter).toBe(input);
    expect(StyleSheet.flatten(inputAfterSecondCharacter.props.style).borderColor).toBe(inputFocusColor);
  });

  it('requests the next page when load more is triggered', () => {
    mockUseGetEnrollmentsQuery.mockReturnValue({
      ...successResponse,
      data: {
        ...successResponse.data,
        totalCount: 2,
      },
    });

    const ref = React.createRef<any>();

    renderWithProviders(<EnrollmentListComponent ref={ref} />);

    act(() => {
      ref.current?.loadMore();
    });

    expect(mockUseGetEnrollmentsQuery).toHaveBeenLastCalledWith({
      page: 1,
      count: 10,
      searchQuery: '',
    });
  });
});
