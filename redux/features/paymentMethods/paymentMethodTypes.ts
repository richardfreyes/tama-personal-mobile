export interface PaymentMethod {
  billingCardholderName: string;
  billingCityAddress: string;
  billingCountryAddress: string;
  billingPostalCode: string;
  billingStateAddress: string;
  billingStreetAddress: string;
  isPrimary: boolean;
  lastFourAccountDigits: string;
  lastFourCardDigits: string;
  lastFourRoutingDigits: string;
  paymentMethodExpiry: string;
  paymentMethodIssuer: string | null;
  paymentMethodName: string;
  paymentMethodOrigin: string;
  paymentMethodProvider: string | null;
  paymentMethodType: string | null;
  referenceId: string;
}

export type PaymentMethodsResponse = PaymentMethod[];

export interface AddCardRequest {
  creditCardNumber: string;
  expiryDate: string;
  cardSecurityCode: string;
  isPrimary: boolean;
  bin: string;
  cardProvider: string;
  cardholderName: string;
  cardOrigin: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingCountryCode: string;
  billingPostalCode: string;
}

export interface AddCardResponse {
  message: string;
  redirect: string;
  referenceId?: string;
}

export interface UpdateCardPaymentRequest {
  paymentIsPrimary: boolean;
  paymentIsEnabled: boolean;
}

export interface UpdateCardPaymentResponse {
  message: string;
}

export interface DeleteCardPaymentResponse {
  message: string;
}

export interface LinkDirectDebitRequest {
  channelCode: string;
  isPrimary: boolean;
}

export interface LinkDirectDebitResponse {
  message: string;
  redirectUrl: string;
  referenceId: string;
}

export interface ChargeDirectDebitRequest {
  referenceId: string;
  billingReferenceId: string;
  baseCurrency: string;
  baseAmount: number;
  notes?: string | null;
}

export interface ChargeDirectDebitIntent {
  payload: ChargeDirectDebitRequest;
  idempotencyKey: string;
}

export interface ChargeDirectDebitResponse {
  message?: string;
  code?: string;
  isOTPRequired?: boolean;
  otpMobileNumber?: string;
  paymentId?: number;
  xenditPaymentId?: string;
  transactionReferenceId?: string;
  invoiceReferenceId?: string;
}

export interface ValidateDirectDebitOtpRequest {
  paymentId: number;
  xenditPaymentId: string;
  otpCode: string;
}

export interface ValidateDirectDebitOtpResponse {
  message: string;
  transactionReferenceId?: string;
}

export interface ResendDirectDebitOtpRequest {
  paymentId: number;
  xenditPaymentId: string;
}
