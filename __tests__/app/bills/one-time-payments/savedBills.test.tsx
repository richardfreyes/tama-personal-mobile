import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { router } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import SavedBillsScreen from '@/app/(app)/bills/one-time-payments/saved';
import { billsStyles } from '@/styles/app/bills/one-time-payments';

const mockUseGetBillsQuery = jest.fn();
const mockUseGetBillersQuery = jest.fn();
const mockRefetch = jest.fn(() => Promise.resolve());
const mockTabBarTranslateY = { value: 0 };
const mockTabBarHeight = { value: 50 };

jest.mock('@/context/TabBarAnimationContext', () => ({
  useTabBarAnimation: () => ({
    tabBarTranslateY: mockTabBarTranslateY,
    tabBarHeight: mockTabBarHeight,
  }),
}));

jest.mock('@/redux/features/bills/billsApi', () => ({
  useGetBillsQuery: (...args: any[]) => mockUseGetBillsQuery(...args),
}));
jest.mock('@/redux/features/biller/billerApi', () => ({
  useGetBillersQuery: (...args: any[]) => mockUseGetBillersQuery(...args),
}));

jest.mock('@/components/layout/NavHeaderComponent', () => {
  const mockReact = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');

  function MockNavHeader({ title }: { title: string }) {
    return mockReact.createElement(Text, null, `Nav:${title}`);
  }

  return MockNavHeader;
});

const makeBill = (id: number, name: string, status?: string) => ({
  billing_id: id,
  billing_name: name,
  billing_reference_id: `bill-${id}`,
  billing_type: 'saved',
  client_notes: '',
  custom_fields: {
    amount: { text: 'Amount', value: `₱${id * 100}` },
  },
  customer_id: 1,
  merchant_category_name: '',
  merchant_id: id,
  merchant_name: `${name} Provider With A Long Company Name`,
  payment_status: status,
  payment_type_id: 1,
  project_id: 1,
});

const successResult = (data: ReturnType<typeof makeBill>[]) => ({
  data,
  isError: false,
  isFetching: false,
  isLoading: false,
  refetch: mockRefetch,
});

describe('Saved Bills route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTabBarTranslateY.value = 0;
    mockUseGetBillersQuery.mockReturnValue({
      data: [
        { merchant_id: 1, merchant_logo_url: 'https://example.com/netflix.png' },
        { merchant_id: 2, merchant_logo_url: 'https://example.com/utility.png' },
      ],
    });
    mockUseGetBillsQuery.mockReturnValue(successResult([
      makeBill(1, 'Netflix'),
      makeBill(2, 'Paid Utility', 'Paid'),
    ]));
  });

  it('renders the route header, cards, paid entries, and bill-payment navigation', () => {
    render(<SavedBillsScreen />);

    expect(screen.getByText('Nav:Saved Bills')).toBeTruthy();
    expect(screen.getByTestId('saved-bills-list').props.contentContainerStyle).toEqual(
      billsStyles.savedListContent,
    );
    expect(screen.getByLabelText('Saved Bills, 1 active')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Saved Bills, 1 active' })).toBeNull();
    expect(screen.getByText('Netflix')).toBeTruthy();
    expect(screen.UNSAFE_getAllByType(Image).map((image) => image.props.source)).toContainEqual({
      uri: 'https://example.com/netflix.png',
    });
    expect(screen.queryByText('NE')).toBeNull();
    expect(screen.getByText('Paid Utility')).toBeTruthy();
    expect(screen.getByText('Paid')).toBeTruthy();

    fireEvent.press(screen.getByText('Netflix'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
      params: {
        billingReferenceId: 'bill-1',
        merchantName: 'Netflix Provider With A Long Company Name',
      },
    });
  });

  it('renders matching loading, empty, and error states', () => {
    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: true,
      isLoading: true,
      refetch: mockRefetch,
    });
    const loading = render(<SavedBillsScreen />);
    expect(screen.getByText('Loading')).toBeTruthy();
    expect(screen.getByTestId('skeleton-list')).toBeTruthy();
    loading.unmount();

    mockUseGetBillsQuery.mockReturnValue(successResult([]));
    const empty = render(<SavedBillsScreen />);
    expect(screen.getByText("You don't have any saved bills yet.")).toBeTruthy();
    empty.unmount();

    mockUseGetBillsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: mockRefetch,
    });
    render(<SavedBillsScreen />);
    expect(screen.getByText('Unavailable')).toBeTruthy();
    expect(screen.getByText('Unable to load saved bills. Please try again later.')).toBeTruthy();
  });

  it('loads and merges the next page without duplicating bills', () => {
    mockUseGetBillsQuery.mockImplementation((args: unknown) => {
      const { page } = args as { page: number };
      return successResult(page === 0
        ? [makeBill(1, 'Netflix')]
        : [makeBill(1, 'Netflix'), makeBill(2, 'Spotify Premium')]);
    });

    render(<SavedBillsScreen />);
    act(() => {
      screen.getByTestId('saved-bills-list').props.onEndReached();
    });

    expect(screen.getAllByText('Netflix')).toHaveLength(1);
    expect(screen.getByText('Spotify Premium')).toBeTruthy();
    expect(mockUseGetBillsQuery).toHaveBeenCalledWith({ page: 1 });
  });

  it('shows the loading-more caption during pagination', () => {
    mockUseGetBillsQuery.mockImplementation((args: unknown) => {
      const { page } = args as { page: number };
      return page === 0
        ? successResult([makeBill(1, 'Netflix')])
        : {
          data: undefined,
          isError: false,
          isFetching: true,
          isLoading: true,
          refetch: mockRefetch,
        };
    });

    render(<SavedBillsScreen />);
    act(() => {
      screen.getByTestId('saved-bills-list').props.onEndReached();
    });

    expect(screen.getByText('Loading more bills…')).toBeTruthy();
  });

  it('refetches the first page when pulled to refresh after pagination', async () => {
    const refetchedPages: number[] = [];
    mockUseGetBillsQuery.mockImplementation((args: unknown) => {
      const { page } = args as { page: number };
      return {
        ...successResult(page === 0 ? [makeBill(1, 'Netflix')] : [makeBill(2, 'Spotify Premium')]),
        refetch: () => {
          refetchedPages.push(page);
          return Promise.resolve();
        },
      };
    });

    render(<SavedBillsScreen />);
    act(() => {
      screen.getByTestId('saved-bills-list').props.onEndReached();
    });

    await act(async () => {
      await screen.getByTestId('saved-bills-list').props.refreshControl.props.onRefresh();
    });

    expect(refetchedPages).toEqual([0]);
    expect(screen.getByTestId('saved-bills-list').props.refreshControl.props.refreshing).toBe(false);
  });

  it('attaches the shared navigation-menu scroll behavior to the list', () => {
    render(<SavedBillsScreen />);
    const list = screen.getByTestId('saved-bills-list');

    expect(list.props.onScroll).toBeDefined();
    expect(list.props.scrollEventThrottle).toBe(16);
  });
});
