import { DirectDebitCallbackResult, DirectDebitOutcome } from '@/types/common';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const normaliseOutcome = (value: string | string[] | undefined): DirectDebitOutcome => {
  const outcome = (Array.isArray(value) ? value[0] : value || '').trim().toLowerCase();
  if (outcome === 'success' || outcome === 'cancelled') return outcome;
  return 'failure';
};

export const parseDirectDebitCallbackUrl = (url: string): DirectDebitCallbackResult | null => {
  if (!url) return null;

  const parseableUrl = url.startsWith('/') ? `https://mobile-callback.invalid${url}` : url;
  const { hostname, path, queryParams } = Linking.parse(parseableUrl);
  const callbackHost = (hostname || '').toLowerCase();
  const callbackPath = (path || '').replace(/^\/+|\/+$/g, '').toLowerCase();
  const isDirectDebitResult =
    callbackHost === 'direct-debit-result' ||
    callbackPath === 'direct-debit-result' ||
    callbackPath.endsWith('/mobile/direct-debit-result');

  if (!isDirectDebitResult) return null;

  return { outcome: normaliseOutcome(queryParams?.outcome) };
};

export const handleDirectDebitBrowserCallback = (
  url: string,
  onResult: (result: DirectDebitCallbackResult) => void,
): boolean => {
  const result = parseDirectDebitCallbackUrl(url);
  if (!result) return false;

  try {
    void WebBrowser.dismissBrowser().catch(() => {
      // The callback may come from a WebView or a platform without a dismissible browser.
    });
  } catch {
    // The browser module can throw synchronously when no browser session is active.
  }

  onResult(result);
  return true;
};
