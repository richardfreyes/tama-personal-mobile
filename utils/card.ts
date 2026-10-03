import AmexCardIcon from '@/assets/icons/amex.svg';
import ApplePayIcon from '@/assets/icons/apple-pay.svg';
import BdoIcon from '@/assets/icons/bdo.svg';
import BpiIcon from '@/assets/icons/bpi.svg';
import CreditCardIcon from '@/assets/icons/credit-card.svg';
import DinersClubCardIcon from '@/assets/icons/diners-club.svg';
import DiscoverCardIcon from '@/assets/icons/discover.svg';
import GCashIcon from '@/assets/icons/gcash.svg';
import GPayIcon from '@/assets/icons/gpay.svg';
import GrabPayIcon from '@/assets/icons/grab-pay.svg';
import MasterCardIcon from '@/assets/icons/mastercard.svg';
import MayaIcon from '@/assets/icons/maya.svg';
import PaypalIcon from '@/assets/icons/paypal.svg';
import QrPHIcon from '@/assets/icons/qrph.svg';
import SepaIcon from '@/assets/icons/sepa.svg';
import UbIcon from '@/assets/icons/unionbank.svg';
import UnionPayCardIcon from '@/assets/icons/unionpay.svg';
import VisaCardIcon from '@/assets/icons/visa.svg';
import { COMMON } from "@/constants/common";
import { DIRECT_DEBIT_PAYMENT_METHOD_NAME } from '@/constants/directDebit';
import type { PaymentMethod } from '@/redux/features/paymentMethods/paymentMethodTypes';

export type CardProvider = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

const cardPatterns: Record<CardProvider, RegExp> = {
  visa: COMMON.VALIDATORS.CARD_PATTERNS.VISA,
  mastercard: COMMON.VALIDATORS.CARD_PATTERNS.MASTERCARD,
  amex: COMMON.VALIDATORS.CARD_PATTERNS.AMEX,
  discover: COMMON.VALIDATORS.CARD_PATTERNS.DISCOVER,
  unknown: COMMON.VALIDATORS.CARD_PATTERNS.UNKNOWN,
};

export const detectCardProvider = (cardNumber: string): CardProvider => {
  const cleanedNumber = cardNumber.replace(/\s/g, '');

  if (cardPatterns.visa.test(cleanedNumber)) {
    return 'visa';
  }
  if (cardPatterns.mastercard.test(cleanedNumber)) {
    return 'mastercard';
  }
  if (cardPatterns.amex.test(cleanedNumber)) {
    return 'amex';
  }
  if (cardPatterns.discover.test(cleanedNumber)) {
    return 'discover';
  }
  
  return 'unknown';
};

export const getCardIcon = (provider?: string | null) => {
  const normalizedProvider = (provider ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalizedProvider.includes('visa')) return { uri: VisaCardIcon };
  if (normalizedProvider.includes('mastercard')) return { uri: MasterCardIcon };
  if (normalizedProvider.includes('amex') || normalizedProvider.includes('americanexpress')) return { uri: AmexCardIcon };
  if (normalizedProvider.includes('discover')) return { uri: DiscoverCardIcon };
  if (normalizedProvider.includes('diners')) return { uri: DinersClubCardIcon };
  if (normalizedProvider.includes('unionpay')) return { uri: UnionPayCardIcon };
  if (normalizedProvider.includes('sepa')) return { uri: SepaIcon };
  if (normalizedProvider.includes('bdo')) return { uri: BdoIcon };
  if (normalizedProvider.includes('bpi')) return { uri: BpiIcon };
  if (normalizedProvider.includes('unionbank') || normalizedProvider === 'ub') return { uri: UbIcon };
  if (normalizedProvider.includes('paypal')) return { uri: PaypalIcon };
  if (normalizedProvider.includes('gcash')) return { uri: GCashIcon };
  if (normalizedProvider.includes('grab')) return { uri: GrabPayIcon };
  if (normalizedProvider.includes('maya')) return { uri: MayaIcon };
  if (normalizedProvider.includes('qrph')) return { uri: QrPHIcon };
  if (normalizedProvider.includes('gpay') || normalizedProvider.includes('google')) return { uri: GPayIcon };
  if (normalizedProvider.includes('apple')) return { uri: ApplePayIcon };
  return { uri: CreditCardIcon };
};

export const getProviderDisplay = (provider?: string | null): string => {
  const normalizedProvider = provider?.trim();

  if (!normalizedProvider) return 'Card';

  return normalizedProvider.charAt(0).toUpperCase() + normalizedProvider.slice(1).toLowerCase();
};

export const formatLastFourDigits = (lastFour?: string | null): string => {
  const trimmedLastFour = lastFour?.trim();

  return trimmedLastFour || '----';
};

// Direct debit is a one-time-payment-only method offered inside the pay flow, so it is never
// presented in the saved payment methods lists.
export const getSavedPaymentMethods = (methods?: PaymentMethod[] | null): PaymentMethod[] => (
  (methods ?? []).filter(
    (method) => method.paymentMethodName?.toLowerCase() !== DIRECT_DEBIT_PAYMENT_METHOD_NAME,
  )
);