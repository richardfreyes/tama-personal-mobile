import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { API_PATHS } from '@/redux/apiPaths';

let mockCaptured: Record<string, any> = {};
const mockBuilder = {
  query: jest.fn<(...args: any[]) => any>((definition) => definition),
  mutation: jest.fn<(...args: any[]) => any>((definition) => definition),
};
const mockUpdateQueryData = jest.fn<(...args: any[]) => any>((endpoint, argument, update) => ({
  type: 'test/updateQueryData',
  endpoint,
  argument,
  update,
}));
const mockAppApi = {
  injectEndpoints: jest.fn<(...args: any[]) => any>((configuration) => {
    mockCaptured = configuration.endpoints(mockBuilder);
    return { util: { updateQueryData: mockUpdateQueryData } };
  }),
};

jest.mock('@/redux/appApi', () => ({
  appApi: mockAppApi,
  baseQueryWithAuth: jest.fn<(...args: any[]) => any>(),
}));
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn<(...args: any[]) => any>(() => 'test-uuid'),
}));

const loadDefinitions = (modulePath: string) => {
  mockCaptured = {};
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(modulePath);
  });
  return mockCaptured;
};

describe('RTK Query endpoint definitions', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('defines authentication request behavior and token dispatch lifecycle', async () => {
    const definitions = loadDefinitions('@/redux/features/auth/auth');
    expect(definitions.login.query({ username: 'ada', password: 'secret' })).toEqual({
      url: API_PATHS.auth.login,
      method: 'POST',
      body: { username: 'ada', password: 'secret' },
    });

    const dispatch = jest.fn<(...args: any[]) => any>();
    await definitions.login.onQueryStarted({}, {
      dispatch,
      queryFulfilled: Promise.resolve({ data: { token: 'token' } }),
    });
    expect(dispatch).toHaveBeenCalledWith({ type: 'login/setToken', payload: 'token' });

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await definitions.login.onQueryStarted({}, {
      dispatch,
      queryFulfilled: Promise.reject(new Error('unauthorized')),
    });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('defines account-security payloads and mobile email platform', () => {
    const definitions = loadDefinitions('@/redux/features/accountSecurity/accountSecurityApi');
    expect(definitions.updateEmail.query({ email: 'new@example.com' })).toEqual({
      url: API_PATHS.settings.updateEmail,
      method: 'POST',
      body: { email: 'new@example.com', platform: 'mobile' },
    });
    expect(definitions.updatePassword.query({ oldPassword: 'old', newPassword: 'new' })).toEqual({
      url: API_PATHS.settings.updatePassword,
      method: 'PUT',
      body: { oldPassword: 'old', newPassword: 'new' },
    });
    expect(definitions.changeEmailConfirm.query({ code: '123456' })).toEqual({
      url: API_PATHS.settings.updateEmailConfirm,
      method: 'PATCH',
      body: { code: '123456' },
    });
  });

  it('defines bill detail extraction and biller query normalization', () => {
    let definitions = loadDefinitions('@/redux/features/billDetail/billDetailApi');
    expect(definitions.getBillDetail.query('BILL-1')).toBe(API_PATHS.bills.getDetail('BILL-1'));
    expect(definitions.getBillDetail.transformResponse({ bill: { id: 1 } })).toEqual({ id: 1 });

    definitions = loadDefinitions('@/redux/features/biller/billerApi');
    expect(definitions.getBillers.query({ search: ['Ada & Co'], category: ['7'] }))
      .toBe(`${API_PATHS.dashboard.biller}?search=Ada%20%26%20Co&category=7`);
    expect(definitions.getBillers.query({ search: null, category: 'invalid' }))
      .toBe(API_PATHS.dashboard.biller);
    expect(definitions.getBillers.transformResponse({ billers: [{ id: 1 }] })).toEqual([{ id: 1 }]);
    expect(definitions.getBillers.transformResponse({})).toEqual([]);
  });

  it('defines bill and biller-form endpoints including lookup delegation', async () => {
    let definitions = loadDefinitions('@/redux/features/bills/billsApi');
    expect(definitions.getBills.query({ page: 3 })).toBe(`${API_PATHS.bills.base}?page=3`);
    expect(definitions.getBills.transformResponse({ bills: [{ id: 1 }] })).toEqual([{ id: 1 }]);
    expect(definitions.getBills.transformResponse(undefined)).toEqual([]);
    expect(definitions.addBill.query({ billerId: 1 })).toEqual({
      url: API_PATHS.bills.base,
      method: 'POST',
      body: { billerId: 1 },
    });
    expect(definitions.deleteBill.query(8)).toEqual({
      url: '/bills/8',
      method: 'DELETE',
    });

    definitions = loadDefinitions('@/redux/features/billerForm/billerFormApi');
    expect(definitions.fetchFormConfig.query(7)).toBe(API_PATHS.bills.getBiller(7));
    const baseQuery = jest.fn<(...args: any[]) => any>().mockResolvedValue({ data: ['Option'] });
    const lookup = await definitions.fetchLookupOptions.queryFn({
      billerId: 7,
      formConfig: [{ fieldType: 'lookup', key: 'projectName' }],
    }, {}, {}, baseQuery);
    expect(lookup).toEqual({ data: { projectName: ['Option'] } });
  });

  it('defines enrollment pagination defaults and response transformation', () => {
    const definitions = loadDefinitions('@/redux/features/enrollments/enrollmentApi');
    expect(definitions.getEnrollments.query()).toContain('page=0&count=10&searchQuery=');
    expect(definitions.getEnrollments.query({
      page: 2,
      count: 5,
      searchQuery: 'Ada & Co',
    })).toContain('page=2&count=5&searchQuery=Ada%20%26%20Co');
    expect(definitions.getEnrollments.transformResponse({
      enrollments: undefined,
      pagination: undefined,
    }, undefined, { page: 2, count: 5 })).toEqual({
      items: [],
      totalCount: 0,
      currentPage: 2,
      limit: 5,
      offset: 0,
    });
  });

  it('defines payment processing and saved-payment-method behavior', () => {
    let definitions = loadDefinitions('@/redux/features/pay/payApi');
    expect(definitions.processPayment.query({
      transactionReferenceId: 'TRX',
      payload: { paymentMethod: 'card' },
    })).toEqual({
      url: 'v1/transactions/TRX/pay',
      method: 'POST',
      body: { paymentMethod: 'card' },
    });

    definitions = loadDefinitions('@/redux/features/paymentMethods/paymentMethodApi');
    expect(definitions.getPaymentMethods.query()).toBe(API_PATHS.paymentMethods.get);
    expect(definitions.getPaymentMethods.transformResponse([{ id: 'card' }])).toEqual([{ id: 'card' }]);
    expect(definitions.addCardPayment.query({ cardProvider: 'visa' })).toEqual({
      url: API_PATHS.paymentMethods.add,
      method: 'POST',
      body: { cardProvider: 'visa' },
    });
    expect(definitions.addCardPayment.invalidatesTags({ redirect: 'https://verify' })).toEqual([]);
    expect(definitions.addCardPayment.invalidatesTags({})).toEqual(['PaymentMethods']);
    expect(definitions.updateCardPayment.query({
      id: 'card-1',
      payload: { isPrimary: true },
    })).toEqual({
      url: API_PATHS.paymentMethods.update('card-1'),
      method: 'PATCH',
      body: { isPrimary: true },
    });
    expect(definitions.linkDirectDebit.query({ channelCode: 'BA_BPI', isPrimary: false })).toEqual({
      url: API_PATHS.paymentMethods.directDebitLink('BA_BPI'),
      method: 'POST',
      body: { isPrimary: false },
    });
    expect(definitions.chargeDirectDebit.query({
      idempotencyKey: 'charge-key',
      payload: {
        referenceId: 'bank-ref-1',
        billingReferenceId: 'bill-1',
        baseCurrency: 'PHP',
        baseAmount: 125,
      },
    })).toEqual(expect.objectContaining({
      url: API_PATHS.paymentMethods.directDebitCharge,
      method: 'POST',
      timeout: 30000,
      headers: { 'Idempotency-Key': 'charge-key', 'Content-Type': 'application/json' },
      body: {
        referenceId: 'bank-ref-1',
        billingReferenceId: 'bill-1',
        baseCurrency: 'PHP',
        baseAmount: 125,
      },
    }));
  });

  it('defines the PayPal create, capture, and cancel contracts', () => {
    const definitions = loadDefinitions('@/redux/features/transactions/transactionApi');
    const payload = {
      billingReferenceId: 'bill-1',
      baseAmount: 100,
      baseCurrency: 'PHP',
      notes: null,
    };

    expect(definitions.payWithPayPal.query({
      payload,
      idempotencyKey: 'paypal-request-1',
    })).toEqual({
      url: API_PATHS.transactions.payWithPayPal,
      method: 'POST',
      headers: {
        'Idempotency-Key': 'paypal-request-1',
        'Content-Type': 'application/json',
      },
      body: payload,
    });
    expect(definitions.capturePayPal.query('txn-1')).toEqual({
      url: API_PATHS.transactions.capturePayPal('txn-1'),
      method: 'POST',
    });
    expect(definitions.capturePayPal.invalidatesTags).toEqual([
      'TransactionLast',
      'Bills',
      'TransactionDetail',
    ]);
    expect(definitions.cancelPayPal.query('txn-1')).toEqual({
      url: API_PATHS.transactions.cancelPayPal('txn-1'),
      method: 'POST',
    });
  });

  it('optimistically synchronizes updated payment-method details in the list cache', async () => {
    const definitions = loadDefinitions('@/redux/features/paymentMethods/paymentMethodApi');
    const paymentMethods = [
      { referenceId: 'card-1', isPrimary: false },
      { referenceId: 'card-2', isPrimary: true },
    ];
    const undo = jest.fn();
    const dispatch = jest.fn<(...args: any[]) => any>((action) => {
      action.update(paymentMethods);
      return { undo };
    });

    await definitions.updateCardPayment.onQueryStarted({
      id: 'card-1',
      payload: { paymentIsPrimary: true, paymentIsEnabled: true },
    }, {
      dispatch,
      queryFulfilled: Promise.resolve({ data: { message: 'Updated' } }),
    });

    expect(mockUpdateQueryData).toHaveBeenCalledWith('getPaymentMethods', undefined, expect.any(Function));
    expect(paymentMethods).toEqual([
      { referenceId: 'card-1', isPrimary: true },
      { referenceId: 'card-2', isPrimary: false },
    ]);
    expect(undo).not.toHaveBeenCalled();
  });

  it('removes deleted cards from the list cache immediately', async () => {
    const definitions = loadDefinitions('@/redux/features/paymentMethods/paymentMethodApi');
    const paymentMethods = [
      { referenceId: 'card-1', isPrimary: true },
      { referenceId: 'card-2', isPrimary: false },
    ];
    const undo = jest.fn();
    const dispatch = jest.fn<(...args: any[]) => any>((action) => {
      action.update(paymentMethods);
      return { undo };
    });

    await definitions.deleteCardPayment.onQueryStarted({ id: 'card-2' }, {
      dispatch,
      queryFulfilled: Promise.resolve({ data: { message: 'Deleted' } }),
    });

    expect(paymentMethods).toEqual([{ referenceId: 'card-1', isPrimary: true }]);
    expect(undo).not.toHaveBeenCalled();
  });

  it('rolls back an optimistic payment-method cache change when the request fails', async () => {
    const definitions = loadDefinitions('@/redux/features/paymentMethods/paymentMethodApi');
    const undo = jest.fn();
    const dispatch = jest.fn<(...args: any[]) => any>(() => ({ undo }));

    await definitions.deleteCardPayment.onQueryStarted({ id: 'card-2' }, {
      dispatch,
      queryFulfilled: Promise.reject(new Error('Delete failed')),
    });

    expect(undo).toHaveBeenCalledTimes(1);
  });

  it('preserves the complete list through add, default update, and delete regressions', async () => {
    const definitions = loadDefinitions('@/redux/features/paymentMethods/paymentMethodApi');
    const paymentMethods = [
      { referenceId: 'card-1', isPrimary: true },
    ];
    const dispatch = jest.fn<(...args: any[]) => any>((action) => {
      action.update(paymentMethods);
      return { undo: jest.fn() };
    });

    expect(definitions.addCardPayment.invalidatesTags({ redirect: '' })).toEqual(['PaymentMethods']);
    paymentMethods.push({ referenceId: 'card-2', isPrimary: false });

    await definitions.updateCardPayment.onQueryStarted({
      id: 'card-2',
      payload: { paymentIsPrimary: true, paymentIsEnabled: true },
    }, {
      dispatch,
      queryFulfilled: Promise.resolve({ data: { message: 'Updated' } }),
    });

    expect(paymentMethods).toEqual([
      { referenceId: 'card-1', isPrimary: false },
      { referenceId: 'card-2', isPrimary: true },
    ]);
    expect(definitions.updateCardPayment.invalidatesTags).toBeUndefined();

    await definitions.deleteCardPayment.onQueryStarted({ id: 'card-1' }, {
      dispatch,
      queryFulfilled: Promise.resolve({ data: { message: 'Deleted' } }),
    });

    expect(paymentMethods).toEqual([{ referenceId: 'card-2', isPrimary: true }]);
    expect(definitions.deleteCardPayment.invalidatesTags).toBeUndefined();
  });

  it('defines profile extraction and update payloads', () => {
    const definitions = loadDefinitions('@/redux/features/profile/profileApi');
    expect(definitions.getProfileData.query()).toBe(API_PATHS.settings.individual);
    expect(definitions.getProfileData.transformResponse({ customer: { id: 1 } })).toEqual({ id: 1 });
    expect(definitions.updateProfile.query({ firstName: 'Ada' })).toEqual({
      url: API_PATHS.settings.updateProfile,
      method: 'PATCH',
      body: { firstName: 'Ada' },
    });
    expect(definitions.updateAddress.query({ city: 'Makati' })).toEqual({
      url: API_PATHS.settings.updateAddress,
      method: 'PATCH',
      body: { city: 'Makati' },
    });
  });

  it('defines reset-password and signup authorization behavior', () => {
    let definitions = loadDefinitions('@/redux/features/resetPassword/resetPasswordApi');
    expect(definitions.resetPassword.query({ email: 'ada@example.com' })).toEqual({
      url: API_PATHS.auth.resetPassword,
      method: 'POST',
      body: { email: 'ada@example.com', platform: 'mobile' },
    });
    expect(definitions.resetPasswordWithToken.query({
      token: 'token',
      code: '123456',
      newPassword: 'new-secret',
    })).toEqual({
      url: API_PATHS.auth.resetPasswordConfirm,
      method: 'POST',
      body: { code: '123456', password1: 'new-secret' },
      headers: { Authorization: 'Bearer token' },
    });

    definitions = loadDefinitions('@/redux/features/signup/signupApi');
    expect(definitions.signup.query({ email: 'ada@example.com' })).toEqual({
      url: API_PATHS.auth.signup,
      method: 'POST',
      body: { email: 'ada@example.com' },
    });
    expect(definitions.verifyOtp.query({ token: 'token', code: '123456' })).toEqual({
      url: API_PATHS.auth.verifyEmail,
      method: 'POST',
      body: { code: '123456' },
      headers: { Authorization: 'Bearer token' },
    });
    expect(definitions.resendOtp.query({ token: 'token' })).toEqual({
      url: API_PATHS.auth.resendOtp,
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
    });
  });

  it('defines transaction list, computation, payment, detail, and last-transaction transforms', () => {
    let definitions = loadDefinitions('@/redux/features/transactions/transactionApi');
    expect(definitions.getTransactions.query({
      page: 1,
      count: 20,
      searchQuery: 'Ada & Co',
    })).toBe(`${API_PATHS.transactions.base}?page=0&count=20&searchQuery=Ada%20%26%20Co`);
    expect(definitions.getTransactions.query({ page: 2, count: 20, searchQuery: '' }))
      .toBe(`${API_PATHS.transactions.base}?page=20&count=20&searchQuery=`);
    expect(definitions.getTransactions.transformResponse([
      { id: 1, totalCount: 12 },
    ], undefined, { page: 1 })).toEqual({
      items: [{ id: 1, totalCount: 12 }],
      totalCount: 12,
      currentPage: 1,
    });
    expect(definitions.getTransactions.transformResponse([], undefined, { page: 0 }))
      .toEqual({ items: [], totalCount: 0, currentPage: 0 });
    expect(definitions.createTransactionComputation.query({ amount: 100 })).toEqual({
      url: API_PATHS.transactions.base,
      method: 'POST',
      body: { amount: 100 },
    });
    expect(definitions.payTransaction.query({ transactionId: 'TRX', idempotencyKey: 'pay-key' })).toEqual(expect.objectContaining({
      url: API_PATHS.transactions.pay('TRX'),
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'Idempotency-Key': 'pay-key',
      }),
    }));
    expect(definitions.payTransaction.invalidatesTags).toEqual([
      'TransactionLast',
      'Bills',
      'TransactionDetail',
    ]);
    expect(definitions.payWithCard.invalidatesTags).toEqual([
      'TransactionLast',
      'Bills',
      'TransactionDetail',
      'PaymentMethods',
    ]);
    expect(definitions.verifyQrph.invalidatesTags).toEqual([
      'TransactionLast',
      'Bills',
      'TransactionDetail',
    ]);

    definitions = loadDefinitions('@/redux/features/transactionDetail/transactionDetailApi');
    expect(definitions.getTransactionDetail.query('INV')).toBe(API_PATHS.transactions.detail('INV'));
    expect(definitions.getTransactionDetail.transformResponse({ id: 'INV' })).toEqual({ id: 'INV' });
    expect(definitions.getTransactionDetail.providesTags({}, undefined, 'INV')).toEqual([
      { type: 'TransactionDetail', id: 'INV' },
    ]);

    definitions = loadDefinitions('@/redux/features/transactionLast/transactionLastApi');
    expect(definitions.getLastTransaction.query('BILL')).toBe(API_PATHS.transactions.last('BILL'));
    expect(definitions.getLastTransaction.providesTags({}, undefined, 'BILL')).toEqual([
      { type: 'TransactionLast', id: 'BILL' },
    ]);
    expect(definitions.getLastTransaction.transformResponse({
      transaction: { base_amount: '123.45', base_currency: 'PHP' },
    })).toEqual({ baseAmount: 123.45, baseCurrency: 'PHP' });
  });
});
