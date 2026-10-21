/* eslint-disable @typescript-eslint/no-require-imports */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockTron = {
  setAsyncStorageHandler: jest.fn().mockReturnThis(),
  configure: jest.fn().mockReturnThis(),
  useReactNative: jest.fn().mockReturnThis(),
  use: jest.fn().mockReturnThis(),
  connect: jest.fn().mockReturnThis(),
  display: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.mock('reactotron-react-native', () => ({ __esModule: true, default: mockTron }));
jest.mock('reactotron-redux', () => ({ reactotronRedux: jest.fn() }));

describe('Reactotron timeline logging', () => {
  const originalConsole = { log: console.log, info: console.info, debug: console.debug, warn: console.warn, error: console.error };
  const originalFetchSetting = process.env.EXPO_PUBLIC_USE_RN_FETCH;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_USE_RN_FETCH;
    console.log = jest.fn();
    console.info = jest.fn();
    console.debug = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
    if (originalFetchSetting === undefined) {
      delete process.env.EXPO_PUBLIC_USE_RN_FETCH;
    } else {
      process.env.EXPO_PUBLIC_USE_RN_FETCH = originalFetchSetting;
    }
  });

  it('passes Expo fetch explicitly even when it has no Expo detection marker', () => {
    const fetch = globalThis.fetch;
    require('../ReactotronConfig');

    expect(mockTron.useReactNative).toHaveBeenCalledWith(expect.objectContaining({
      networking: expect.objectContaining({ fetch }),
    }));
  });

  it.each(['1', 'true'])('leaves fetch interception to XHR when RN fetch is enabled with %s', (setting) => {
    process.env.EXPO_PUBLIC_USE_RN_FETCH = setting;
    require('../ReactotronConfig');

    expect(mockTron.useReactNative).toHaveBeenCalledWith(expect.objectContaining({
      networking: expect.objectContaining({ fetch: undefined }),
    }));
  });

  it('forwards API info logs and their status to the timeline before connection', () => {
    const nativeInfo = console.info;
    require('../ReactotronConfig');

    console.info('[API Success] GET /profile', '\n  Status:', 200);

    expect(nativeInfo).toHaveBeenCalledWith('[API Success] GET /profile', '\n  Status:', 200);
    expect(mockTron.log).toHaveBeenCalledWith('[API Success] GET /profile', '\n  Status:', 200);
  });

  it('preserves all warning and error arguments in the timeline', () => {
    require('../ReactotronConfig');

    console.warn('Warning', 409);
    console.error('[API Error]', 'Status:', 500, 'Message:', 'failed');

    expect(mockTron.warn).toHaveBeenCalledWith(['Warning', 409]);
    expect(mockTron.error).toHaveBeenCalledWith('[API Error] Status: 500 Message: failed', []);
  });
});
