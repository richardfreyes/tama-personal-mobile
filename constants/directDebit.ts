import BpiIcon from '@/assets/icons/bpi.svg';
import ChinabankIcon from '@/assets/icons/chinabank.svg';
import RcbcIcon from '@/assets/icons/rcbc.svg';
import UbIcon from '@/assets/icons/unionbank.svg';
import type { DirectDebitOutcome } from '@/types/common';
import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

type SvgIcon = React.ComponentType<{ width?: number; height?: number; style?: StyleProp<ViewStyle> }>;

export interface DirectDebitBank {
  channelCode: string; // Xendit channel code, e.g. 'BA_BPI'
  label: string;
  icon: SvgIcon;
}

// `paymentMethodName` the API gives a linked bank account, as opposed to a saved card.
export const DIRECT_DEBIT_PAYMENT_METHOD_NAME = 'directdebit';

export const DIRECT_DEBIT_BANKS: DirectDebitBank[] = [
  { channelCode: 'BA_BPI', label: 'Bank of the Philippine Islands (BPI)', icon: BpiIcon },
  { channelCode: 'BA_CHINABANK', label: 'China Bank Savings (CHINABANK)', icon: ChinabankIcon },
  { channelCode: 'BA_RCBC', label: 'Rizal Commercial Banking Corporation (RCBC)', icon: RcbcIcon },
  { channelCode: 'BA_UBP', label: 'UnionBank of the Philippines (UBP)', icon: UbIcon },
];

export const DIRECT_DEBIT_BANK_LABELS: Record<string, string> = DIRECT_DEBIT_BANKS.reduce(
  (labels, bank) => ({ ...labels, [bank.channelCode]: bank.label }),
  {} as Record<string, string>,
);

export const DIRECT_DEBIT_RESULT_COPY: Record<DirectDebitOutcome, { title: string; message: string }> = {
  success: {
    title: 'Bank linked',
    message: 'Your bank account is now linked and ready to use for this payment.',
  },
  failure: {
    title: 'Linking failed',
    message: 'We couldn’t link your bank account. Please try again.',
  },
  cancelled: {
    title: 'Linking cancelled',
    message: 'You cancelled bank linking. You can try again anytime.',
  },
};
