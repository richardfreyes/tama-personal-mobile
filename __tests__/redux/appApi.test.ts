import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { router } from 'expo-router';

const mockRawBaseQuery = jest.fn<(...args: any[]) => any>();
let mockFetchBaseQueryConfig: any;
let mockCreateApiConfig: any;
const mockResetApiState = jest.fn<(...args: any[]) => any>(() => ({ type: 'appApi/reset' }));
const mockCreatedApi = {
  reducerPath: 'appApi',
  util: { resetApiState: mockResetApiState },
};

jest.mock('@reduxjs/toolkit/query/react', () => ({
  fetchBaseQuery: jest.fn<(...args: any[]) => any>((config) => {
    mockFetchBaseQueryConfig = config;
    return mockRawBaseQuery;
  }),
  createApi: jest.fn<(...args: any[]) => any>((config) => {
    mockCreateApiConfig = config;
    return mockCreatedApi;
  }),
}));

describe('appApi base query', () => {
  let appApiModule: typeof import('@/redux/appApi');

  beforeAll(() => {
    jest.isolateModules(() => {
      appApiModule = require('@/redux/appApi');
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRawBaseQuery.mockResolvedValue({ data: { ok: true } });
  });

  it('configures the API reducer, tags, and empty endpoint collection', () => {
    expect(mockCreateApiConfig.reducerPath).toBe('appApi');
    expect(mockCreateApiConfig.baseQuery).toBe(appApiModule.baseQueryWithAuth);
    expect(mockCreateApiConfig.tagTypes).toEqual(expect.arrayContaining([
      'Transactions',
      'PaymentMethods',
      'Bills',
      'Profile',
      'Merchants',
      'Enrollments',
    ]));
    expect(mockCreateApiConfig.endpoints()).toEqual({});
  });

  it('prepares required client headers and optional bearer authorization', () => {
    const headers = new Headers();
    const prepared = mockFetchBaseQueryConfig.prepareHeaders(headers, {
      getState: () => ({ login: { token: 'token' } }),
    });
    expect(prepared.get('x-tama-client')).toBe('beta-mobile-app');
    expect(prepared.get('X-Client-Platform')).toBe('mobile');
    expect(prepared.get('accept')).toBe('application/json');
    expect(prepared.get('authorization')).toBe('Bearer token');

    const anonymous = new Headers();
    mockFetchBaseQueryConfig.prepareHeaders(anonymous, {
      getState: () => ({ login: { token: null } }),
    });
    expect(anonymous.has('authorization')).toBe(false);
  });

  it('returns successful and non-auth error results unchanged', async () => {
    const api = {
      getState: () => ({ login: { token: 'token' } }),
      dispatch: jest.fn<(...args: any[]) => any>(),
    };
    const success = { data: { ok: true }, meta: { response: { status: 200 } } };
    mockRawBaseQuery.mockResolvedValueOnce(success);
    await expect(appApiModule.baseQueryWithAuth('/profile', api as any, {}))
      .resolves.toBe(success);

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = { error: { status: 500, data: { message: 'failed' } } };
    mockRawBaseQuery.mockResolvedValueOnce(failure);
    await expect(appApiModule.baseQueryWithAuth({
      url: '/profile',
      method: 'POST',
      body: { name: 'Ada' },
    }, api as any, {})).resolves.toBe(failure);
    expect(api.dispatch).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      '[API Error] POST /profile',
      '\n  Status:', 500,
      '\n  Error code:', 'unknown',
    );
    consoleError.mockRestore();
  });

  it('does not report a retryable QR Ph pending response as a console error', async () => {
    const api = {
      getState: () => ({ login: { token: 'token' } }),
      dispatch: jest.fn<(...args: any[]) => any>(),
    };
    const pending = {
      error: {
        status: 409,
        data: { code: 'PAYMENT_PENDING', message: 'Payment is being recorded' },
      },
    };
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    mockRawBaseQuery.mockResolvedValueOnce(pending);

    await expect(appApiModule.baseQueryWithAuth({
      url: '/transactions/txn-1/qrph/verify',
      method: 'POST',
    }, api as any, {})).resolves.toBe(pending);

    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleInfo).toHaveBeenCalledWith(
      '[API Pending] POST /transactions/txn-1/qrph/verify',
    );
    consoleError.mockRestore();
    consoleInfo.mockRestore();
  });

  it('logs out authenticated users, clears API state, shows notice, and redirects on 401', async () => {
    const dispatch = jest.fn<(...args: any[]) => any>((action) => action);
    const api = {
      getState: () => ({ login: { token: 'expired-token' } }),
      dispatch,
    };
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    mockRawBaseQuery.mockResolvedValueOnce({
      error: { status: 401, data: { message: 'expired' } },
    });

    await appApiModule.baseQueryWithAuth('/secure', api as any, {});

    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'modal/showModal',
      payload: expect.objectContaining({
        headerMessage: 'Logged Out',
        iconType: 'info',
      }),
    }));
    expect(router.replace).toHaveBeenCalledWith('/login');
    consoleError.mockRestore();
    consoleInfo.mockRestore();
  });

  it('does not dispatch or redirect an anonymous 401 response', async () => {
    const dispatch = jest.fn<(...args: any[]) => any>();
    const api = {
      getState: () => ({ login: { token: null } }),
      dispatch,
    };
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    mockRawBaseQuery.mockResolvedValueOnce({ error: { status: 401 } });
    await appApiModule.baseQueryWithAuth('/public', api as any, {});
    expect(dispatch).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
    consoleError.mockRestore();
    consoleInfo.mockRestore();
  });
});
