import { ONE_TIME_PAYMENT_FLOWS } from '@/constants/oneTimePaymentFlows';
import type { Bill } from '@/redux/features/bills/billsTypes';
import type { OneTimePaymentMethodRouteParams } from '@/types/navigation';
import { router } from 'expo-router';

export const openAddBiller = () => {
  router.push({ pathname: '/bills/one-time-payments', params: { view: 'add' } });
};

export const openSavedBill = ({ billing_reference_id, merchant_name }: Pick<Bill, 'billing_reference_id' | 'merchant_name'>) => {
  router.push({
    pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
    params: {
      billingReferenceId: billing_reference_id,
      merchantName: merchant_name,
    },
  });
};

export const openPaymentMethod = (referenceId: string, route?: string) => {
  router.push(
    {
      pathname: '/payment-methods/update-card',
      params: {
        referenceId,
        ...(route ? { route } : {}),
      },
    },
    { dangerouslySingular: true },
  );
};

export const openOneTimePaymentMethod = ({
  title,
  billingReferenceId,
  baseAmount,
  baseCurrency,
  returnTo,
  returnAmount,
}: OneTimePaymentMethodRouteParams) => {
  if (title === ONE_TIME_PAYMENT_FLOWS.bank.title) {
    router.push({
      pathname: '/payment-methods/direct-debit',
      params: { returnTo, billingReferenceId, returnAmount },
    });
    return;
  }

  if (title === ONE_TIME_PAYMENT_FLOWS.qrph.title) {
    router.push({
      pathname: '/payment-methods/qrph',
      params: {
        returnTo,
        billingReferenceId,
        baseAmount: baseAmount || returnAmount,
        baseCurrency: baseCurrency || 'PHP',
      },
    });
    return;
  }

  if (title === ONE_TIME_PAYMENT_FLOWS.paypal.title) {
    router.push({
      pathname: '/payment-methods/paypal',
      params: {
        returnTo,
        billingReferenceId,
        baseAmount: baseAmount || returnAmount,
        baseCurrency: baseCurrency || 'PHP',
      },
    });
    return;
  }

  router.push({
    pathname: '/payment-methods/form-details',
    params: {
      apiEnv: 'one-time',
      methodTitle: title,
      billingReferenceId,
      baseAmount,
      baseCurrency,
    },
  });
};
