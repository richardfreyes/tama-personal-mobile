import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { router } from 'expo-router';
import { openAddBiller, openOneTimePaymentMethod, openPaymentMethod, openSavedBill } from '@/services/routeNavigation';

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

  describe('openOneTimePaymentMethod', () => {
    const payment = {
      billingReferenceId: 'bill-1',
      baseAmount: '100',
      baseCurrency: 'PHP',
      returnTo: '/bills/one-time-payments/pay/bill-1',
      returnAmount: '100',
    };

    it('opens the one-time card form for a card', () => {
      openOneTimePaymentMethod({ title: 'Credit/Debit Card', ...payment });

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/payment-methods/form-details',
        params: {
          apiEnv: 'one-time',
          methodTitle: 'Credit/Debit Card',
          billingReferenceId: 'bill-1',
          baseAmount: '100',
          baseCurrency: 'PHP',
        },
      });
    });

    it('opens the hosted approval flow for PayPal', () => {
      openOneTimePaymentMethod({ title: 'PayPal', ...payment });

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/payment-methods/paypal',
        params: {
          returnTo: '/bills/one-time-payments/pay/bill-1',
          billingReferenceId: 'bill-1',
          baseAmount: '100',
          baseCurrency: 'PHP',
        },
      });
    });

    it('opens the bank link flow for Philippine banks, handing the amount back through returnAmount', () => {
      openOneTimePaymentMethod({ title: 'Philippine Banks', ...payment });

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/payment-methods/direct-debit',
        params: { returnTo: '/bills/one-time-payments/pay/bill-1', billingReferenceId: 'bill-1', returnAmount: '100' },
      });
    });

    it('opens the hosted payment flow for QRPH', () => {
      openOneTimePaymentMethod({ title: 'QRPH', ...payment });

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/payment-methods/qrph',
        params: {
          returnTo: '/bills/one-time-payments/pay/bill-1',
          billingReferenceId: 'bill-1',
          baseAmount: '100',
          baseCurrency: 'PHP',
        },
      });
    });

    it('falls back to the returned amount and to pesos for the hosted flows', () => {
      openOneTimePaymentMethod({ title: 'QRPH', billingReferenceId: 'bill-1', returnAmount: '250' });

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/payment-methods/qrph',
        params: { returnTo: undefined, billingReferenceId: 'bill-1', baseAmount: '250', baseCurrency: 'PHP' },
      });
    });
  });
});
