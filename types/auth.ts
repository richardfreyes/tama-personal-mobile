export interface EditProfileInputs {
  country?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  currentEmail: string;
  mobileNumber?: string;
}

export interface JwtPayload {
  firstName: string;
  lastName: string;
  username: string;
  uid: number;
}

export type JwtPayloadToken = {
  exp?: number;
};
