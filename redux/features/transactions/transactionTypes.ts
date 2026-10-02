import type { Transaction } from '@/types';

export interface FetchTransactionsParams {
  page: number;
  count: number;
  searchQuery?: string;
  statusFilters?: string[];
  startDate?: string;
  endDate?: string;
}

export interface TransactionsPage {
  items: Transaction[];
  totalCount: number;
  currentPage: number;
}

export interface RawTransaction {
  totalCount?: number;
}
export interface TransactionComputationPayload {
  paymentMethodReferenceId: string;
  billingReferenceId: string;
  baseAmount: number;
  baseCurrency: string;
  transactionType: 'payment';
  notes: string | null;
}

export interface ComputationDetails {
  baseAmount: number;
  baseCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  feeAmount: number;
  feeCurrency: string;
  internalExchange: {
    amount: number;
    baseCurrency: string;
    targetCurrency: string;
  };
  invoiceReferenceId: string;
  targetCurrency: string;
  totalAmount: number;
  totalCurrency: string;
}

export interface TransactionComputationResponse {
  computation: ComputationDetails;
  invoiceReferenceId?: string;
  message: string;
  transactionReferenceId: string;
}

export interface PayTransactionResponse {
  message?: string;
  redirect?: string;
}

export interface PayTransactionRequest {
  transactionId: string;
  idempotencyKey: string;
}

export interface PayWithCardPayload {
  billingReferenceId: string;
  baseAmount: number;
  baseCurrency: string;
  notes: string | null;
  savePaymentMethod: boolean;
  creditCardNumber: string;
  expiryDate: string;
  cardSecurityCode: string;
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

export interface PayWithCardResponse {
  message?: string;
  code?: string;
  redirect?: string;
  transactionReferenceId?: string;
  invoiceReferenceId?: string;
  computation?: ComputationDetails;
  clientSecret?: string;
  paymentIntentId?: string;
}

export interface PayWithQrphPayload {
  billingReferenceId: string;
  baseAmount: number;
  baseCurrency: string;
  notes: string | null;
}

export interface PayWithQrphRequest {
  payload: PayWithQrphPayload;
  idempotencyKey: string;
}

export interface PayWithQrphResponse {
  message: string;
  paymentId: string;
  redirectUrl: string;
  transactionReferenceId: string;
  invoiceReferenceId: string;
  computation: ComputationDetails;
}

export interface VerifyQrphResponse {
  message: string;
  transactionReferenceId: string;
  invoiceReferenceId: string;
}

export type PayWithPayPalPayload = PayWithQrphPayload;

export interface PayWithPayPalRequest {
  payload: PayWithPayPalPayload;
  idempotencyKey: string;
}

export interface PayWithPayPalResponse {
  message: string;
  orderId: string;
  redirectUrl: string;
  transactionReferenceId: string;
  invoiceReferenceId: string;
  computation: ComputationDetails;
}

export interface CapturePayPalResponse {
  message: string;
  transactionReferenceId: string;
  invoiceReferenceId: string;
}
