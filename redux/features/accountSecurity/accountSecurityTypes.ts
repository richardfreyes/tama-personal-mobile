export interface UpdateEmailRequest {
  emailAddress: string;
}

export interface UpdateEmailResponse {
  message: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  message: string;
  token: string;
}

export interface ChangeEmailConfirmRequest {
  Otoken: string;
  Ntoken: string;
  code: string;
}

export interface ChangeEmailConfirmResponse {
  message: string;
}