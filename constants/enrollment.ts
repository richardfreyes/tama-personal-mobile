import type { EnrollmentCallbackOutcome } from '@/types/enrollment';

export const ERRORS = {
  MISSING_DETAILS: 'Missing transaction details. Please try again.',
  METHOD_NOT_READY: 'Please wait while your payment method is prepared.',
  TERMS_NOT_ACCEPTED: 'Please accept the Terms of Service and Privacy Policy before completing payment.',
  AUTH_INCOMPLETE: 'Payment authorization incomplete. Please complete the authorization to proceed.',
  UNEXPECTED_RESPONSE: 'Payment was submitted but returned an unexpected response.',
  CREATE_ENROLLMENT: 'Failed to create enrollment. Please try again.',
  CREATE_TRANSACTION: 'Failed to create transaction. Please try again.',
  AMOUNT_REQUIRED: 'Amount is required.',
} as const;

export const SUCCESS = {
  CREATE_ENROLLMENT: 'Enrollment created successfully.',
  CREATE_TRANSACTION: 'Transaction created successfully.',
  PAYMENT_PENDING: 'Card payment is pending. Please complete authentication.',
  AUTH_SUCCESS: 'Payment authentication completed successfully.',
  PAYMENT_SUCCESS: 'Payment submitted successfully.',
} as const;

export const WEBVIEW = {
  ALLOWED_SCHEMES: ['https:', 'about:'],
  IGNORED_URL_PREFIXES: ['about:', 'data:'],
  DEFAULT_SUCCESS_PATTERNS: ['otp-success', 'verification-complete'],
  FAILURE_CALLBACK_TIMEOUT_MS: 3000,
  DISMISS_WAIT_TIMEOUT_MS: 15000,
};

export const LEGAL_URLS = {
  CARD_AUTH_FORM_URL: 'https://pay.aqwire.io/assets/files/Card%20Authorization%20Form.pdf',
  TERMS_URL: 'https://aqwire.co/terms-of-service/',
  PRIVACY_URL: 'https://aqwire.co/privacy-policy/',
  REFUND_URL: 'https://aqwire.co/refund-policy/',
};

export const ENROLLMENT_PAYLOAD_FIELD_EXCLUDED_KEYS = new Set([
  'amount',
  'clientNotes',
  'countryIso2',
  'countryPrefix',
  'customerEmail',
  'customerMobileNo',
  'customerName',
  'email',
  'firstName',
  'lastName',
  'paymentType',
  'merchantProjectId',
  'projectCategory',
  'projectId',
  'projectName',
]);

// The merchant API currently requires this legacy wire value.
export const ENROLLMENT_SOURCE = 'portal3' as const;

export const DEFAULT_ENROLLMENT_COUNT = 10;
export const DEFAULT_ENROLLMENT_TRANSACTION_HISTORY_COUNT = 5;
export const MAX_ENROLLMENT_TRANSACTION_HISTORY_COUNT = 10;

export const ENROLLMENT_DETAIL_SECTION_ORDER = [
  'Enrollment Information',
  'Payment Information',
  'Property Information',
  'Schedule',
  'Billing Information',
  'History',
  'Additional Information',
] as const;

export const ENROLLMENT_CALLBACK_MESSAGES: Record<EnrollmentCallbackOutcome, string> = {
  success: 'Verification complete. You may return to the app.',
  cancelled: 'Verification was cancelled. You can try again when you are ready.',
  failure: 'Card verification failed. Please try again.',
};

export const MAX_CALLBACK_MESSAGE_LENGTH = 240;
