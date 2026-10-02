import { afterEach, describe, expect, it, jest } from '@jest/globals';
const loadAppInfo = (constants: object) => {
  jest.resetModules();
  jest.doMock('expo-constants', () => ({
    __esModule: true,
    default: constants,
  }));
  jest.doMock('@/constants/env', () => ({
    ENV: 'uat',
  }));
  return require('@/utils/appInfo');
};

describe('appInfo', () => {
  afterEach(() => {
    jest.dontMock('expo-constants');
    jest.dontMock('@/constants/env');
  });

  it('prefers native iOS build metadata and includes it in the label', () => {
    const { APP_INFO, getAppVersionLabel } = loadAppInfo({
      expoConfig: { version: '2.3.4', extra: { RELEASE_DATE: '2026-07-27' } },
      platform: { ios: { buildNumber: '55' } },
    });
    expect(APP_INFO).toEqual({
      version: '2.3.4',
      buildNumber: '55',
      environment: 'UAT',
      releaseDate: '2026-07-27',
    });
    expect(getAppVersionLabel()).toBe('2.3.4 (55)');
  });

  it('falls through Android and config build metadata in priority order', () => {
    expect(loadAppInfo({
      expoConfig: { version: '1', android: { versionCode: 9 } },
      platform: { android: { versionCode: 7 } },
    }).APP_INFO.buildNumber).toBe('7');
    expect(loadAppInfo({
      expoConfig: { version: '1', ios: { buildNumber: '8' } },
      platform: {},
    }).APP_INFO.buildNumber).toBe('8');
    expect(loadAppInfo({
      expoConfig: { version: '1', android: { versionCode: 9 } },
      platform: {},
    }).APP_INFO.buildNumber).toBe('9');
  });

  it('uses N/A and omits blank release metadata', () => {
    const { APP_INFO, getAppVersionLabel } = loadAppInfo({
      expoConfig: { extra: { RELEASE_DATE: ' ' } },
      platform: {},
    });
    expect(APP_INFO.version).toBe('N/A');
    expect(APP_INFO.buildNumber).toBe('N/A');
    expect(APP_INFO.releaseDate).toBeUndefined();
    expect(getAppVersionLabel()).toBe('N/A');
  });
});
