export interface CustomerData {
  customerAddress: string;
  customerAddressCity: string;
  customerAddressPostalCode: string;
  customerAddressState: string;
  customerCountryIso2Code: string;
  customerName: string;
}

export interface ProfileResponse {
  customer: CustomerData;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  middleName?: string | null;
  country?: string;
}

export interface UpdateAddressRequest {
  firstName: string;
  lastName: string;
  streetAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
}

export interface CustomerAddressData {
  customerAddress: string;
  customerAddressCity: string;
  customerAddressPostalCode: string;
  customerAddressState: string;
  customerCountryIso2Code: string;
}

export interface UpdateAddressResponse {
  customer: CustomerAddressData;
  message: string;
}