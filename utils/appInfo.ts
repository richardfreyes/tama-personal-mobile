import { ENV, Environment } from '@/constants/env';
import Constants from 'expo-constants';

const ENVIRONMENT_LABELS: Record<Environment, string> = {
  local: 'Local',
  device: 'Device',
  custom: 'Custom',
  mock: 'Mock',
  sandbox: 'Sandbox',
  dev: 'Development',
  uat: 'UAT',
  prod: 'Production',
};

const getVersion = () => Constants.expoConfig?.version || 'N/A';

const getBuildNumber = () => {
  const iosBuildNumber = Constants.platform?.ios?.buildNumber;
  if (iosBuildNumber) return iosBuildNumber;

  const androidVersionCode = Constants.platform?.android?.versionCode;
  if (androidVersionCode !== undefined && androidVersionCode !== null) {
    return String(androidVersionCode);
  }

  const configIosBuildNumber = Constants.expoConfig?.ios?.buildNumber;
  if (configIosBuildNumber) return configIosBuildNumber;

  const configAndroidVersionCode = Constants.expoConfig?.android?.versionCode;
  if (configAndroidVersionCode !== undefined && configAndroidVersionCode !== null) {
    return String(configAndroidVersionCode);
  }

  return 'N/A';
};

const getReleaseDate = () => {
  const releaseDate = Constants.expoConfig?.extra?.RELEASE_DATE;
  return typeof releaseDate === 'string' && releaseDate.trim() ? releaseDate : undefined;
};

export const APP_INFO = {
  version: getVersion(),
  buildNumber: getBuildNumber(),
  environment: ENVIRONMENT_LABELS[ENV],
  releaseDate: getReleaseDate(),
} as const;

export const getAppVersionLabel = () => {
  if (!APP_INFO.buildNumber || APP_INFO.buildNumber === 'N/A') {
    return APP_INFO.version;
  }

  return `${APP_INFO.version} (${APP_INFO.buildNumber})`;
};
