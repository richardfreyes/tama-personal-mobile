import type { PaymentResultProvider, PaymentResultStatus } from '@/types/common';

export const PAYMENT_RESULT_PROVIDER_LABELS: Record<PaymentResultProvider, string> = {
  paypal: 'PayPal',
  qrph: 'QR Ph',
};

export const PAYMENT_RESULT_COPY: Record<PaymentResultStatus, { title: string; message: string }> = {
  pending: {
    title: 'Payment processing',
    message: 'Your payment was received and is still being recorded. Check the status again in a moment.',
  },
  failure: {
    title: 'Payment failed',
    message: 'Your payment was not completed. You have not been charged. Please try again.',
  },
  cancelled: {
    title: 'Payment cancelled',
    message: 'You cancelled the payment. You have not been charged.',
  },
  error: {
    title: 'Payment status unavailable',
    message: 'We could not confirm your payment. Check the status again before paying a second time.',
  },
};
