import { afterEach, describe, expect, it, jest } from '@jest/globals';

const originalAppEnv = process.env.EXPO_PUBLIC_APP_ENV;

afterEach(() => {
  if (originalAppEnv === undefined) {
    delete process.env.EXPO_PUBLIC_APP_ENV;
  } else {
    process.env.EXPO_PUBLIC_APP_ENV = originalAppEnv;
  }
  jest.resetModules();
});

describe('environment selection', () => {
  it('selects mock mode for the supported mock run scripts', () => {
    process.env.EXPO_PUBLIC_APP_ENV = 'mock';
    jest.resetModules();

    const { ENV, ENV_CONFIG, getEnvConfig, isMock } = require('@/constants/env');

    expect(ENV).toBe('mock');
    expect(isMock()).toBe(true);
    expect(ENV_CONFIG.enableMockMode).toBe(true);
    expect(getEnvConfig('mock').base).toBe('http://localhost:8800');
  });
});
