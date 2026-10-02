import { getNativeIntentPath } from '@/utils/nativeIntent';

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  return getNativeIntentPath(path);
}
