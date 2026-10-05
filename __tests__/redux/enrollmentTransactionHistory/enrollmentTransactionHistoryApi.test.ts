import { API_PATHS } from '@/redux/apiPaths';
import type { EnrollmentTransactionHistoryResponse } from '@/redux/features/enrollmentTransactionHistory/enrollmentTransactionHistoryTypes';
import { EnrollmentTransactionHistory } from '@/types/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

let capturedDefinitions: Record<string, any> = {};
const mockInitiate = jest.fn<(...args: any[]) => any>();
const mockHook = jest.fn<(...args: any[]) => any>();
const mockBuilder = {
  query: jest.fn<(...args: any[]) => any>((definition) => definition),
};
const mockEnrollmentTransactionHistoryApi = {
  endpoints: {
    getEnrollmentTransactionHistory: {
      initiate: mockInitiate,
    },
  },
  useGetEnrollmentTransactionHistoryQuery: mockHook,
};
const mockAppApi = {
  injectEndpoints: jest.fn<(...args: any[]) => any>((configuration) => {
    capturedDefinitions = configuration.endpoints(mockBuilder);
    return mockEnrollmentTransactionHistoryApi;
  }),
};

jest.mock('@/redux/appApi', () => ({
  appApi: mockAppApi,
}));

const loadModule = (): typeof import(
  '@/redux/features/enrollmentTransactionHistory/enrollmentTransactionHistoryApi'
) => {
  let loaded!: typeof import(
    '@/redux/features/enrollmentTransactionHistory/enrollmentTransactionHistoryApi'
  );
  jest.isolateModules(() => {

    loaded = require('@/redux/features/enrollmentTransactionHistory/enrollmentTransactionHistoryApi');
  });
  return loaded;
};

const makeTransaction = (
  paymentStatus: string,
  id: number,
): EnrollmentTransactionHistory => ({
  enrollmentTransactionId: id,
  externalTransactionId: `ENR-${id}`,
  enrollmentReferenceId: null,
  enrollmentStatus: 'ONGOING',
  merchantId: 10,
  merchantCode: 'avida',
  merchantName: 'Avida Land',
  invoiceId: 100 + id,
  invoiceReferenceId: null,
  paymentReferenceId: null,
  paymentStatus,
  paymentStatusName: paymentStatus,
  description: null,
  baseCurrency: 'PHP',
  baseAmount: 25000,
  convertedCurrency: null,
  convertedAmount: null,
  feeCurrency: 'PHP',
  feeAmount: 500,
  totalCurrency: 'PHP',
  totalAmount: 25500,
  processorCode: null,
  dueAt: null,
  submittedAt: null,
  paidAt: '2026-07-15T08:31:00+00:00',
  createdAt: '2026-06-01T00:00:00+00:00',
  updatedAt: '2026-07-15T08:31:00+00:00',
});

describe('enrollmentTransactionHistoryApi', () => {
  beforeEach(() => {
    capturedDefinitions = {};
    jest.clearAllMocks();
  });

  it('uses the authenticated API and preserves the cancellable programmatic action', () => {
    const module = loadModule();
    const abort = jest.fn();
    const cancellableThunk = jest.fn(() => ({ abort }));
    mockInitiate.mockReturnValue(cancellableThunk);

    expect(mockAppApi.injectEndpoints).toHaveBeenCalledTimes(1);
    expect(module.useGetEnrollmentTransactionHistoryQuery).toBe(mockHook);
    const requestThunk = module.getEnrollmentTransactionHistory({ page: 10, count: 10 });
    expect(requestThunk).toBe(cancellableThunk);
    expect(mockInitiate).toHaveBeenCalledWith({ page: 10, count: 10 });

    const request = cancellableThunk();
    request.abort();
    expect(abort).toHaveBeenCalledTimes(1);
  });

  it('builds a GET request with default offset 0 and limit 5', () => {
    const module = loadModule();

    expect(module.buildGetEnrollmentTransactionHistoryRequest()).toEqual({
      url: API_PATHS.enrollments.transactions,
      method: 'GET',
      params: { page: 0, count: 5 },
    });
    expect(capturedDefinitions.getEnrollmentTransactionHistory.query()).toEqual({
      url: 'enrollments/transactions',
      method: 'GET',
      params: { page: 0, count: 5 },
    });
  });

  it('forwards offset 10 and count 10 unchanged without multiplying them', () => {
    const module = loadModule();

    expect(module.buildGetEnrollmentTransactionHistoryRequest({
      page: 10,
      count: 10,
    }).params).toEqual({ page: 10, count: 10 });
  });

  it('omits empty search text and forwards normalized non-empty search text', () => {
    const module = loadModule();

    expect(module.buildGetEnrollmentTransactionHistoryRequest({
      searchQuery: '   ',
    }).params).toEqual({ page: 0, count: 5 });
    expect(module.buildGetEnrollmentTransactionHistoryRequest({
      searchQuery: '  QW-E-123456  ',
    }).params).toEqual({
      page: 0,
      count: 5,
      searchQuery: 'QW-E-123456',
    });
  });

  it('safely constrains invalid offsets and limits', () => {
    const module = loadModule();

    expect(module.normalizeEnrollmentTransactionHistoryParams({
      page: -4,
      count: 99,
    })).toEqual({ page: 0, count: 10 });
    expect(module.normalizeEnrollmentTransactionHistoryParams({
      page: Number.NaN,
      count: 0,
    })).toEqual({ page: 0, count: 1 });
  });

  it('uses stable normalized cache keys for equivalent request parameters', () => {
    const module = loadModule();
    const definition = capturedDefinitions.getEnrollmentTransactionHistory;

    expect(module.enrollmentTransactionHistoryQueryKeys.list({
      page: -1,
      count: 50,
      searchQuery: ' paid ',
    })).toEqual(['enrollmentTransactionHistory', 0, 10, 'paid']);
    expect(definition.serializeQueryArgs({
      queryArgs: { page: -1, count: 50, searchQuery: ' paid ' },
    })).toEqual(definition.serializeQueryArgs({
      queryArgs: { page: 0, count: 10, searchQuery: 'paid' },
    }));
  });

  it('retains nullable fields and every historical paid-status row', () => {
    const module = loadModule();
    const transactions = [
      makeTransaction('PAID', 1),
      makeTransaction('SETTLED', 2),
      makeTransaction('REFUNDED', 3),
      makeTransaction('PARTIALLY_REFUNDED', 4),
    ];
    const response: EnrollmentTransactionHistoryResponse = {
      transactions,
      pagination: { offset: 0, limit: 5, total: 4 },
    };

    const transformed = module.transformEnrollmentTransactionHistoryResponse(response);

    expect(transformed).toBe(response);
    expect(transformed.transactions.map(({ paymentStatus }) => paymentStatus)).toEqual([
      'PAID',
      'SETTLED',
      'REFUNDED',
      'PARTIALLY_REFUNDED',
    ]);
    expect(transformed.transactions[0]).toMatchObject({
      enrollmentReferenceId: null,
      invoiceReferenceId: null,
      paymentReferenceId: null,
      description: null,
      convertedCurrency: null,
      convertedAmount: null,
      processorCode: null,
      dueAt: null,
      submittedAt: null,
    });
  });

  it('preserves empty transaction responses and pagination metadata', () => {
    const module = loadModule();
    const response: EnrollmentTransactionHistoryResponse = {
      transactions: [],
      pagination: { offset: 10, limit: 10, total: 10 },
    };

    expect(module.transformEnrollmentTransactionHistoryResponse(response)).toEqual(response);
  });

  it('normalizes 400 errors without swallowing 401 or generic 500 failures', () => {
    const module = loadModule();
    const badRequest = {
      status: 400,
      data: { detail: 'page must be non-negative', traceId: 'internal' },
    } as FetchBaseQueryError;
    const unauthorized = {
      status: 401,
      data: { message: 'Unauthorized' },
    } as FetchBaseQueryError;
    const serverError = {
      status: 500,
      data: { message: 'Internal Server Error' },
    } as FetchBaseQueryError;

    expect(module.normalizeEnrollmentTransactionHistoryError(badRequest)).toEqual({
      message: 'Invalid pagination parameters',
    });
    expect(module.normalizeEnrollmentTransactionHistoryError(unauthorized)).toBe(unauthorized);
    expect(module.normalizeEnrollmentTransactionHistoryError(serverError)).toBe(serverError);
    expect(capturedDefinitions.getEnrollmentTransactionHistory.transformErrorResponse(badRequest))
      .toEqual({ message: 'Invalid pagination parameters' });
  });
});
