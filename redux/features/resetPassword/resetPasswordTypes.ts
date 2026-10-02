export interface ResetPasswordRequest {
  emailAddress: string;
  platform?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResetPasswordWithTokenRequest {
  token: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordWithTokenResponse {
  message: string;
}
