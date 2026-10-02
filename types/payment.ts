import type React from "react";
import type { ViewStyle } from "react-native";
import type { TransactionSource } from "./transaction";

export type SvgComponent = React.FC<any>;

export type DirectDebitOutcome = 'success' | 'failure' | 'cancelled';

export interface DirectDebitCallbackResult {
  outcome: DirectDebitOutcome;
}

/** Hosted payments that return to the app through the `payment-result` deep link. */
export type PaymentResultProvider = 'paypal' | 'qrph';

/** Outcome reported by the provider redirect. Only a hint: the backend is the source of truth. */
export type PaymentResultOutcome = 'success' | 'failure' | 'cancelled' | 'error';

/** What the payment result screen shows after reconciling with the backend. */
export type PaymentResultStatus = Exclude<PaymentResultOutcome, 'success'> | 'pending';

export interface PaymentResultCallback {
  provider: PaymentResultProvider;
  outcome: PaymentResultOutcome;
  transactionReferenceId?: string;
  invoiceReferenceId?: string;
}

export type PayPalSession = {
  transactionReferenceId: string;
  invoiceReferenceId: string;
  redirectUrl: string;
};

export type QrphSession = {
  transactionReferenceId: string;
  invoiceReferenceId: string;
};

export interface LogoReference {
  id: string;
  uri: SvgComponent;
  altText: string;
}

export interface PaymentOption {
  id: number | string;
  title: string;
  logos: readonly LogoReference[];
  logoSpacing?: number;
  mainLogoUri: LogoReference | null;
}

export interface PaymentMethodCardProps {
  option: PaymentOption;
  onPress: () => void;
  style?: ViewStyle;
}

export interface AppliedFilters {
  statusFilters: string[];
  transactionTypeFilters: TransactionSource[];
  createdAtRange: string;
  project: string;
  paymentType: string;
  startDate?: string;
  endDate?: string;
}

export interface FilterAutopayProps {
  onApply: (filters: AppliedFilters) => void;
  onReset: () => void;
}

export type DateRange = {
  startDate?: Date;
  endDate?: Date;
};

export interface PaymentMethodParams {
  referenceId: string;
  billingCardholderName: string;
  lastFourCardDigits: string;
  paymentMethodExpiry: string;
  paymentMethodProvider: string;
  billingCityAddress: string;
  billingStateAddress: string;
  billingPostalCode: string;
  billingCountryAddress: string;
  isPrimary: boolean;
}

export type PaymentInfoRow = {
  label: string;
  value: string;
  weight?: '400' | '500' | '600' | '700';
};

export type EnrollmentCardPayload = {
  cardholderName: string;
  creditCardNumber: string;
  cardSecurityCode: string;
  billingCountry: string;
  billingCountryCode: string;
  billingPostalCode: string;
  billingStreet: string;
  billingState: string;
  billingCity: string;
  expiryDate: string;
};

export type NormalizedCardDetails = {
  cardholderName: string;
  firstName: string;
  lastName: string;
  creditCardNumber: string;
  cardScheme: string;
  binNumber: string;
  lastFourDigits: string;
};

export type PaymentInfoSectionProps = {
  title: string;
  rows: PaymentInfoRow[];
};
