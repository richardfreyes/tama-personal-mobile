import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { router } from 'expo-router';
import { openAddBiller, openPaymentMethod, openSavedBill } from '@/services/routeNavigation';

describe('routeNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the add biller view of one-time payments', () => {
    openAddBiller();

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments',
      params: { view: 'add' },
    });
  });

  it('opens a saved bill for payment with its reference and merchant', () => {
    openSavedBill({ billing_reference_id: 'bill-ref-1', merchant_name: 'Merchant 1' });

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
      params: { billingReferenceId: 'bill-ref-1', merchantName: 'Merchant 1' },
    });
  });

  it('opens a payment method as a single instance, without a return route by default', () => {
    openPaymentMethod('card-1');

    expect(router.push).toHaveBeenCalledWith(
      { pathname: '/payment-methods/update-card', params: { referenceId: 'card-1' } },
      { dangerouslySingular: true },
    );
  });

  it('passes the route to return to once the card is the default', () => {
    openPaymentMethod('card-1', '/bills/one-time-payments/pay/bill-ref-1');

    expect(router.push).toHaveBeenCalledWith(
      {
        pathname: '/payment-methods/update-card',
        params: { referenceId: 'card-1', route: '/bills/one-time-payments/pay/bill-ref-1' },
      },
      { dangerouslySingular: true },
    );
  });
});
