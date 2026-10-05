export const ROUTES = {
  home: '/home',
  dashboard: '/dashboard',
  transactions: '/transactions',
  bills: '/bills',
  paymentMethods: '/payment-methods',
  notifications: '/notifications',
  settings: '/settings',
  profile: '/settings/profile',
  security: '/settings/security',
  paymentMethodsSettings: '/settings/payment-methods',
  logout: '/settings/logout',
} as const;

export const ONE_TIME_PAY_RETURN_PREFIX = '/bills/one-time-payments/pay/';
export const PAYMENT_RESULT_ROUTE = '/payment-methods/payment-result';
export const DIRECT_DEBIT_RESULT_ROUTE = '/payment-methods/direct-debit-result';
