import { JwtPayload } from '@/types';
import { decode } from 'base-64';

if (typeof global.atob === 'undefined') {
  global.atob = decode;
}

export const normalizeBase64Url = (segment: string): string => {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  return padding ? normalized + '='.repeat(4 - padding) : normalized;
};

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }

    const payload = normalizeBase64Url(parts[1]);

    const decodedPayload = global.atob(payload);
    const parsedPayload = JSON.parse(decodedPayload);
    return parsedPayload as JwtPayload;

  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};