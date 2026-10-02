export interface Merchant {
  boxedLogo: string;
  category: string;
  id: string;
  isAutoDebitEnabled?: boolean;
  autoDebitEnabled?: boolean;
  is_auto_debit_enabled?: boolean;
  auto_debit_enabled?: boolean;
  logoUrl?: string;
  name: string;
  payments?: MerchantPayment[];
  paymentMethods?: MerchantPayment[];
  paymentOptions?: MerchantPayment[];
  pid: number;
  standardLogo: string;
}

export type MerchantsResponse = Merchant[];


export interface PaymentChannel {
  code: string;
  name: string;
  isEnabled?: boolean;
}

export interface PaymentMetadata {
  channels?: PaymentChannel[];
  businessInfoName?: string;
  isSubAccountEnabled?: boolean;
  payerId?: string | null;
  paypalEmail?: string | null;
  [key: string]: any;
}


export interface MerchantPayment {
  fields: [];
  channels: PaymentChannel[];
  currency: string;
  isAutoDebitEnabled: boolean;
  isEnabled: boolean;
  mode: 'formula' | 'tiered' | string;
}

export type MerchantPaymentsResponse = MerchantPayment[];

export interface LandingButtonConfig {
  isEnabled: boolean;
  text: string;
}

export interface MerchantLandingConfig {
  bannerButton: LandingButtonConfig;
  enrollButton: LandingButtonConfig;
  isPublic: boolean;
  merchantId: string;
  merchantType: string;
  payButton: LandingButtonConfig;
  paymentMethods: any[];
  pid: number;
  subtitle: string;
  title: string;
}

export interface MerchantPaymentType {
  typeCode: string;
  typeId: number;
  typeName: string;
}

export type MerchantPaymentTypesResponse = MerchantPaymentType[];

export interface CurrencyConfig {
  currency: string;
  maxAmount: number;
  minAmount: number;
}

export type FieldVisibilityOperator = 'equals' | 'not_equals' | 'in' | string;

export interface FieldVisibilityCondition {
  lhs: string;
  operator: FieldVisibilityOperator;
  rhs: string | number | boolean | null | Array<string | number | boolean | null>;
}

export interface FieldVisibilityGroup {
  AND?: FieldVisibility[];
  OR?: FieldVisibility[];
  and?: FieldVisibility[];
  or?: FieldVisibility[];
  operator?: string;
  conditions?: FieldVisibility[];
}

export type FieldVisibility = FieldVisibilityCondition | FieldVisibilityGroup;

export interface MerchantFormField {
  fieldType: 'lookup' | 'text' | 'currency' | 'email' | 'tel' | 'longtext' | string;
  fields: MerchantFormField[] | null;
  displayOrder?: number;
  hint?: string;
  isAutoComplete: boolean;
  isRequired: boolean;
  key: string;
  label: string;
  lookupReference?: {
    location: string;
    source: 'link' | 'self' | string;
  } | null;
  maxLength: number;
  minLength: number;
  pattern: string | null;
  placeholder: string;
  visibility?: FieldVisibility[] | FieldVisibility | null;
}

export interface MerchantFormConfigResponse {
  currencies: CurrencyConfig[];
  fields: MerchantFormField[];
  hasScripts: any | null;
}

export interface MerchantTransactionProjectPayload {
  name: string;
  projectId: string;
  category: string;
}

export interface MerchantTransactionCustomerPayload {
  name: string;
  email: string;
  mobile: string;
  countryPrefix: string;
  countryIso2: string;
}

export interface MerchantTransactionMoneyPayload {
  amount: string;
  currency: string;
}

export interface MerchantTransactionBillPayload {
  base: MerchantTransactionMoneyPayload;
}

export interface MerchantTransactionFieldPayload {
  name: string;
  text: string;
  value: string | null;
  countryPrefix?: string;
  countryIso2?: string;
}

export interface MerchantTransactionPayload {
  merchantId: string;
  paymentType: string;
  project: MerchantTransactionProjectPayload | null;
  clientNotes: string | null;
  customer: MerchantTransactionCustomerPayload;
  bill: MerchantTransactionBillPayload;
  transactionType: 'payment' | string;
  source: string;
  adminNotes: string | null;
  fields: MerchantTransactionFieldPayload[];
}

export interface CreateMerchantTransactionRequest {
  merchantCode: string;
  body: MerchantTransactionPayload;
}

export interface MerchantEnrollmentProjectPayload {
  merchantProjectId: number | string;
  name: string;
  projectId: string;
  category: string;
}

export interface MerchantEnrollmentPayload {
  bill: MerchantTransactionMoneyPayload;
  customer: {
    name: string;
    email: string;
    mobile: string | null;
    countryPrefix: string | null;
    countryIso2: string | null;
  };
  project: MerchantEnrollmentProjectPayload | null;
  clientNotes: string | null;
  source: string;
  fields: MerchantTransactionFieldPayload[];
}

export interface CreateMerchantEnrollmentRequest {
  merchantCode: string;
  body: MerchantEnrollmentPayload;
}

export interface MerchantEnrollmentResponse {
  transactionId: string;
  xsrfKey: string;
}

export interface MerchantTransactionResponse {
  merchantId: string;
  message: string;
  status: string;
  transactionId: string;
  xsrfKey: string;
}

export interface MerchantTransactionDetailResponse {
  merchantId?: string;
  transactionId?: string;
  status?: string;
  message?: string;
  xsrfKey?: string;
  [key: string]: any;
}

export interface MerchantEnrollmentDetailResponse {
  merchantId?: string;
  merchantName?: string;
  merchantNid?: number;
  transactionId?: string;
  transactionTypeCode?: string;
  transactionTypeId?: number;
  status?: string;
  xsrfKey?: string;
  bill?: {
    amount?: number;
    currency?: string;
  };
  baseAmount?: number;
  baseCurrency?: string;
  customerName?: string;
  customerEmail?: string;
  customerMobileNo?: string;
  customerCountryCode?: string | null;
  customerCountryPrefix?: string | null;
  projectId?: number;
  projectCode?: string;
  projectName?: string;
  projectCategory?: string | null;
  projectFields?: { fields: any[] };
  enrollmentMonths?: number;
  enrollmentStartDate?: string | null;
  enrollmentLastPaymentAmount?: number;
  enrollmentLastPaymentDate?: string | null;
  fields?: MerchantTransactionFieldPayload[];
  source?: string;
  referenceId?: string | null;
  adminNotes?: string | null;
  clientNotes?: string | null;
  contractDetails?: any | null;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  accessSuccessUrl?: string | null;
  unitNumber?: string | null;
  transactionType?: string | null;
  methodId?: number | null;
  methodName?: string | null;
  methodType?: string | null;
  methodProcessor?: string | null;
  methodProcessorId?: string | null;
  methodProvider?: string | null;
  methodStatus?: string | null;
  methodDescription?: string | null;
  methodExpiry?: string | null;
  methodIssuer?: string | null;
  methodBrand?: string | null;
  methodOrigin?: string | null;
  methodCurrency?: string | null;
  methodCardNumber?: string | null;
  methodAccountNumber?: string | null;
  methodRedirectUrl?: string | null;
  methodCustomerGivenName?: string | null;
  methodCustomerFamilyName?: string | null;
  methodCustomerFullName?: string | null;
  methodCustomerEmailAddress?: string | null;
  methodCustomerCountryName?: string | null;
  methodCustomerPostalCode?: string | null;
  methodBillingAddressOne?: string | null;
  methodBillingAddressTwo?: string | null;
  methodBillingState?: string | null;
  methodBillingCountryCode?: string | null;
  methodBillingPostalCode?: string | null;
  [key: string]: any;
}

export interface MerchantTransactionPaymentCkoPayload {
  paymentMethod: 'creditcard' | string;
}

export interface MerchantTransactionPaymentCkoResponse {
  accessSignature?: string;
  accessType?: string;
  httpStatus?: number;
  message?: string;
  referenceId?: string;
  reference_id?: string;
  redirectUrl?: string;
  redirect_url?: string;
  status?: string;
  [key: string]: any;
}

export interface MerchantEnrollmentEnrollResponse {
  accessSignature?: string;
  accessType?: string;
  httpStatus?: number;
  message?: string;
  referenceId?: string;
  reference_id?: string;
  redirectUrl?: string;
  redirect_url?: string;
  verificationUrl?: string;
  verification_url?: string;
  status?: string;
  [key: string]: any;
}

export interface MerchantTransactionPaymentVaultPayload {
  paymentMethod: 'creditcard' | string;
  cardType: 'credit' | 'debit' | 'prepaid' | string;
  cardScheme: string;
  cardCountryCode: string;
  brand: string;
  issuingBank: string;
  productName?: string;
  productSegment?: string;
  securityCode: string;
  cardholderName: string;
  cardholderFirstName: string;
  cardholderLastName: string;
  cardholdersCountry: string;
  cardholdersCountryCode: string;
  zipCode: string;
  streetAddress?: string;
  addressLevel1?: string;
  addressLevel2?: string;
  creditCardNumber: string;
  expiryDate: string;
}

export interface MerchantTransactionPaymentBinResponse {
  account?: {
    country?: {
      code?: string;
    };
    funding?: string;
  };
  brand?: string;
  issuer?: {
    name?: string;
  };
  product?: {
    name?: string;
    segment?: string;
  };
  scheme?: {
    name?: string;
  };
  [key: string]: any;
}

export interface MerchantTransactionPaymentVaultResponse {
  httpStatus?: number;
  message?: string;
  status?: string;
  /** Enrollment vault only: Maya needs 3DS; open `redirect` before enrolling. */
  verificationRequired?: boolean;
  redirect?: string;
  [key: string]: any;
}

export interface MerchantReceiptLineItem {
  charged: [string, number];
  description: string;
  fee: [string, number];
}

export interface MerchantReceiptResponse {
  billBase: [string, number];
  billConverted: [string, number];
  billFee: [string, number];
  billTotal: [string, number];
  createdAt: string;
  customerEmail: string;
  customerMobileNo: string;
  customerName: string;
  lineItems: MerchantReceiptLineItem[];
  merchantId: string;
  merchantName: string;
  methodCardNumber: string | null;
  methodCustomerFamilyName: string | null;
  methodCustomerGivenName: string | null;
  methodDescription: string | null;
  methodExpiry: string | null;
  methodIssuer: string | null;
  methodProcessor: string | null;
  methodProvider: string | null;
  methodStatus: string | null;
  methodType: string | null;
  paidAt: string | null;
  paymentStatusCode: string;
  paymentStatusName: string;
  paymentTypeName: string;
  projectName: string;
  qwxRate: [string, string, number];
  referenceId: string;
  status: string;
  transactionFields: MerchantTransactionFieldPayload[];
  transactionId: string;
  [key: string]: any;
}

export interface MerchantEnrollmentReceiptResponse {
  bill?: {
    amount?: number;
    currency?: string;
  };
  billBase?: [string, number];
  billConverted?: [string, number];
  billFee?: [string, number];
  billTotal?: [string, number];
  createdAt?: string;
  customerEmail?: string;
  customerMobileNo?: string;
  customerName?: string;
  lineItems?: MerchantReceiptLineItem[];
  merchantId?: string;
  merchantName?: string;
  methodCardNumber?: string | null;
  methodCustomerFamilyName?: string | null;
  methodCustomerGivenName?: string | null;
  methodDescription?: string | null;
  methodExpiry?: string | null;
  methodIssuer?: string | null;
  methodProcessor?: string | null;
  methodProvider?: string | null;
  methodStatus?: string | null;
  methodType?: string | null;
  paidAt?: string | null;
  paymentStatusCode?: string;
  paymentStatusName?: string;
  paymentTypeName?: string;
  projectName?: string;
  qwxRate?: [string, string, number];
  referenceId?: string;
  status?: string;
  transactionFields?: MerchantTransactionFieldPayload[];
  fields?: MerchantTransactionFieldPayload[];
  transactionId?: string;
  enrollmentMonths?: number;
  enrollmentStartDate?: string | null;
  enrollmentLastPaymentAmount?: number;
  enrollmentLastPaymentDate?: string | null;
  enrollmentMonthlyInvoiceAmount?: number;
  transactionTypeCode?: string;
  invoiceUpdatedAt?: string | null;
  updatedAt?: string | null;
  [key: string]: any;
}

export interface MerchantReceiptKeysResponse {
  accessSignature?: string;
  access_signature?: string;
  accesssignature?: string;
  accessType?: string;
  access_type?: string;
  accesstype?: string;
  referenceId?: string;
  reference_id?: string;
  data?: {
    accessSignature?: string;
    access_signature?: string;
    accesssignature?: string;
    accessType?: string;
    access_type?: string;
    accesstype?: string;
    referenceId?: string;
    reference_id?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
