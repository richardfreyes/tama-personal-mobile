import { Colors } from '@/styles/common/colors';
import type { BillerStatusTone } from '@/types';

export const PAID_STATUS_PATTERN = /\b(paid|settled|completed)\b/i;
export const INACTIVE_STATUS_PATTERN = /\b(inactive|cancelled|canceled|archived|disabled)\b/i;
export const AMOUNT_FIELD_PATTERN = /\b(amount|balance|due|price|total|charge)\b/i;
export const INITIALS_IGNORED_WORDS = /^(by|of|inc|corp)$/i;
export const INITIALS_PUNCTUATION = /[.,;:!?'’"“”()[\]{}#&*+/\\|_-]+/g;

export const SAVED_BILL_NO_AMOUNT_LABEL = 'Enter amount';

export const SAVED_BILL_CARD_WIDTH = 156;
export const SAVED_BILL_CARD_GAP = 12;
export const SAVED_BILL_CARD_SNAP_INTERVAL = SAVED_BILL_CARD_WIDTH + SAVED_BILL_CARD_GAP;
export const SAVED_BILL_SKELETON_COUNT = 3;

export const SAVED_BILL_DATE_FORMAT = 'MMM d';
export const SAVED_BILL_NEVER_PAID_LABEL = 'Never paid';

export const SAVED_BILL_STATUS_ORDER: Record<BillerStatusTone, number> = {
  overdue: 0,
  due: 1,
  none: 2,
  paid: 3,
};

export const SAVED_BILL_STATUS_COLORS: Record<BillerStatusTone, { text: string; dot: string }> = {
  overdue: { text: Colors.red09, dot: Colors.red09 },
  due: { text: Colors.billDueText, dot: Colors.billDueDot },
  paid: { text: Colors.dashboardSuccessText, dot: Colors.dashboardSuccessText },
  none: { text: Colors.maroon09, dot: Colors.maroon06 },
};

export const SAVED_BILL_CONTRACT_KEYS = ['contractNumber', 'contractNo'] as const;

export const BILLER_SUMMARY_EMPTY_LABEL = 'Not provided';

export const BILLER_SUMMARY_PRIMARY_ROWS = [
  { id: 'paymentName', label: 'Payment Name', keys: ['paymentName'] },
  { id: 'projectName', label: 'Project Name', keys: ['projectName'] },
  { id: 'contractNumber', label: 'Contract Number', keys: SAVED_BILL_CONTRACT_KEYS },
  { id: 'customerName', label: 'Customer Name', keys: ['customerName'] },
] as const;

export const BILLER_SUMMARY_SECONDARY_ROWS = [
  { id: 'billName', label: 'Bill Name' },
  { id: 'payee', label: 'Payee' },
  { id: 'email', label: 'Email', keys: ['customerEmail', 'email'] },
  { id: 'mobile', label: 'Mobile' },
  { id: 'salesExecutive', label: 'Sales Executive Name', keys: ['agentName'] },
  { id: 'clientNotes', label: 'Client Notes' },
] as const;

export const BILLER_SUMMARY_HIDDEN_KEYS = ['amount', 'termsBox'] as const;

export const BILLER_SUMMARY_MOBILE_KEYS = ['mobileNo', 'mobileCallingCode', 'customerMobileNo'] as const;
