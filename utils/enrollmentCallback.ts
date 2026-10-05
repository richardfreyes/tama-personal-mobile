import { ENROLLMENT_CALLBACK_MESSAGES, MAX_CALLBACK_MESSAGE_LENGTH } from '@/constants/enrollment';
import type { EnrollmentCallbackOutcome, EnrollmentCallbackResult } from '@/types';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const getQueryString = (value: string | string[] | undefined): string => (
  Array.isArray(value) ? value[0] || '' : value || ''
);

export const normaliseEnrollmentCallbackOutcome = (
  value: string | string[] | undefined,
): EnrollmentCallbackOutcome => {
  const outcome = getQueryString(value).trim().toLowerCase();
  if (outcome === 'success' || outcome === 'cancelled') return outcome;
  return 'failure';
};

export const normaliseEnrollmentCallbackMessage = (
  value: string | string[] | undefined,
  outcome: EnrollmentCallbackOutcome,
): string => {
  const message = getQueryString(value).replace(/\s+/g, ' ').trim();
  return (message || ENROLLMENT_CALLBACK_MESSAGES[outcome]).slice(
    0,
    MAX_CALLBACK_MESSAGE_LENGTH,
  );
};

export const parseEnrollmentCallbackUrl = (
  url: string,
): EnrollmentCallbackResult | null => {
  if (!url) return null;

  const parseableUrl = url.startsWith('/') ? `https://mobile-callback.invalid${url}` : url;
  const { hostname, path, queryParams } = Linking.parse(parseableUrl);
  const callbackHost = (hostname || '').toLowerCase();
  const callbackPath = (path || '').replace(/^\/+|\/+$/g, '').toLowerCase();
  const isEnrollmentResult =
    callbackHost === 'enrollment-result' ||
    callbackPath === 'enrollment-result' ||
    callbackPath.endsWith('/mobile/enrollment-result');

  if (!isEnrollmentResult) return null;

  const outcome = normaliseEnrollmentCallbackOutcome(queryParams?.outcome);
  return {
    outcome,
    message: normaliseEnrollmentCallbackMessage(queryParams?.message, outcome),
  };
};

export const getEnrollmentResultRoute = ({
  outcome,
  message,
}: EnrollmentCallbackResult): string => (
  `/bills/enrollments/result?outcome=${encodeURIComponent(outcome)}` +
  `&message=${encodeURIComponent(message)}`
);

export const getLegacyEnrollmentCallbackResult = (
  url: string,
): EnrollmentCallbackResult | null => {
  if (/\/merchants\/[^/]+\/enrollments\/[^/]+\/cko\/success(?:[?#]|$)/.test(url)) {
    return {
      outcome: 'success',
      message: ENROLLMENT_CALLBACK_MESSAGES.success,
    };
  }

  if (/\/merchants\/[^/]+\/enrollments\/[^/]+\/cko\/error(?:[?#]|$)/.test(url)) {
    return {
      outcome: 'failure',
      message: ENROLLMENT_CALLBACK_MESSAGES.failure,
    };
  }

  return null;
};

export const handleEnrollmentBrowserCallback = (
  url: string,
  onResult: (result: EnrollmentCallbackResult) => void,
): boolean => {
  const result = parseEnrollmentCallbackUrl(url);
  if (!result) return false;

  try {
    void WebBrowser.dismissBrowser().catch(() => {

    });
  } catch {

  }

  onResult(result);
  return true;
};
