import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { API_PATHS } from '@/redux/apiPaths';

let mockCaptured: Record<string, any> = {};
const mockBuilder = {
  query: jest.fn<(...args: any[]) => any>((definition) => definition),
  mutation: jest.fn<(...args: any[]) => any>((definition) => definition),
};
const mockBaseQueryWithAuth = jest.fn<(...args: any[]) => any>();

jest.mock('@/redux/appApi', () => ({
  appApi: {
    injectEndpoints: (configuration: any) => {
      mockCaptured = configuration.endpoints(mockBuilder);
      return {};
    },
  },
  baseQueryWithAuth: (...args: any[]) => mockBaseQueryWithAuth(...args),
}));
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn<(...args: any[]) => any>(() => 'test-uuid'),
}));

describe('merchantApi', () => {
  beforeAll(() => {
    jest.isolateModules(() => {
      require('@/redux/features/merchants/merchantApi');
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockBaseQueryWithAuth.mockResolvedValue({
      data: { value: 'ok' },
      meta: { response: { status: 201 } },
    });
  });

  it('defines merchant listing and payment retrieval', async () => {
    expect(mockCaptured.getMerchants.query()).toBe(API_PATHS.merchant.get);
    await expect(mockCaptured.getMerchantPayment.queryFn('MERCHANT', {}, {}))
      .resolves.toEqual({ data: { value: 'ok' } });
    expect(mockBaseQueryWithAuth).toHaveBeenCalledWith(
      API_PATHS.merchant.getPayment('MERCHANT'),
      {},
      {},
    );
  });

  it('creates transaction and enrollment payloads', async () => {
    await mockCaptured.createMerchantTransaction.queryFn({
      merchantCode: 'MERCHANT',
      body: { amount: 10 },
    }, {}, {});
    expect(mockBaseQueryWithAuth).toHaveBeenLastCalledWith({
      url: API_PATHS.merchant.postTransaction('MERCHANT'),
      method: 'POST',
      body: { amount: 10 },
    }, {}, {});

    await mockCaptured.createMerchantEnrollment.queryFn({
      merchantCode: 'MERCHANT',
      body: { customer: 'Ada' },
    }, {}, {});
    expect(mockBaseQueryWithAuth).toHaveBeenLastCalledWith({
      url: API_PATHS.merchant.postEnrollment('MERCHANT'),
      method: 'POST',
      body: { customer: 'Ada' },
    }, {}, {});
  });

  it.each([
    ['getMerchantTransaction', { merchantCode: 'M', transactionId: 'T', xsrfKey: 'X' }, API_PATHS.merchant.getTransaction('M', 'T')],
    ['getMerchantEnrollment', { merchantCode: 'M', enrollmentId: 'E', xsrfKey: 'X' }, API_PATHS.merchant.getEnrollment('M', 'E')],
    ['getMerchantTransactionPaymentBin', { merchantCode: 'M', transactionId: 'T', binNumber: '411111', xsrfKey: 'X' }, API_PATHS.merchant.getTransactionPaymentBin('M', 'T', '411111')],
    ['getMerchantEnrollmentPaymentBin', { merchantCode: 'M', transactionId: 'E', binNumber: '411111', xsrfKey: 'X' }, API_PATHS.merchant.getEnrollmentPaymentBin('M', 'E', '411111')],
    ['getMerchantReceiptKeys', { merchantCode: 'M', transactionId: 'T' }, API_PATHS.merchant.getReceiptKeys('M', 'T')],
  ])('builds headers and URL for %s', async (name, args, url) => {
    await expect(mockCaptured[name].queryFn(args, {}, {})).resolves.toEqual({
      data: { value: 'ok' },
    });
    expect(mockBaseQueryWithAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        method: 'GET',
        headers: expect.objectContaining({ 'Qw-Merchant-Id': 'M' }),
      }),
      {},
      {},
    );
  });

  it('uses the required receipt access header casing for transaction and enrollment receipts', async () => {
    await mockCaptured.getMerchantReceipt.queryFn({
      merchantCode: 'M',
      referenceId: 'R',
      accessSignature: 'SIG',
    }, {}, {});
    expect(mockBaseQueryWithAuth).toHaveBeenLastCalledWith(expect.objectContaining({
      url: API_PATHS.merchant.getReceipt('M', 'R'),
      headers: {
        'Qw-Merchant-Id': 'M',
        accesssignature: 'SIG',
        accesstype: 'view',
      },
    }), {}, {});

    await mockCaptured.getMerchantEnrollmentReceipt.queryFn({
      merchantCode: 'M',
      referenceId: 'R',
      accessSignature: 'SIG',
      accessType: 'download',
    }, {}, {});
    expect(mockBaseQueryWithAuth).toHaveBeenLastCalledWith(expect.objectContaining({
      url: API_PATHS.merchant.getEnrollmentReceipt('M', 'R'),
      headers: {
        'Qw-Merchant-Id': 'M',
        accessSignature: 'SIG',
        accessType: 'download',
      },
    }), {}, {});
  });

  it.each([
    ['createMerchantTransactionPaymentCko', {
      merchantCode: 'M', transactionId: 'T', xsrfKey: 'X', body: { paymentMethod: 'creditcard' },
    }, API_PATHS.merchant.postTransactionPaymentCko('M', 'T')],
    ['createMerchantTransactionPaymentVault', {
      merchantCode: 'M', transactionId: 'T', xsrfKey: 'X', body: { card: 'vault' },
    }, API_PATHS.merchant.postTransactionPaymentVault('M', 'T')],
    ['createMerchantEnrollmentPaymentVault', {
      merchantCode: 'M', enrollmentId: 'E', xsrfKey: 'X', body: { card: 'vault' },
    }, API_PATHS.merchant.postEnrollmentPaymentVault('M', 'E')],
    ['createMerchantEnrollmentEnroll', {
      merchantCode: 'M', enrollmentId: 'E', xsrfKey: 'X',
    }, API_PATHS.merchant.postEnrollmentEnroll('M', 'E')],
  ])('returns response status for %s', async (name, args, url) => {
    await expect(mockCaptured[name].queryFn(args, {}, {})).resolves.toEqual({
      data: { value: 'ok', httpStatus: 201 },
    });
    expect(mockBaseQueryWithAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        method: 'POST',
        headers: expect.objectContaining({
          'Qw-Merchant-Id': 'M',
          'X-Xsrf-Token': 'X',
        }),
      }),
      {},
      {},
    );
  });

  it.each([
    ['getMerchantLandingConfig', API_PATHS.merchant.getLandingConfig('M')],
    ['getMerchantPaymentTypes', API_PATHS.merchant.getPaymentTypes('M')],
    ['getMerchantPaymentFormConfig', API_PATHS.merchant.getPaymentFormConfig('M')],
    ['getMerchantEnrollmentFormConfig', API_PATHS.merchant.getEnrollmentFormConfig('M')],
    ['getMerchantProjects', API_PATHS.merchant.getProjects('M')],
    ['getMerchantById', API_PATHS.merchant.getMerchantById('M')],
  ])('delegates %s to the expected path', async (name, path) => {
    await expect(mockCaptured[name].queryFn('M', {}, {})).resolves.toEqual({
      data: { value: 'ok' },
    });
    expect(mockBaseQueryWithAuth).toHaveBeenCalledWith(path, {}, {});
  });

  it('propagates base-query errors for every endpoint family', async () => {
    const error = { status: 503, data: 'unavailable' };
    mockBaseQueryWithAuth.mockResolvedValue({ error });
    await expect(mockCaptured.getMerchantPayment.queryFn('M', {}, {})).resolves.toEqual({ error });
    await expect(mockCaptured.createMerchantTransaction.queryFn({
      merchantCode: 'M',
      body: {},
    }, {}, {})).resolves.toEqual({ error });
    await expect(mockCaptured.getMerchantTransaction.queryFn({
      merchantCode: 'M',
      transactionId: 'T',
    }, {}, {})).resolves.toEqual({ error });
    await expect(mockCaptured.createMerchantEnrollmentEnroll.queryFn({
      merchantCode: 'M',
      enrollmentId: 'E',
    }, {}, {})).resolves.toEqual({ error });
    await expect(mockCaptured.getMerchantProjects.queryFn('M', {}, {})).resolves.toEqual({ error });
  });
});
