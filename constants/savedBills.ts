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

export const SAVED_BILL_NO_AMOUNT_LABEL = 'No amount set';

export const SAVED_BILL_CARD_WIDTH = 156;
export const SAVED_BILL_CARD_GAP = 12;
export const SAVED_BILL_CARD_SNAP_INTERVAL = SAVED_BILL_CARD_WIDTH + SAVED_BILL_CARD_GAP;
export const SAVED_BILL_SKELETON_COUNT = 3;
