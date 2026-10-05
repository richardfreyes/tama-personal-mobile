import Constants from 'expo-constants';
import { ENV, ENVIRONMENT_LABELS } from './env';

const getVersion = () => Constants.expoConfig?.version || 'N/A';

const getBuildNumber = () => {
  const iosBuildNumber = Constants.platform?.ios?.buildNumber;
  if (iosBuildNumber) return iosBuildNumber;

  const androidVersionCode = Constants.platform?.android?.versionCode;
  if (androidVersionCode !== undefined && androidVersionCode !== null) return String(androidVersionCode);

  const configIosBuildNumber = Constants.expoConfig?.ios?.buildNumber;
  if (configIosBuildNumber) return configIosBuildNumber;

  const configAndroidVersionCode = Constants.expoConfig?.android?.versionCode;
  if (configAndroidVersionCode !== undefined && configAndroidVersionCode !== null) return String(configAndroidVersionCode);

  return 'N/A';
};

const getReleaseDate = () => {
  const releaseDate = Constants.expoConfig?.extra?.RELEASE_DATE;
  return typeof releaseDate === 'string' && releaseDate.trim() ? releaseDate : undefined;
};

export const APP_INFO = {
  version: getVersion(),
  buildNumber: getBuildNumber(),
  environment: ENVIRONMENT_LABELS?.[ENV] ?? ENV.toUpperCase(),
  releaseDate: getReleaseDate(),
} as const;
