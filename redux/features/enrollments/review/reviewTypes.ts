export interface EnrollmentCardPayload {
  creditCardNumber: string;
  expiryDate: string;
  cardSecurityCode: string;
  cardholderName: string;
  cardOrigin: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingCountryCode: string;
  billingPostalCode: string;
}

export interface EnrollmentTransactionResponse {
  merchantId: string;
  merchantName?: string;
  message: string;
  status: string;
  transactionId: string;
  xsrfKey: string;
  isEnrollment?: boolean;
}

export interface EnrollmentReviewState {
  cardPayload: EnrollmentCardPayload | null;
  transactionResponse: EnrollmentTransactionResponse | null;
  formResetKey: number;
}

export const initialState: EnrollmentReviewState = {
  cardPayload: null,
  transactionResponse: null,
  formResetKey: 0,
};
