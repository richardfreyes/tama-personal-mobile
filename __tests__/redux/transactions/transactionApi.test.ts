import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { appApi } from '@/redux/appApi';
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
