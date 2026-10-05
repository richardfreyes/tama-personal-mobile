export const PASSWORD_RULE_TEXTS = [
  'Must be 12 characters-the more characters, the better',
  'Must be a mixture of both uppercase and lowercase letters',
  'Must be a mixture of letters and numbers',
  'Must include at least one special character, e.g., ! @ # ? ]'
] as const;

export const VALIDATORS = {
  PASSWORD_MIN_LENGTH: 12,
  DEFAULT_OTP_LENGTH: 6,
  REGEX: {
    OTP: /^\d{6}$/,
    MIXED_CASE: /^(?=.*[a-z])(?=.*[A-Z]).+$/,
    HAS_NUMBER: /\d/,
    HAS_LETTER: /[a-zA-Z]/,
    SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    CARD_NUMBER: /^\d{13,19}$/,
    CVC: /^\d{3,4}$/,
    EXPIRY: /^(0[1-9]|1[0-2])\/\d{2}$/,
  },
  CARD_PATTERNS: {
    VISA: /^4/,
    MASTERCARD: /^(5[1-5]|2(2(2[1-9]|[3-9])|[3-6]|7([0-1]|20)))/,
    AMEX: /^3[47]/,
    DISCOVER: /^(6011|65|64[4-9])/,
    UNKNOWN: /.*/,
  },

  CARD_3DS_SUCCESS_URL_PATTERN: /\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/,
  CARD_3DS_FAILED_URL_PATTERN: /\/gateway\/maya\/vault\/[^/?#]+\/(?:failed|cancelled)(?:[?#]|$)/,

  DIRECT_DEBIT_SUCCESS_URL_PATTERN: /\/payment-methods\/direct-debit\/success(?:[?#]|$)/,
  DIRECT_DEBIT_FAILURE_URL_PATTERN: /\/payment-methods\/direct-debit\/(?:error|cancel)(?:[?#]|$)/,
  QRPH_SUCCESS_URL_PATTERN: /\/transactions\/qrph\/success(?:[?#]|$)/,
  QRPH_FAILURE_URL_PATTERN: /\/transactions\/qrph\/(?:error|cancel)(?:[?#]|$)/,
  PAYPAL_SUCCESS_URL_PATTERN: /\/transactions\/paypal\/success(?:[?#]|$)/,
  PAYPAL_FAILURE_URL_PATTERN: /\/transactions\/paypal\/cancel(?:[?#]|$)/,
  LOCAL_URL_WITHOUT_SCHEME: /^(?:localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(\/.*)$/i
};

export const OBJECT_VALUE_KEYS = [
  'val',
  'value',
  'code',
  'id',
  'typeCode',
  'typeId',
  'projectId',
  'project_id',
  'merchantProjectId',
] as const;
