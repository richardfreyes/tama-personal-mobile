export interface LoginResponse {
  token: string;
  redirect?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}