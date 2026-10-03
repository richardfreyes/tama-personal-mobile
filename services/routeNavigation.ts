import type { Bill } from '@/redux/features/bills/billsTypes';
import { router } from 'expo-router';

// Destinations opened from more than one screen. Kept apart from services/navigation.ts, which
// pulls in the Redux store for its modal, so components can use these without loading the store.

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

// `route` is where update-card returns to once the card has been made the default.
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
