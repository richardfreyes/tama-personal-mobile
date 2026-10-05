import type { ENROLLMENT_DETAIL_SECTION_ORDER } from '@/constants/enrollment';
import type { Merchant, MerchantFormField, MerchantTransactionFieldPayload, MerchantTransactionPayload, MerchantTransactionProjectPayload } from '@/redux/features/merchants/merchantTypes';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { EnrollmentCardPayload } from './payment';

export type EnrollmentMerchantLike = Partial<Merchant> & Record<string, any>;

export type TransactionField = {
  name?: string;
  value?: string | number | null;
};

export type MoneyTuple = readonly [string, number];

export type ConfirmPaymentDisplayTransaction = {
  merchantName?: string;
  projectName?: string | null;
  transactionFields?: TransactionField[];
  customerName?: string | null;
  customerEmail?: string | null;
  customerMobileNo?: string | null;
  billBase?: MoneyTuple;
  billConverted?: MoneyTuple;
  billFee?: MoneyTuple;
  billTotal?: MoneyTuple;
  qwxRate?: readonly [string, string, number | string];
};

export type ReceiptAccessPayload = {
  referenceId: string;
  receiptAccessSignature: string;
  receiptAccessType: string;
};

export type PaymentSuccessPayload = ReceiptAccessPayload & {
  message: string;
};

export type PaymentPreconditions = {
  merchantId?: string;
  transactionId?: string;
  isPaymentMethodReady: boolean;
  hasAcceptedTerms: boolean;
};

export type ErrorData = {
  code?: string | number;
  errorCode?: string | number;
  message?: string;
  error?: string;
};

export type UseInitializeEnrollmentPaymentMethodParams = {
  merchantId: string;
  transactionId: string;
  xsrfKey?: string;
  cardPayload?: EnrollmentCardPayload | null;
  isEnrollment?: boolean;
  onError: (message: string) => void;
};

export type SubmitPaymentParams = {
  hasAcceptedTerms: boolean;
  isPaymentMethodReady: boolean;
};

export type SnackbarVariant = 'success' | 'error' | 'info' | 'warning';

export type UseCompleteEnrollmentPaymentParams = {
  merchantId: string;
  transactionId: string;
  xsrfKey?: string;
  getLatestMerchantTransaction: () => Promise<any>;
  onError: (message: string) => void;
  onNotice: (message: string, variant?: SnackbarVariant) => void;
  onSuccess: (payload: PaymentSuccessPayload) => void;
};

export type UseCompleteEnrollmentParams = {
  merchantId: string;
  transactionId: string;
  xsrfKey?: string;
  getLatestMerchantTransaction: () => Promise<any>;
  onError: (message: string) => void;
  onNotice: (message: string, variant?: SnackbarVariant) => void;
  onSuccess: (payload: PaymentSuccessPayload) => void;
};

export type ProjectCandidate = Partial<MerchantTransactionProjectPayload> | null | undefined;

export type BuildDynamicPayloadFieldsParams = {
  formData: Record<string, any>;
  inputFields: MerchantFormField[];
  payloadFieldExcludedKeys: Set<string>;
};

export type BuildMerchantTransactionPayloadParams = {
  merchantId: string;
  paymentType: string;
  project: ProjectCandidate;
  clientNotes?: string;
  customer: {
    name?: string;
    email?: string;
    mobile?: string;
    countryPrefix?: string;
    countryIso2?: string;
  };
  bill: {
    amount?: string;
    currency?: string;
  };
  transactionType: MerchantTransactionPayload['transactionType'];
  fields: MerchantTransactionFieldPayload[];
  source?: string;
};

export type EnrollmentProjectCandidate = {
  merchantProjectId?: number | string;
  name?: string;
  projectId?: string;
  category?: string;
} | null | undefined;

export type BuildMerchantEnrollmentPayloadParams = {
  customer: {
    name?: string;
    email?: string;
    mobile?: string;
    countryPrefix?: string;
    countryIso2?: string;
  };
  bill: {
    amount?: string;
    currency?: string;
  };
  project: EnrollmentProjectCandidate;
  clientNotes?: string;
  fields: MerchantTransactionFieldPayload[];
  source?: string;
};

export type PendingEnrollmentVerification = {
  url: string;
  accessSignature: string;
  accessType: string;
};

export type PendingPaymentRedirect = {
  url: string;
};

export type PendingReceiptContext = {
  referenceId: string;
  successMessage: string;
  accessSignature: string;
  accessType: string;
};

export type EnrollmentCallbackOutcome = 'success' | 'cancelled' | 'failure';

export type EnrollmentCallbackResult = {
  outcome: EnrollmentCallbackOutcome;
  message: string;
};

export type EnrollmentVerificationWebViewProps = {
  url: string;
  accessSignature: string;
  accessType: string;
  onComplete: (result: EnrollmentCallbackResult) => void;
};

export type OtpWebViewProps = {
  url: string;
  title?: string;
  visible: boolean;
  isProcessing?: boolean;
  processingLabel?: string;

  waitHint?: string;

  waitOnDismiss?: boolean;
  onComplete: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onFailure?: () => void;
  injectedJavaScript?: string;
  successUrlPatterns?: (string | RegExp)[];
  failureUrlPatterns?: (string | RegExp)[];
  successMode?: 'navigation' | 'message';
};

export type EnrollmentLineItem = {
  charged?: readonly [string, number];
  description?: string;
  fee?: readonly [string, number];
};

export type EnrollmentDetailSectionTitle = (typeof ENROLLMENT_DETAIL_SECTION_ORDER)[number];

export interface EnrollmentDetailField {
  key: string;
  label: string;
  value: string;
}

export interface EnrollmentDetailSection {
  title: EnrollmentDetailSectionTitle;
  fields: EnrollmentDetailField[];
}

export interface EnrollmentPaymentMethodSummary {
  provider: string;
  lastFour: string;
  display: string;
}

export interface EnrollmentDisplayField {
  key: string;
  label: string;
  value: string;
}

export interface EnrollmentPaymentMethodDetails {
  cardType?: string;
  maskedCard?: string;
  cardholder?: string;
  expiry?: string;
  paymentMethodType?: string;
}

export interface EnrollmentDetailsViewModel {
  merchantName: string;

  merchantContactName: string;
  paymentType: string;
  referenceId: string | null;
  statusLabel: string;
  monthlyAmount: string;
  paymentFrequency: string | null;
  paymentDuration: string | null;
  startDate: string | null;
  lastPayment: string;
  lastPaymentRecord: string;
  estimatedTotal: string | null;
  completedPayments: number | null;
  totalPayments: number | null;
  progress: number | null;
  nextPaymentDate: string | null;
  summaryMetrics: EnrollmentDisplayField[];
  paymentMethod: EnrollmentPaymentMethodDetails | null;
  paymentMethodFields: EnrollmentDisplayField[];
  enrollmentFields: EnrollmentDisplayField[];
  customerFields: EnrollmentDisplayField[];
  clientNotes: string | null;
}

export interface Enrollment {
  [key: string]: any;
  referenceId?: string | null;
  reference_id?: string | null;
  enrollmentReferenceId?: string | null;
  transactionId?: string | null;
  externalTransactionId?: string | null;
  enrollmentTitle?: string | null;
  propertyName?: string | null;
  projectName?: string | null;
  unitNumber?: string | null;
  merchantName?: string | null;
  merchantCode?: string | null;
  merchant_code?: string | null;
  merchantId?: string | null;
  logoUrl?: string | null;
  merchantLogoUrl?: string | null;
  merchant_logo_url?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerMobileNo?: string | null;
  status?: string | null;
  baseAmount?: number | null;
  baseCurrency?: string | null;
  monthlyAmount?: number | string | null;
  enrollmentMonthlyAmount?: number | string | null;
  enrollmentStartDate?: string | null;
  enrollmentEndDate?: string | null;
  enrollmentDate?: string | null;
  enrollmentLastPaymentDate?: string | null;
  enrollmentNextPaymentDate?: string | null;
  nextDebitDate?: string | null;
  nextPaymentDate?: string | null;
  paymentMethodBrand?: string | null;
  tokenizedCardNumber?: string | null;
  lastFourCardDigits?: string | null;
  paymentMethodLastFour?: string | null;
  paymentTypeName?: string | null;
  enrollmentMonths?: number | null;
  enrollmentPeriod?: string | null;
}

export interface EnrollmentListRef {
  loadMore: () => void;
  refresh: () => Promise<void>;
}

export interface EnrollmentListComponentProps {
  variant?: 'carousel' | 'list';
  screenHeader?: ReactNode;
  screenFooter?: ReactNode;
}

export interface EnrollmentItemProps {
  item: Enrollment;
}

export interface EnrollmentSummaryCardProps {
  item: Enrollment;
  index: number;
  logoUrl?: string | null;
  onPress: (item: Enrollment) => void;
  wrapperStyle?: StyleProp<ViewStyle>;
}

export interface EnrollmentStatusBadgeProps {
  status?: string | null;
  variant?: 'default' | 'summaryCard';
}
