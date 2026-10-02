export interface Transaction {
  type?: string;
  externalTransactionId: string;
  billingName: string;
  invoiceReferenceId: string;
  merchantName: string;
  merchantLogoUrl?: string | null;
  customerName?: string | null;
  baseAmount: number;
  baseCurrency: string;
  status: string;
  createdAt: string;
}

export interface EnrollmentTransactionHistory {
  enrollmentTransactionId: number;
  externalTransactionId: string;
  enrollmentReferenceId: string | null;
  enrollmentStatus: string;

  merchantId: number;
  merchantCode: string;
  merchantName: string;
  merchantLogoUrl?: string | null;

  invoiceId: number;
  invoiceReferenceId: string | null;
  paymentReferenceId: string | null;
  paymentStatus: string;
  paymentStatusName: string;
  description: string | null;
  enrollmentName?: string | null;
  billingName?: string | null;
  customerName?: string | null;

  baseCurrency: string;
  baseAmount: number;
  convertedCurrency: string | null;
  convertedAmount: number | null;
  feeCurrency: string;
  feeAmount: number;
  totalCurrency: string;
  totalAmount: number;

  processorCode: string | null;
  dueAt: string | null;
  submittedAt: string | null;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionSource = 'oneTimePayment' | 'enrollment';

export interface UnifiedTransaction {
  key: string;
  source: TransactionSource;
  typeLabel: 'One Time Payment' | 'Enrollment';
  transactionId: string;
  externalTransactionId: string;
  detailReferenceId: string;
  invoiceReferenceId: string | null;
  enrollmentReferenceId: string | null;
  paymentReferenceId: string | null;
  billingName: string | null;
  customerName: string | null;
  merchantName: string;
  merchantLogoUrl: string | null;
  amount: number;
  currency: string;
  status: string;
  statusLabel: string;
  createdAt: string;
}

export interface TransactionItemProps {
  item: UnifiedTransaction;
}

export interface EnrollmentTransactionDetailsProps {
  transaction: EnrollmentTransactionHistory;
}

export type TransactionHistoryRef = {
  loadMore: () => void;
  refresh: () => Promise<void>;
};
