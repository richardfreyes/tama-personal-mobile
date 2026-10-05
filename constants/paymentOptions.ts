import AmexCardIcon from '@/assets/icons/amex.svg';
import ApplePayIcon from '@/assets/icons/apple-pay.svg';
import bankTransfer from '@/assets/icons/bank-transfer.svg';
import BankIcon from '@/assets/icons/bank.svg';
import BdoIcon from '@/assets/icons/bdo.svg';
import BpiIcon from '@/assets/icons/bpi.svg';
import ChinabankIcon from '@/assets/icons/chinabank.svg';
import CreditCardOutlineIcon from '@/assets/icons/credit-card-outline.svg';
import DinnersClubCardIcon from '@/assets/icons/diners-club.svg';
import DiscoverCardIcon from '@/assets/icons/discover.svg';
import GCashIcon from '@/assets/icons/gcash.svg';
import GPayIcon from '@/assets/icons/gpay.svg';
import GrabPayIcon from '@/assets/icons/grab-pay.svg';
import MasterCardIcon from '@/assets/icons/mastercard.svg';
import MayaIcon from '@/assets/icons/maya.svg';
import PaypalIcon from '@/assets/icons/paypal.svg';
import QrPHIcon from '@/assets/icons/qrph.svg';
import RcbcIcon from '@/assets/icons/rcbc.svg';
import SepaIcon from '@/assets/icons/sepa.svg';
import UbIcon from '@/assets/icons/unionbank.svg';
import UnionPayCardIcon from '@/assets/icons/unionpay.svg';
import VisaCardIcon from '@/assets/icons/visa.svg';
import type { LogoReference, OneTimePaymentMethod, PaymentSourceOption } from '@/types';
import { ONE_TIME_PAYMENT_FLOWS } from './oneTimePaymentFlows';

export const PAYMENT_METHOD_PRIORITY_COUNTRIES = ['PH', 'US'];

export const paymentCardLogos = {
  mastercard: { id: 'mc', uri: MasterCardIcon, altText: 'Mastercard' },
  visa: { id: 'visa', uri: VisaCardIcon, altText: 'Visa' },
  amex: { id: 'amex', uri: AmexCardIcon, altText: 'American Express' },
  discover: { id: 'discover', uri: DiscoverCardIcon, altText: 'Discover' },
  diners: { id: 'diners', uri: DinnersClubCardIcon, altText: 'Diners Club' },
  unionpay: { id: 'unionpay', uri: UnionPayCardIcon, altText: 'UnionPay' },
  paypal: { id: 'paypal', uri: PaypalIcon, altText: 'PayPal' },
  bdo: { id: 'bdo', uri: BdoIcon, altText: 'BDO' },
  ub: { id: 'ub', uri: UbIcon, altText: 'UnionBank' },
  bpi: { id: 'bpi', uri: BpiIcon, altText: 'BPI' },
  chinabank: { id: 'chinabank', uri: ChinabankIcon, altText: 'Chinabank' },
  rcbc: { id: 'rcbc', uri: RcbcIcon, altText: 'RCBC' },
  gcash: { id: 'gcash', uri: GCashIcon, altText: 'GCash' },
  grabpay: { id: 'grab', uri: GrabPayIcon, altText: 'GrabPay' },
  maya: { id: 'maya', uri: MayaIcon, altText: 'Maya' },
  qrph: { id: 'qrph', uri: QrPHIcon, altText: 'QR PH' },
  gpay: { id: 'gpay', uri: GPayIcon, altText: 'Google Pay' },
  applepay: { id: 'applepay', uri: ApplePayIcon, altText: 'Apple Pay' },
  sepa: { id: 'sepa', uri: SepaIcon, altText: 'Sepa' },
  bankTransfer: { id: 'banktransfer', uri: bankTransfer, altText: 'Bank Transfer' },
};

export const PAYMENT_OPTIONS = [
  { id: ONE_TIME_PAYMENT_FLOWS.card.paymentOptionId, title: ONE_TIME_PAYMENT_FLOWS.card.title, logos: [
      paymentCardLogos.mastercard as LogoReference,
      paymentCardLogos.visa as LogoReference,
      paymentCardLogos.amex as LogoReference,
      paymentCardLogos.discover as LogoReference,
      paymentCardLogos.diners as LogoReference,
      paymentCardLogos.unionpay as LogoReference
    ] as readonly LogoReference[], mainLogoUri: null
  },
  { id: ONE_TIME_PAYMENT_FLOWS.paypal.paymentOptionId, title: ONE_TIME_PAYMENT_FLOWS.paypal.title, logos: [], mainLogoUri: paymentCardLogos.paypal },
  { id: 3, title: 'PayPal US', logos: [], mainLogoUri: paymentCardLogos.paypal },
  { id: 4, title: 'PayPal PH', logos: [], mainLogoUri: paymentCardLogos.paypal },
  { id: ONE_TIME_PAYMENT_FLOWS.bank.paymentOptionId, title: ONE_TIME_PAYMENT_FLOWS.bank.title, logoSpacing: 16, logos: [
      paymentCardLogos.bpi as LogoReference,
      paymentCardLogos.chinabank as LogoReference,
      paymentCardLogos.rcbc as LogoReference,
      paymentCardLogos.ub as LogoReference,
    ] as readonly LogoReference[], mainLogoUri: null
  },
  {
    id: ONE_TIME_PAYMENT_FLOWS.qrph.paymentOptionId, title: ONE_TIME_PAYMENT_FLOWS.qrph.title, logos: [], mainLogoUri: paymentCardLogos.qrph
  },
  {
    id: 7, title: 'Google Pay', logos: [], mainLogoUri: paymentCardLogos.gpay
  },
  {
    id: 8, title: 'Apple Pay', logos: [], mainLogoUri: paymentCardLogos.applepay
  },
  {
    id: 9, title: 'SEPA', logos: [], mainLogoUri: paymentCardLogos.sepa
  },
  { id: 10, title: 'E-Wallet', logos: [
      paymentCardLogos.gcash as LogoReference,
      paymentCardLogos.grabpay as LogoReference
    ] as readonly LogoReference[], mainLogoUri: null
  },
  {
    id: 11, title: 'Bank Transfer', logos: [], mainLogoUri: paymentCardLogos.bankTransfer
  }
] as const;

export const PAYMENT_SOURCE_OPTIONS: PaymentSourceOption[] = [
  { value: 'saved', label: 'Saved card', description: 'Pay using a card saved to your account.' },
  { value: 'new-card', label: 'Other method', description: 'Use this payment method once. It won’t be saved.' }
];

export const ONE_TIME_PAYMENT_METHODS: OneTimePaymentMethod[] = [
  {
    value: ONE_TIME_PAYMENT_FLOWS.card.value,
    title: ONE_TIME_PAYMENT_FLOWS.card.title,
    description: 'Visa, Mastercard, Amex, Discover, Diners, UnionPay',
    icon: CreditCardOutlineIcon,
    iconWidth: 22,
    iconHeight: 22,
  },
  {
    value: ONE_TIME_PAYMENT_FLOWS.paypal.value,
    title: ONE_TIME_PAYMENT_FLOWS.paypal.title,
    description: 'Pay with your PayPal account',
    icon: PaypalIcon,
    iconWidth: 38,
    iconHeight: 12,
  },
  {
    value: ONE_TIME_PAYMENT_FLOWS.bank.value,
    title: ONE_TIME_PAYMENT_FLOWS.bank.title,
    description: 'BPI, RCBC, UnionBank and more',
    icon: BankIcon,
    iconWidth: 22,
    iconHeight: 22,
  },
  {
    value: ONE_TIME_PAYMENT_FLOWS.qrph.value,
    title: ONE_TIME_PAYMENT_FLOWS.qrph.title,
    description: 'Scan with any bank or e-wallet app',
    icon: QrPHIcon,
    iconWidth: 38,
    iconHeight: 12,
  },
];

export const AUTOPAY_STATUS = [
  'successful',
  'incomplete',
  'cancelled',
  'uncaptured',
  'declined',
] as const;

export const STATUS_LABELS = {
  successful: 'Successful',
  incomplete: 'Incomplete',
  cancelled: 'Cancelled',
  uncaptured: 'Pending',
  declined: 'Declined',
} as Record<string, string>;

export const PAYMENT_METHOD_SKELETON_COUNT = 2;
