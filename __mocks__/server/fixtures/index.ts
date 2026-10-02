import path from 'path';
import fs from 'fs';

const FIXTURES_DIR = __dirname;

export const loadFixture = <T = any>(...segments: string[]): T =>
  JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, ...segments), 'utf8'));

export const auth = {
  login: {
    request: () => loadFixture('auth', 'login', 'request.json'),
    success: () => loadFixture('auth', 'login', 'success-response.json'),
    error: () => loadFixture('auth', 'login', 'error-response.json'),
  },
  signup: {
    request: () => loadFixture('auth', 'signup', 'request.json'),
    success: () => loadFixture('auth', 'signup', 'success-response.json'),
    error: () => loadFixture('auth', 'signup', 'error-response.json'),
  },
  resetPassword: {
    request: () => loadFixture('auth', 'reset-password', 'request.json'),
    success: () => loadFixture('auth', 'reset-password', 'success-response.json'),
  },
  resetPasswordConfirm: {
    request: () => loadFixture('auth', 'reset-password-confirm', 'request.json'),
    success: () => loadFixture('auth', 'reset-password-confirm', 'success-response.json'),
  },
  verifyOtp: {
    request: () => loadFixture('auth', 'verify-otp', 'request.json'),
    success: () => loadFixture('auth', 'verify-otp', 'success-response.json'),
  },
  resendOtp: {
    success: () => loadFixture('auth', 'resend-otp', 'success-response.json'),
  },
};

export const profile = {
  get: {
    success: () => loadFixture('profile', 'get', 'success-response.json'),
  },
  update: {
    request: () => loadFixture('profile', 'update', 'request.json'),
    success: () => loadFixture('profile', 'update', 'success-response.json'),
  },
  updateAddress: {
    request: () => loadFixture('profile', 'update-address', 'request.json'),
    success: () => loadFixture('profile', 'update-address', 'success-response.json'),
  },
};

export const accountSecurity = {
  updateEmail: {
    request: () => loadFixture('account-security', 'update-email', 'request.json'),
    success: () => loadFixture('account-security', 'update-email', 'success-response.json'),
  },
  changeEmailConfirm: {
    request: () => loadFixture('account-security', 'change-email-confirm', 'request.json'),
    success: () => loadFixture('account-security', 'change-email-confirm', 'success-response.json'),
  },
  updatePassword: {
    request: () => loadFixture('account-security', 'update-password', 'request.json'),
    success: () => loadFixture('account-security', 'update-password', 'success-response.json'),
  },
};

export const billers = {
  list: {
    success: () => loadFixture('billers', 'list', 'success-response.json'),
    error: () => loadFixture('billers', 'list', 'error-response.json'),
  },
};

export const bills = {
  list: {
    success: () => loadFixture('bills', 'list', 'success-response.json'),
    empty: () => loadFixture('bills', 'list', 'empty-response.json'),
  },
  detail: {
    success: () => loadFixture('bills', 'detail', 'success-response.json'),
  },
  create: {
    request: () => loadFixture('bills', 'create', 'request.json'),
    success: () => loadFixture('bills', 'create', 'success-response.json'),
    error: () => loadFixture('bills', 'create', 'error-response.json'),
  },
  delete: {
    success: () => loadFixture('bills', 'delete', 'success-response.json'),
  },
};

export const transactions = {
  list: {
    success: () => loadFixture('transactions', 'list', 'success-response.json'),
    empty: () => loadFixture('transactions', 'list', 'empty-response.json'),
  },
  detail: {
    success: () => loadFixture('transactions', 'detail', 'success-response.json'),
  },
  create: {
    request: () => loadFixture('transactions', 'create', 'request.json'),
    success: () => loadFixture('transactions', 'create', 'success-response.json'),
    error: () => loadFixture('transactions', 'create', 'error-response.json'),
  },
  pay: {
    success: () => loadFixture('transactions', 'pay', 'success-response.json'),
  },
  last: {
    success: () => loadFixture('transactions', 'last', 'success-response.json'),
  },
};

export const paymentMethods = {
  list: {
    success: () => loadFixture('payment-methods', 'list', 'success-response.json'),
    empty: () => loadFixture('payment-methods', 'list', 'empty-response.json'),
  },
  add: {
    request: () => loadFixture('payment-methods', 'add', 'request.json'),
    success: () => loadFixture('payment-methods', 'add', 'success-response.json'),
    error: () => loadFixture('payment-methods', 'add', 'error-response.json'),
  },
  update: {
    request: () => loadFixture('payment-methods', 'update', 'request.json'),
    success: () => loadFixture('payment-methods', 'update', 'success-response.json'),
  },
};

export const enrollments = {
  list: {
    success: () => loadFixture('enrollments', 'list', 'success-response.json'),
    empty: () => loadFixture('enrollments', 'list', 'empty-response.json'),
  },
};

export const merchants = {
  list: {
    success: () => loadFixture('merchants', 'list', 'success-response.json'),
  },
  detail: {
    success: () => loadFixture('merchants', 'detail', 'success-response.json'),
  },
  landingConfig: {
    success: () => loadFixture('merchants', 'landing-config', 'success-response.json'),
  },
  payment: {
    success: () => loadFixture('merchants', 'payment', 'success-response.json'),
  },
  paymentTypes: {
    success: () => loadFixture('merchants', 'payment-types', 'success-response.json'),
  },
  paymentFormConfig: {
    success: () => loadFixture('merchants', 'payment-form-config', 'success-response.json'),
  },
  enrollmentFormConfig: {
    success: () => loadFixture('merchants', 'enrollment-form-config', 'success-response.json'),
  },
  projects: {
    success: () => loadFixture('merchants', 'projects', 'success-response.json'),
  },
  transactions: {
    create: {
      request: () => loadFixture('merchants', 'transactions', 'create', 'request.json'),
      success: () => loadFixture('merchants', 'transactions', 'create', 'success-response.json'),
      error: () => loadFixture('merchants', 'transactions', 'create', 'error-response.json'),
    },
    detail: {
      success: () => loadFixture('merchants', 'transactions', 'detail', 'success-response.json'),
    },
    paymentBin: {
      success: () => loadFixture('merchants', 'transactions', 'payment-bin', 'success-response.json'),
    },
    paymentCko: {
      request: () => loadFixture('merchants', 'transactions', 'payment-cko', 'request.json'),
      success: () => loadFixture('merchants', 'transactions', 'payment-cko', 'success-response.json'),
    },
    paymentVault: {
      request: () => loadFixture('merchants', 'transactions', 'payment-vault', 'request.json'),
      success: () => loadFixture('merchants', 'transactions', 'payment-vault', 'success-response.json'),
    },
  },
  enrollments: {
    create: {
      request: () => loadFixture('merchants', 'enrollments', 'create', 'request.json'),
      success: () => loadFixture('merchants', 'enrollments', 'create', 'success-response.json'),
    },
    detail: {
      success: () => loadFixture('merchants', 'enrollments', 'detail', 'success-response.json'),
    },
    paymentBin: {
      success: () => loadFixture('merchants', 'enrollments', 'payment-bin', 'success-response.json'),
    },
    paymentVault: {
      request: () => loadFixture('merchants', 'enrollments', 'payment-vault', 'request.json'),
      success: () => loadFixture('merchants', 'enrollments', 'payment-vault', 'success-response.json'),
    },
    enroll: {
      success: () => loadFixture('merchants', 'enrollments', 'enroll', 'success-response.json'),
    },
  },
  receipts: {
    transaction: {
      success: () => loadFixture('merchants', 'receipts', 'transaction', 'success-response.json'),
    },
    enrollment: {
      success: () => loadFixture('merchants', 'receipts', 'enrollment', 'success-response.json'),
    },
    keys: {
      success: () => loadFixture('merchants', 'receipts', 'keys', 'success-response.json'),
    },
  },
};
