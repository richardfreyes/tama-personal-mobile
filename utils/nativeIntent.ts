import { parseDirectDebitCallbackUrl } from '@/utils/directDebitCallback';
import { parsePaymentResultCallbackUrl } from '@/utils/paymentResultCallback';

const PAYMENT_RESULT_ROUTE = '/payment-methods/payment-result';
const DIRECT_DEBIT_RESULT_ROUTE = '/payment-methods/direct-debit-result';

const toQueryString = (params: Record<string, string | undefined>): string => (
  Object.entries(params)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
);

/**
 * Maps an incoming system URL to a real route. The backend sends payment returns as
 * `personaldashboardmob://mobile/payment-result` and `.../mobile/direct-debit-result`; there
 * is no `/mobile/...` route, so without this Expo Router shows "Unmatched Route". Any other URL
 * is returned unchanged.
 */
export const getNativeIntentPath = (path: string): string => {
  const parseableUrl = path.startsWith('/') ? `https://mobile-callback.invalid${path}` : path;

  const paymentResult = parsePaymentResultCallbackUrl(parseableUrl);
  if (paymentResult) {
    return `${PAYMENT_RESULT_ROUTE}?${toQueryString({ ...paymentResult })}`;
  }

  const directDebitResult = parseDirectDebitCallbackUrl(parseableUrl);
  if (directDebitResult) {
    return `${DIRECT_DEBIT_RESULT_ROUTE}?${toQueryString({ outcome: directDebitResult.outcome })}`;
  }

  return path;
};
