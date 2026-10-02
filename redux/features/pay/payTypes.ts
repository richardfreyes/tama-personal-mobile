export interface PaymentRequest {
  paymentMethodId: string;
  amount: number;
}

export interface PaymentResponse {
  message: string;
}

export interface PaymentError {
  status: number;
  data: {
    message: string;
    details?: any;
  };
}

export interface PayMutationArgs {
  transactionReferenceId: string;
  payload: PaymentRequest;
}