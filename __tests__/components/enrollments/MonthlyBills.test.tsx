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

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const currentDay = new Date().getDate();
const currentMonthDate = new Date(currentYear, currentMonth, currentDay, 12).toISOString();

const enrollment = {
  referenceId: 'ENR-001',
  propertyName: 'Acqua Private Residences',
  merchantName: 'Aqwire Homes',
  baseAmount: 1120,
  baseCurrency: 'PHP',
  nextDebitDate: currentMonthDate,
  status: 'active',
};

describe('MonthlyBillsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      data: {
        items: [enrollment],
        totalCount: 1,
        currentPage: 0,
        limit: 10,
        offset: 0,
      },
      isError: false,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders current-month Auto Debit bills with essential information only', () => {
    renderWithProviders(<MonthlyBillsComponent />);

    expect(screen.getByText(/^Next bill due /)).toBeTruthy();
    expect(screen.getByText('Aqwire Homes')).toBeTruthy();
    expect(screen.getByText('PHP 1,120.00')).toBeTruthy();
    expect(screen.queryByText('Acqua Private Residences')).toBeNull();
    expect(screen.queryByText('Auto Debit')).toBeNull();
    expect(screen.queryByText('ENR-001')).toBeNull();
  });

  it('uses the widget enrollment query that aggregates every page', () => {
    renderWithProviders(<MonthlyBillsComponent />);

    expect(mockUseGetMonthlyBillsEnrollmentsQuery).toHaveBeenCalledWith();
  });

  it('renders a horizontal snapping carousel without redundant single-bill pagination', () => {
    renderWithProviders(<MonthlyBillsComponent />);
    const carousel = screen.getByTestId('monthly-bills-carousel');

    expect(carousel.props.horizontal).toBe(true);
    expect(carousel.props.pagingEnabled).toBe(true);
    expect(carousel.props.snapToInterval).toBeGreaterThan(0);
    expect(screen.queryByTestId('monthly-bill-indicator-0')).toBeNull();
    expect(screen.queryByTestId('monthly-bill-indicator-count')).toBeNull();
  });

  it('caps visible animated indicators at six and lets users jump to a bill', () => {
    const enrollments = Array.from({ length: 8 }, (_, index) => ({
      ...enrollment,
      baseAmount: 1000 + index,
      referenceId: `ENR-${index + 1}`,
    }));
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      data: {
        items: enrollments,
        totalCount: enrollments.length,
        currentPage: 0,
        limit: 10,
        offset: 0,
      },
      isError: false,
      isLoading: false,
    });

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

    fireEvent.press(screen.getByTestId('monthly-bill-indicator-5'));

    expect(screen.getByText('6 / 8')).toBeTruthy();
    expect(screen.getByTestId('monthly-bill-indicator-5').props.accessibilityState).toEqual({ selected: true });

    fireEvent.press(screen.getByTestId('monthly-bill-indicator-0'));

    expect(screen.getByText('7 / 8')).toBeTruthy();
    expect(screen.getByTestId('monthly-bill-indicator-0').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByTestId('monthly-bill-indicator-0').props.accessibilityLabel).toBe('Show bill 7 of 8');
    expect(screen.getByTestId('monthly-bill-indicator-5')).toBeTruthy();
  });

  it('selects the enrollment and opens its existing details screen', () => {
    const store = configureStore({
      reducer: { enrollmentSelection: enrollmentSelectionReducer },
    });
    renderWithProviders(<MonthlyBillsComponent />, { store });

    fireEvent.press(screen.getByTestId('monthly-bill-card-0'));

    expect(store.getState().enrollmentSelection.selectedEnrollment).toEqual(enrollment);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/bills/enrollments/details',
      params: { enrollmentId: 'ENR-001' },
    });
  });

  it('renders the prescribed empty state when there are no current-month bills', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      data: { items: [], totalCount: 0, currentPage: 0, limit: 10, offset: 0 },
      isError: false,
      isLoading: false,
    });

    renderWithProviders(<MonthlyBillsComponent />);

    expect(screen.getByText('No upcoming bills this month')).toBeTruthy();
    expect(screen.getByText("You're all caught up. Upcoming Auto Debit bills will appear here automatically.")).toBeTruthy();
  });

  it('renders every bill in the nearest upcoming month and excludes later months', () => {
    const firstDate = new Date(currentYear, currentMonth + 1, 23).toISOString();
    const sharedDate = new Date(currentYear, currentMonth + 1, 27).toISOString();
    const laterDate = new Date(currentYear, currentMonth + 2, 5).toISOString();
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      data: {
        items: [
          { ...enrollment, referenceId: 'ENR-LATER', baseAmount: 5000, baseCurrency: 'USD', nextDebitDate: laterDate },
          { ...enrollment, referenceId: 'ENR-27-A', baseAmount: 2701, baseCurrency: 'USD', nextDebitDate: sharedDate },
          { ...enrollment, referenceId: 'ENR-23', baseAmount: 2300, baseCurrency: 'USD', nextDebitDate: firstDate },
          { ...enrollment, referenceId: 'ENR-27-B', baseAmount: 2702, baseCurrency: 'USD', nextDebitDate: sharedDate },
        ],
        totalCount: 4,
        currentPage: 0,
        limit: 10,
        offset: 0,
      },
      isError: false,
      isLoading: false,
    });

    renderWithProviders(<MonthlyBillsComponent />);

    const renderedBills = screen.getByTestId('monthly-bills-carousel').props.data;
    expect(renderedBills.map((bill: any) => bill.enrollment.referenceId)).toEqual([
      'ENR-23',
      'ENR-27-A',
      'ENR-27-B',
    ]);
    expect(renderedBills.map((bill: any) => bill.amount)).toEqual([
      'USD 2,300.00',
      'USD 2,701.00',
      'USD 2,702.00',
    ]);
    expect(screen.getByText('USD 2,300.00')).toBeTruthy();
    expect(screen.getByText('USD 2,701.00')).toBeTruthy();
    expect(screen.queryByText('USD 5,000.00')).toBeNull();
    expect(screen.queryByText('Bills this month')).toBeNull();
  });

  it('renders the loading state', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    });

    renderWithProviders(<MonthlyBillsComponent />);

    expect(screen.getByTestId('monthly-bills-loading')).toBeTruthy();
  });

  it('renders the existing error state', () => {
    mockUseGetMonthlyBillsEnrollmentsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    });

    renderWithProviders(<MonthlyBillsComponent />);

    expect(screen.getByText('Unable to load upcoming bills')).toBeTruthy();
    expect(screen.getByText('Please try again later.')).toBeTruthy();
  });
});
