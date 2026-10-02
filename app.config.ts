import { ConfigContext, ExpoConfig } from 'expo/config';
import fs from 'fs';
import path from 'path';

const APP_ENV_CACHE = path.join(__dirname, '.app-env');

function resolveAppEnv(fallback?: string): string {
  const fromProcess = process.env.EXPO_PUBLIC_APP_ENV;

  if (fromProcess) {
    try {
      fs.writeFileSync(APP_ENV_CACHE, `${fromProcess}\n`);
    } catch {
      // best-effort persistence; ignore write failures
    }
    return fromProcess;
  }

  try {
    const cached = fs.readFileSync(APP_ENV_CACHE, 'utf8').trim();
    if (cached) return cached;
  } catch {
    // no cache file yet — fall through to the static default
  }

  return fallback || 'prod';
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Aqwire Personal',
  slug: config.slug ?? 'aqwire-personal',
  extra: {
    ...config.extra,
    APP_ENV: resolveAppEnv(config.extra?.APP_ENV as string | undefined),
  },
});
