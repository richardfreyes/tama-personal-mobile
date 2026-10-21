import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { appApi } from '@/redux/appApi';
import loginReducer from '@/redux/features/login/loginApi';
import { cacheCompletedTransaction, transactionApi } from '@/redux/features/transactions/transactionApi';
import type { Transaction } from '@/types';

const createTestStore = () => configureStore({
  reducer: { [appApi.reducerPath]: appApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(appApi.middleware),
});

const makeTransaction = (overrides: Partial<Transaction>): Transaction => ({
  externalTransactionId: 'payment-existing',
  billingName: 'Existing bill',
  invoiceReferenceId: 'invoice-existing',
  merchantName: 'Electric Corp',
  baseAmount: 50,
  baseCurrency: 'PHP',
  status: 'captured',
  createdAt: '2026-06-01T09:00:00Z',
  ...overrides,
});

const createFullTestStore = () => configureStore({
  reducer: {
    login: loginReducer,
    [appApi.reducerPath]: appApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(appApi.middleware),
});

describe('payTransaction request shape', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('sends an empty JSON body with Idempotency-Key and Content-Type application/json', async () => {
    const capturedRequests: Request[] = [];

    // RTK Query calls fetchFn(request) with a single Request object — not (url, init).
    // `fetch` may be installed as a lazy getter in the jest-expo node environment, so use
    // Object.defineProperty to forcefully replace it with a writable value property and restore
    // the original descriptor afterward.
    const originalDescriptor = Object.getOwnPropertyDescriptor(global, 'fetch');
    const mockFetch = jest.fn(async (request: Request) => {
      capturedRequests.push(request);
      return new Response(JSON.stringify({ redirect: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true, configurable: true });

    const testStore = createFullTestStore();
    try {
      await testStore.dispatch(
        transactionApi.endpoints.payTransaction.initiate({
          transactionId: 'txn_abc123',
          idempotencyKey: 'idem_key_xyz',
        }),
      );
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(global, 'fetch', originalDescriptor);
      } else {
        delete (global as any).fetch;
      }
      testStore.dispatch(appApi.util.resetApiState());
    }

    expect(capturedRequests).toHaveLength(1);
    const { headers } = capturedRequests[0];
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('idempotency-key')).toBe('idem_key_xyz');
    expect(await capturedRequests[0].text()).toBe('{}');
  });
});

describe('completed transaction cache reconciliation', () => {
  const stores: ReturnType<typeof createTestStore>[] = [];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    stores.forEach((testStore) => testStore.dispatch(appApi.util.resetApiState()));
    stores.length = 0;
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('shows each of two consecutive bill payments immediately and only once', async () => {
    const testStore = createTestStore();
    stores.push(testStore);
    const queryArgs = { page: 1, count: 10, searchQuery: '' };

    await testStore.dispatch(transactionApi.util.upsertQueryData('getTransactions', queryArgs, {
      items: [makeTransaction({})],
      totalCount: 1,
      currentPage: 1,
    }));

    const firstPayment = makeTransaction({
      externalTransactionId: 'payment-first',
      invoiceReferenceId: 'invoice-first',
      billingName: 'First payment',
      status: 'pending',
      createdAt: '2026-06-01T10:00:00Z',
    });
    const secondPayment = makeTransaction({
      externalTransactionId: 'payment-second',
      invoiceReferenceId: 'invoice-first',
      billingName: 'Second payment',
      status: 'failed',
      createdAt: '2026-06-01T11:00:00Z',
    });

    testStore.dispatch(cacheCompletedTransaction(firstPayment) as any);
    testStore.dispatch(cacheCompletedTransaction(secondPayment) as any);
    testStore.dispatch(cacheCompletedTransaction(secondPayment) as any);

    const cachedPage = transactionApi.endpoints.getTransactions.select(queryArgs)(
      testStore.getState() as any,
    ).data;

    expect(cachedPage?.items.map(({ externalTransactionId }) => externalTransactionId)).toEqual([
      'payment-second',
      'payment-first',
      'payment-existing',
    ]);
    expect(cachedPage?.totalCount).toBe(3);
    expect(cachedPage?.items.slice(0, 2).map(({ status }) => status)).toEqual([
      'failed',
      'pending',
    ]);
  });
});
