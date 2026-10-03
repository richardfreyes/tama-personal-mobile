import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl } from 'react-native';
import PaymentMethodsComponent from '../../../components/payments/PaymentMethodsComponent';
import { renderWithProviders } from '../../../utils/test-utils';

const mockUseGetPaymentMethodsQuery = jest.fn();
jest.mock('@/redux/features/paymentMethods/paymentMethodApi', () => ({
  useGetPaymentMethodsQuery: () => mockUseGetPaymentMethodsQuery(),
}));

const cards = [
  {
    referenceId: 'pm-1',
    billingCardholderName: 'Juan Dela Cruz',
    lastFourCardDigits: '4242',
    paymentMethodExpiry: '12/27',
    paymentMethodProvider: 'VISA',
    billingCityAddress: 'Makati',
    billingStateAddress: 'NCR',
    billingPostalCode: '1200',
    billingCountryAddress: 'PH',
    isPrimary: true,
  },
  {
    referenceId: 'pm-2',
    billingCardholderName: 'Juan Dela Cruz',
    lastFourCardDigits: '1111',
    paymentMethodExpiry: '01/26',
    paymentMethodProvider: 'mastercard',
    billingCityAddress: 'Makati',
    billingStateAddress: 'NCR',
    billingPostalCode: '1200',
    billingCountryAddress: 'PH',
    isPrimary: false,
  },
];

const defaultProps = {
  sectionHeader: { title: 'Payment Methods', linkText: 'View All' },
  route: '/dashboard' as any,
};

const success = { data: cards, isLoading: false, isFetching: false, isError: false, error: null, refetch: jest.fn() };

describe('PaymentMethodsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetPaymentMethodsQuery.mockReturnValue(success);
  });

  // ---- Loading ----

  it('shows a loading indicator and no content while loading', () => {
    mockUseGetPaymentMethodsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByTestId('payment-methods-loading')).toBeTruthy();
    expect(screen.getByLabelText('Loading payment methods')).toBeTruthy();
    expect(screen.getByText('Payment Methods')).toBeTruthy();
    expect(screen.queryByText('Visa')).toBeNull();
  });

  it('shows the skeleton again while a failed request is being retried', () => {
    mockUseGetPaymentMethodsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: true,
      isError: true,
      error: { status: 500 },
      refetch: jest.fn(),
    });
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByTestId('payment-methods-loading')).toBeTruthy();
    expect(screen.queryByText('Unable to load payment methods.')).toBeNull();
  });

  // ---- Error ----

  it('shows the error state and hides the add button on error', () => {
    mockUseGetPaymentMethodsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 500 },
      refetch: jest.fn(),
    });
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByText('Unable to load payment methods.')).toBeTruthy();
    expect(screen.queryByText('Add Payment Method')).toBeNull();
  });

  it('retries the payment methods from the error state', () => {
    const refetch = jest.fn();
    mockUseGetPaymentMethodsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 500 },
      refetch,
    });
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);

    fireEvent.press(screen.getByRole('button', { name: 'Try loading payment methods again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  // ---- Empty ----

  it('shows the empty state when there are no payment methods', () => {
    mockUseGetPaymentMethodsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByText('No payment methods yet')).toBeTruthy();
    expect(screen.getByText('Cards you save for paying bills will appear here.')).toBeTruthy();
  });

  it('shows the empty state when only direct debit accounts exist', () => {
    mockUseGetPaymentMethodsQuery.mockReturnValue({
      ...success,
      data: [{ ...cards[1], referenceId: 'bank-1', paymentMethodName: 'directdebit', paymentMethodProvider: 'BPI' }],
    });
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByText('No payment methods yet')).toBeTruthy();
  });

  it('hides the View All link when empty but still shows the add button', () => {
    mockUseGetPaymentMethodsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.queryByText('View All')).toBeNull();
    expect(screen.getByText('Add Payment Method')).toBeTruthy();
  });

  // ---- Success ----

  it('renders the section header and View All link with data', () => {
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByText('Payment Methods')).toBeTruthy();
    expect(screen.getByText('View All')).toBeTruthy();
  });

  it('renders the capitalised provider names', () => {
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByText('Visa')).toBeTruthy();
    expect(screen.getByText('Mastercard')).toBeTruthy();
  });

  it('falls back to a generic card label when the provider is missing', () => {
    mockUseGetPaymentMethodsQuery.mockReturnValue({
      ...success,
      data: [
        {
          ...cards[0],
          referenceId: 'pm-null-provider',
          paymentMethodProvider: null,
          lastFourCardDigits: '3333',
        },
      ],
    });

    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);

    expect(screen.getByText('Card')).toBeTruthy();
    expect(screen.getByText('•••• 3333')).toBeTruthy();

    fireEvent.press(screen.getByText('Card'));
    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/payment-methods/update-card',
        params: {
          referenceId: 'pm-null-provider',
          route: '/dashboard',
        },
      }),
      { dangerouslySingular: true },
    );
  });

  it('renders the masked card numbers', () => {
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByText('•••• 4242')).toBeTruthy();
    expect(screen.getByText('•••• 1111')).toBeTruthy();
  });

  it('shows the Default tag only for the primary card', () => {
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getAllByText('Default')).toHaveLength(1);
  });

  it('keeps unaffected cards visible while adding, updating the default, and deleting', () => {
    let currentCards = [{ ...cards[0] }];
    let isBackgroundFetching = false;
    mockUseGetPaymentMethodsQuery.mockImplementation(() => ({
      ...success,
      data: currentCards,
      isFetching: isBackgroundFetching,
    }));
    const view = renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);

    expect(screen.getByText('Visa')).toBeTruthy();

    currentCards = [{ ...cards[0] }, { ...cards[1] }];
    isBackgroundFetching = true;
    view.rerender(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByText('Visa')).toBeTruthy();
    expect(screen.getByText('Mastercard')).toBeTruthy();
    expect(screen.UNSAFE_getByType(RefreshControl).props.refreshing).toBe(false);

    currentCards = [
      { ...cards[0], isPrimary: false },
      { ...cards[1], isPrimary: true },
    ];
    view.rerender(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.getByText('Visa')).toBeTruthy();
    expect(screen.getByText('Mastercard')).toBeTruthy();
    expect(screen.getAllByText('Default')).toHaveLength(1);

    currentCards = [{ ...cards[1], isPrimary: true }];
    view.rerender(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.queryByText('Visa')).toBeNull();
    expect(screen.getByText('Mastercard')).toBeTruthy();
  });

  // ---- Navigation ----

  it('never lists direct debit accounts, whatever their casing', () => {
    mockUseGetPaymentMethodsQuery.mockReturnValue({
      ...success,
      data: [
        ...cards,
        { ...cards[1], referenceId: 'bank-1', paymentMethodName: 'DirectDebit', paymentMethodProvider: 'BPI', lastFourCardDigits: '9999' },
      ],
    });
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);

    expect(screen.getByText('Visa')).toBeTruthy();
    expect(screen.queryByText('Bpi')).toBeNull();
    expect(screen.queryByText(/9999/)).toBeNull();
  });

  it('navigates to the payment methods list on View All press', () => {
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('View All'));
    expect(router.push).toHaveBeenCalledWith('/payment-methods');
  });

  it('opens the add card form from the add button by default', () => {
    const navigate = jest.fn();
    (router as unknown as { navigate: typeof navigate }).navigate = navigate;
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('Add Payment Method'));
    expect(navigate).toHaveBeenCalledWith('/payment-methods/add-card');
  });

  it('can hide the add button when it is embedded in another screen', () => {
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} sectionFooter={{ button: false }} />);
    expect(screen.getByText('Visa')).toBeTruthy();
    expect(screen.queryByText('Add Payment Method')).toBeNull();
  });

  it('is pull-to-refresh by default and can opt out when the screen already scrolls', () => {
    const view = renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    expect(screen.UNSAFE_queryAllByType(RefreshControl)).toHaveLength(1);
    view.unmount();

    renderWithProviders(<PaymentMethodsComponent {...defaultProps} isRefreshable={false} />);
    expect(screen.getByText('Visa')).toBeTruthy();
    expect(screen.UNSAFE_queryAllByType(RefreshControl)).toHaveLength(0);
  });

  it('invokes the provided add-payment-method handler instead of the default route', () => {
    const onAddPaymentMethod = jest.fn();
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} onAddPaymentMethod={onAddPaymentMethod} />);
    fireEvent.press(screen.getByText('Add Payment Method'));
    expect(onAddPaymentMethod).toHaveBeenCalledTimes(1);
  });

  it('navigates with a card reference instead of a stale detail snapshot', () => {
    renderWithProviders(<PaymentMethodsComponent {...defaultProps} />);
    fireEvent.press(screen.getByText('Visa'));
    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/payment-methods/update-card',
        params: {
          referenceId: 'pm-1',
          route: '/dashboard',
        },
      }),
      { dangerouslySingular: true },
    );
  });
});
