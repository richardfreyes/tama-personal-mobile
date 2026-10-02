import { Colors } from '@/styles/common/colors';

export const AVATAR_COLORS = [
  Colors.red10,
  Colors.maroon10,
  Colors.info06,
  Colors.amber09,
  Colors.rose08,
  Colors.success09,
] as const;

export const PAID_STATUS_PATTERN = /\b(paid|settled|completed)\b/i;
export const INACTIVE_STATUS_PATTERN = /\b(inactive|cancelled|canceled|archived|disabled)\b/i;
export const AMOUNT_FIELD_PATTERN = /\b(amount|balance|due|price|total|charge)\b/i;
