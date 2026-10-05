import Constants from 'expo-constants';
import type { EnvConfig, Environment, EnvSource } from '@/types/environment';

const VALID_ENVIRONMENTS: readonly Environment[] = [
  'local', 'device', 'custom', 'mock', 'sandbox', 'dev', 'uat', 'prod',
];

const BASE = {
  LOCALHOST: 'http://localhost',
  LOCALHOST_IP: 'http://192.168.68.86',

  WIREMO: {
    DEV: 'https://app.aqwire.dev',
    UAT: 'https://uat-app.aqwire.io',
    PROD: 'https://app.aqwire.io',
  },
  DEVICE: {
    ANDROID: 'http://10.0.2.2',
  },
} as const;

const LOCAL_API = `${BASE.LOCALHOST}:8800`;

const SHARED_DEFAULTS = {
  enableLogging: true,
  enableMockMode: false,
} as const;

const ENV_CONFIGS: Record<Environment, EnvConfig> = {
  local: {
    ...SHARED_DEFAULTS,
    base: `${LOCAL_API}`,
  },
  device: {
    ...SHARED_DEFAULTS,
    base: `${BASE.LOCALHOST_IP}:8800`,
  },
  custom: {
    ...SHARED_DEFAULTS,
    base: `${LOCAL_API}`,
  },
  mock: {
    ...SHARED_DEFAULTS,
    base: `${LOCAL_API}`,
    enableMockMode: true,
  },
  sandbox: {
    ...SHARED_DEFAULTS,
    base: `${BASE.WIREMO.UAT}/v1`,
  },
  dev: {
    ...SHARED_DEFAULTS,
    base: `${BASE.WIREMO.UAT}/v1`,
  },
  uat: {
    ...SHARED_DEFAULTS,
    base: `${BASE.WIREMO.UAT}/v1`,
  },
  prod: {
    ...SHARED_DEFAULTS,
    base: `${BASE.WIREMO.PROD}/v1`,
    enableLogging: false,
  },
};

function isValidEnvironment(value: string): value is Environment {
  return VALID_ENVIRONMENTS.includes(value as Environment);
}

let envSource: EnvSource = 'default';

export const ENVIRONMENT_LABELS: Record<Environment, string> = {
  local: 'Local',
  device: 'Device',
  custom: 'Custom',
  mock: 'Mock',
  sandbox: 'Sandbox',
  dev: 'Development',
  uat: 'UAT',
  prod: 'Production',
};

function resolveEnvironment(): Environment {
  const fromEnv = process.env.EXPO_PUBLIC_APP_ENV;
  if (fromEnv && isValidEnvironment(fromEnv)) { envSource = 'EXPO_PUBLIC_APP_ENV'; return fromEnv; }
  if (fromEnv) {
    console.warn(`[env] Unknown environment "${fromEnv}", falling back to "custom".`);
    envSource = 'EXPO_PUBLIC_APP_ENV';
    return 'custom';
  }

  const fromConfig = Constants.expoConfig?.extra?.APP_ENV as string | undefined;
  if (fromConfig && isValidEnvironment(fromConfig)) { envSource = 'expoConfig.extra.APP_ENV'; return fromConfig; }
  if (fromConfig) {
    console.warn(`[env] Unknown baked environment "${fromConfig}", falling back to "custom".`);
    envSource = 'expoConfig.extra.APP_ENV';
    return 'custom';
  }

  return __DEV__ ? 'local' : 'prod';
}

export const ENV: Environment = resolveEnvironment();
export const CONFIG: Record<Environment, EnvConfig> = ENV_CONFIGS;
export const ENV_CONFIG: EnvConfig = ENV_CONFIGS[ENV];

console.info(
  `[ENV] Running in "${ENV}" environment (source: ${envSource})\n` +
  `  API:     ${ENV_CONFIG.base}\n` +
  `  Mock:    ${ENV_CONFIG.enableMockMode}  |  Logging: ${ENV_CONFIG.enableLogging}`
);

export const getEnv = (): Environment => ENV;
export const getEnvConfig = (env?: Environment): EnvConfig => ENV_CONFIGS[env ?? ENV];
export const isLocal = (): boolean => ENV === 'local';
export const isMock = (): boolean => ENV === 'mock';
export const isDevice = (): boolean => ENV === 'device';
export const isProduction = (): boolean => ENV === 'prod';
