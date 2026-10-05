export interface SignupRequest {
  firstName: string;
  lastName: string;
  emailAddress: string;
  rawPassword: string;
  turnstileToken: string;  
}

export interface SignupResponse {
  message: string;
  token: string;
}

export interface VerifyOtpRequest {
  token: string;
  code?: string;
}

export interface VerifyOtpResponse {
  importedTransactions: number;
  message: string;
  token: string;
}

export interface ResendOtpResponse {
  message: string;
}