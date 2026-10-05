export type Environment = 'local' | 'device' | 'custom' | 'mock' | 'sandbox' | 'dev' | 'uat' | 'prod';

export type EnvSource = 'EXPO_PUBLIC_APP_ENV' | 'expoConfig.extra.APP_ENV' | 'default';

export interface EnvConfig {
  base: string;
  enableLogging: boolean;
  enableMockMode: boolean;
}
