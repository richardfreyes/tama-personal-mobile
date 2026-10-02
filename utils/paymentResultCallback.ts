import { PaymentResultCallback, PaymentResultOutcome, PaymentResultProvider } from '@/types/common';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const firstParam = (value: string | string[] | undefined): string => (
  (Array.isArray(value) ? value[0] : value || '').trim()
);

const normaliseProvider = (value: string | string[] | undefined): PaymentResultProvider | null => {
  const provider = firstParam(value).toLowerCase();
  return provider === 'paypal' || provider === 'qrph' ? provider : null;
};

const normaliseOutcome = (value: string | string[] | undefined): PaymentResultOutcome => {
  const outcome = firstParam(value).toLowerCase();
  if (outcome === 'success' || outcome === 'cancelled' || outcome === 'failure') return outcome;
  return 'error';
};

/**
 * Parses the backend's `personaldashboardmob://mobile/payment-result?...` deep link, used
 * when a PayPal or QR Ph page finishes outside the in-app WebView (external browser or the
 * provider's own app).
 */
export const parsePaymentResultCallbackUrl = (url: string): PaymentResultCallback | null => {
  if (!url) return null;

  const { hostname, path, queryParams } = Linking.parse(url);
  const callbackHost = (hostname || '').toLowerCase();
  const callbackPath = (path || '').replace(/^\/+|\/+$/g, '').toLowerCase();
  const isPaymentResult =
    callbackHost === 'payment-result' ||
    callbackPath === 'payment-result' ||
    callbackPath.endsWith('/payment-result');
  if (!isPaymentResult) return null;

  const provider = normaliseProvider(queryParams?.provider);
  if (!provider) return null;

  const transactionReferenceId = firstParam(queryParams?.transactionReferenceId);
  const invoiceReferenceId = firstParam(queryParams?.invoiceReferenceId);
  return {
    provider,
    outcome: normaliseOutcome(queryParams?.outcome),
    ...(transactionReferenceId ? { transactionReferenceId } : {}),
    ...(invoiceReferenceId ? { invoiceReferenceId } : {}),
  };
};

export const handlePaymentResultBrowserCallback = (
  url: string,
  onResult: (result: PaymentResultCallback) => void,
): boolean => {
  const result = parsePaymentResultCallbackUrl(url);
  if (!result) return false;

  try {
    void WebBrowser.dismissBrowser().catch(() => {
      // The callback may come from a platform without a dismissible browser.
    });
  } catch {
    // The browser module can throw synchronously when no browser session is active.
  }

  onResult(result);
  return true;
};
