import * as Crypto from 'expo-crypto';

const intentKeys = new Map<string, string>();

export const getPaymentIntentKey = (scope: string, reference: string): string => {
  const intent = `${scope}:${reference}`;
  const existing = intentKeys.get(intent);
  if (existing) return existing;

  // Keep keys for active intents across screen remounts, without retaining an
  // unbounded history in a long-running app session.
  if (intentKeys.size >= 100) {
    intentKeys.delete(intentKeys.keys().next().value!);
  }
  const key = Crypto.randomUUID();
  intentKeys.set(intent, key);
  return key;
};

export const clearPaymentIntentKeys = () => intentKeys.clear();
export const clearPaymentIntentKey = (scope: string, reference: string) => {
  intentKeys.delete(`${scope}:${reference}`);
};
