export type QueryValue = string | number | string[] | undefined;

export interface GetBillersParams {
  search?: QueryValue;
  category?: QueryValue;
}
export interface Biller {
  address_one: string;
  address_three: string;
  address_two: string;
  created_at: string;
  is_active: boolean;
  is_public: boolean;
  merchant_code: string;
  merchant_id: number;
  merchant_logo_url: string;
  merchant_name: string;
  merchant_status: string;
  merchant_timezone: string;
  updated_at: string;
}

export interface BillersResponse {
  billers: Biller[];
  total: number;
}