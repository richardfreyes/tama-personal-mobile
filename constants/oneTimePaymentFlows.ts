import type { OneTimePaymentMethodId } from '@/types/payment';

export const ONE_TIME_PAYMENT_FLOWS = {
  card: { value: 'card', paymentOptionId: 1, title: 'Credit/Debit Card' },
  paypal: { value: 'paypal', paymentOptionId: 2, title: 'PayPal' },
  bank: { value: 'bank', paymentOptionId: 5, title: 'Philippine Banks' },
  qrph: { value: 'qrph', paymentOptionId: 6, title: 'QRPH' },
} as const satisfies {
  [Method in OneTimePaymentMethodId]: {
    value: Method;
    paymentOptionId: number;
    title: string;
  };
};
