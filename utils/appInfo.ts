import { APP_INFO } from '@/constants/appInfo';

export { APP_INFO } from '@/constants/appInfo';

export const getAppVersionLabel = () => {
  if (!APP_INFO.buildNumber || APP_INFO.buildNumber === 'N/A') {
    return APP_INFO.version;
  }

  return `${APP_INFO.version} (${APP_INFO.buildNumber})`;
};
