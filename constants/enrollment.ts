import { Colors } from '@/styles/common/colors';
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
  TERMS_URL: 'https://pay.aqwire.io/terms',
  PRIVACY_URL: 'https://pay.aqwire.io/privacy',
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

export const ENROLLMENT_SUMMARY_GRADIENT_COLORS = [Colors.maroon10, Colors.brandGradientDeep, Colors.red09] as const;
export const ENROLLMENT_SUMMARY_GRADIENT_LOCATIONS = [0, 0.5, 1] as const;
export const ENROLLMENT_SUMMARY_GRADIENT_START = { x: 0, y: 0 } as const;
export const ENROLLMENT_SUMMARY_GRADIENT_END = { x: 1, y: 1 } as const;

export const ENROLLMENT_DETAILS_WIDE_BREAKPOINT = 760;

export const ENROLLMENT_DETAILS_COPY = {
  summary: 'Review your payment schedule, enrolled card, and account information.',
  progressUnavailable: 'Payment progress is not available for this enrollment.',
  paymentMethodDescription: 'Card enrolled for automatic payments',
  paymentMethodUnavailable: 'No payment method is available for this enrollment.',
  enrollmentFieldsUnavailable: 'No additional enrollment information is available.',
  customerDescription: 'Contact details associated with this enrollment',
  customerFieldsUnavailable: 'Customer information is not available.',
  importantNotesDescription: 'Keep these reminders in mind for uninterrupted automatic payments',
} as const;

export const ENROLLMENT_IMPORTANT_NOTES = [
  'Automatic payments will be charged to your enrolled card based on the payment schedule shown above.',
  'Keep your card active and ensure sufficient available credit or funds before each scheduled payment.',
  'The cardholder must be authorized to use this card for the enrolled account.',
] as const;
export const ENROLLMENT_EMPTY_DISPLAY_VALUES = new Set(['n/a', 'na', 'none', 'null', 'undefined', 'nan']);
