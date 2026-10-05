import { parseDirectDebitCallbackUrl } from '@/utils/directDebitCallback';
import { parsePaymentResultCallbackUrl } from '@/utils/paymentResultCallback';
import { DIRECT_DEBIT_RESULT_ROUTE, PAYMENT_RESULT_ROUTE } from '@/constants/routes';

const toQueryString = (params: Record<string, string | undefined>): string => (
  Object.entries(params)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
);

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
