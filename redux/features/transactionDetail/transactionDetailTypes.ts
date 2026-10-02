export interface BillingDetailItem {
  text: string;
  value: string;
}

export interface TransactionItem {
  chargedAmount: number;
  chargedCurrency: string;
  createdAt: string;
  description: string;
  feeAmount: number;
  feeCurrency: string;
  itemType: string;
  status: string;
  updatedAt: string;
}

export interface TransactionDetail {
  confirmationNumber?: string | null;
  createdAt?: string;
  customerReference?: string | null;
  invoiceReferenceId?: string;
  baseAmount: number;
  baseCurrency: string;
  billingName: string;
  billingDetails: Record<string, BillingDetailItem>;
  externalTransactionId: string;
  items: TransactionItem[];
  merchantName: string;
  name: string | null;
  notes: string | null;
  paymentMethodNumber: string | null;
  paymentMethodProvider: string;
  paymentMethodType: string;
  paymentReferenceId: string | null;
  referenceNumber?: string | null;
  status: string;
  totalAmount: number;
  totalCurrency: string;
  transactionReferenceId?: string;
  transactionDate: string;
  updatedAt?: string;
  xrAmount: number;
  xrBaseCurrency: string;
  xrTargetCurrency: string;
}
