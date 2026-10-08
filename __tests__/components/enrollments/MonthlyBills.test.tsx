import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { MonthlyBillsComponent } from '../../../components/enrollments/MonthlyBills';
import enrollmentSelectionReducer from '../../../redux/features/enrollmentSelection/enrollmentSelectionSlice';
import { renderWithProviders } from '../../../utils/test-utils';

const mockUseGetMonthlyBillsEnrollmentsQuery = jest.fn();

jest.mock('@/redux/features/enrollments/enrollmentApi', () => ({
  useGetMonthlyBillsEnrollmentsQuery: (...args: any[]) => mockUseGetMonthlyBillsEnrollmentsQuery(...args),
}));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const currentDay = new Date().getDate();
const currentMonthDate = new Date(currentYear, currentMonth, currentDay, 12).toISOString();

const enrollment = {
  referenceId: 'ENR-001',
  propertyName: 'Acqua Private Residences',
  merchantName: 'Tama Homes',
  baseAmount: 1120,
  baseCurrency: 'PHP',
  nextDebitDate: currentMonthDate,
  status: 'active',
};

const queryResult = (items: any[]) => ({
  data: { items, totalCount: items.length, currentPage: 0, limit: 10, offset: 0 },
  isError: false,
  isFetching: false,
  isLoading: false,
  refetch: jest.fn(),
});

describe('MonthlyBillsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue(queryResult([enrollment]));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the 3c bill card using the existing aggregated enrollment query', () => {
    renderWithProviders(<MonthlyBillsComponent />);

    expect(mockUseGetMonthlyBillsEnrollmentsQuery).toHaveBeenCalledWith();
    expect(screen.getByText('Next bill due')).toBeTruthy();
    expect(screen.getByText('Tama Homes')).toBeTruthy();
    expect(screen.getByText('₱')).toBeTruthy();
    expect(screen.getByText('1,120.00')).toBeTruthy();
    expect(screen.getByText(/^Due [A-Z]/)).toBeTruthy();
    expect(screen.getByText('Due today')).toBeTruthy();
    expect(screen.queryByText('Acqua Private Residences')).toBeNull();
    expect(screen.queryByText('Auto Debit')).toBeNull();
    expect(screen.queryByText('Pay Now')).toBeNull();
  });

  it('uses a horizontal 12-point-gap snap track without single-bill pagination', () => {
    renderWithProviders(<MonthlyBillsComponent />);
    const carousel = screen.getByTestId('monthly-bills-carousel');

    expect(carousel.props.horizontal).toBe(true);
    expect(carousel.props.pagingEnabled).toBe(true);
    expect(carousel.props.snapToInterval).toBeGreaterThan(12);
    expect(screen.queryByTestId('monthly-bill-indicator-0')).toBeNull();
    expect(screen.queryByTestId('monthly-bill-indicator-count')).toBeNull();
  });

  it('keeps paged indicators and updates the counter on scroll and dot press', () => {
    const enrollments = Array.from({ length: 8 }, (_, index) => ({
      ...enrollment,
      baseAmount: 1000 + index,
      referenceId: `ENR-${index + 1}`,
    }));
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue(queryResult(enrollments));

    renderWithProviders(<MonthlyBillsComponent />);

    expect(screen.getByText('1 / 8')).toBeTruthy();
    expect(screen.getByTestId('monthly-bill-indicator-0').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByTestId('monthly-bill-indicator-5')).toBeTruthy();
    expect(screen.getByTestId('monthly-bill-indicator-active-0')).toBeTruthy();
    expect(screen.queryByTestId('monthly-bill-indicator-6')).toBeNull();

    const indicatorSlotStyle = StyleSheet.flatten(screen.getByTestId('monthly-bill-indicator-0').props.style);
    const activeIndicatorStyle = StyleSheet.flatten(screen.getByTestId('monthly-bill-indicator-active-0').props.style);
    const indicatorTrackStyle = StyleSheet.flatten(screen.getByTestId('monthly-bill-indicator-track').props.style);
    expect(indicatorSlotStyle.width + indicatorTrackStyle.gap).toBeGreaterThanOrEqual(activeIndicatorStyle.width);

    const carousel = screen.getByTestId('monthly-bills-carousel');
    fireEvent(carousel, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: carousel.props.snapToInterval } },
    });
    expect(screen.getByText('2 / 8')).toBeTruthy();

    fireEvent.press(screen.getByTestId('monthly-bill-indicator-5'));
    expect(screen.getByText('6 / 8')).toBeTruthy();
    fireEvent.press(screen.getByTestId('monthly-bill-indicator-0'));
    expect(screen.getByText('7 / 8')).toBeTruthy();
    expect(screen.getByTestId('monthly-bill-indicator-0').props.accessibilityLabel).toBe('Bill 7 of 8');
  });

  it('selects the enrollment and opens its existing details screen', () => {
    const store = configureStore({
      reducer: { enrollmentSelection: enrollmentSelectionReducer },
    });
    renderWithProviders(<MonthlyBillsComponent />, { store });

    fireEvent.press(screen.getByTestId('monthly-bill-card-0'));

    expect(store.getState().enrollmentSelection.selectedEnrollment).toEqual(enrollment);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/enrollments/details',
      params: { enrollmentId: 'ENR-001' },
    });
  });

  it('shows the empty card and routes Add Biller to the existing add flow', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue(queryResult([]));
    renderWithProviders(<MonthlyBillsComponent />);

    expect(screen.getByText('No bills yet')).toBeTruthy();
    expect(screen.getByText('Add your first biller to quickly manage and pay your bills from TamaPay.')).toBeTruthy();
    expect(screen.queryByTestId('monthly-bill-indicator-count')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Add Biller' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments',
      params: { view: 'add' },
    });
  });

  it('uses accurate empty copy when enrollments exist without a future debit', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue(queryResult([
      { ...enrollment, nextDebitDate: null },
    ]));

    renderWithProviders(<MonthlyBillsComponent />);

    expect(screen.getByText('No upcoming bills')).toBeTruthy();
    expect(screen.getByText('Your next scheduled bill will appear here when available.')).toBeTruthy();
    expect(screen.queryByText('No bills yet')).toBeNull();
  });

  it('keeps bills sorted in the nearest upcoming month', () => {
    const firstDate = new Date(currentYear, currentMonth + 1, 23).toISOString();
    const sharedDate = new Date(currentYear, currentMonth + 1, 27).toISOString();
    const laterDate = new Date(currentYear, currentMonth + 2, 5).toISOString();
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue(queryResult([
      { ...enrollment, referenceId: 'ENR-LATER', baseAmount: 5000, baseCurrency: 'USD', nextDebitDate: laterDate },
      { ...enrollment, referenceId: 'ENR-27-A', baseAmount: 2701, baseCurrency: 'USD', nextDebitDate: sharedDate },
      { ...enrollment, referenceId: 'ENR-23', baseAmount: 2300, baseCurrency: 'USD', nextDebitDate: firstDate },
      { ...enrollment, referenceId: 'ENR-27-B', baseAmount: 2702, baseCurrency: 'USD', nextDebitDate: sharedDate },
    ]));

    renderWithProviders(<MonthlyBillsComponent />);

    const renderedBills = screen.getByTestId('monthly-bills-carousel').props.data;
    expect(renderedBills.map((bill: any) => bill.enrollment.referenceId)).toEqual([
      'ENR-23', 'ENR-27-A', 'ENR-27-B',
    ]);
    expect(renderedBills.map((bill: any) => bill.amount)).toEqual([
      'USD 2,300.00', 'USD 2,701.00', 'USD 2,702.00',
    ]);
    expect(screen.getAllByText('USD').length).toBeGreaterThan(0);
    expect(screen.getByText('2,300.00')).toBeTruthy();
    expect(screen.queryByText('5,000.00')).toBeNull();
  });

  it('shows the card-sized skeleton while loading or retrying', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: false,
      isLoading: true,
    });
    const view = renderWithProviders(<MonthlyBillsComponent />);
    expect(screen.getByTestId('monthly-bills-loading')).toBeTruthy();
    expect(screen.getAllByTestId('skeleton-block').length).toBeGreaterThanOrEqual(5);

    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: true,
      isLoading: false,
    });
    view.rerender(<MonthlyBillsComponent />);
    expect(screen.getByTestId('monthly-bills-loading')).toBeTruthy();
  });

  it('keeps a loaded bill visible during a background refresh', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      ...queryResult([enrollment]),
      isFetching: true,
    });

    renderWithProviders(<MonthlyBillsComponent />);

    expect(screen.getByText('Next bill due')).toBeTruthy();
    expect(screen.queryByTestId('monthly-bills-loading')).toBeNull();
  });

  it('isolates a query error and retries only its own section', () => {
    const refetch = jest.fn();
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch,
    });
    renderWithProviders(<MonthlyBillsComponent />);

    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'alert' })).toBeTruthy();
    expect(screen.getByText('Unable to load upcoming bills.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Try loading upcoming bills again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('opens the Auto Debit enrollment flow from a bill card', () => {
    renderWithProviders(<MonthlyBillsComponent />);

    fireEvent.press(screen.getByRole('button', { name: 'Enroll Auto Debit' }));

    expect(router.push).toHaveBeenCalledWith('/bills/enrollments');
    expect(router.push).toHaveBeenCalledTimes(1);
  });
});
