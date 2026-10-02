interface BillBodyField {
  value: string | number | null;
  text: string;
}

interface BillBody {
  [key: string]: BillBodyField;
}

export interface AddBillRequest {
  billName: string;
  merchantCode: string;
  projectId: number;
  paymentTypeCode: string;
  billBody: BillBody;
  clientNotes: string;
}

export interface AddBillResponse {
  status: string;
}

interface CustomField {
  text: string;
  value: string;
}

export interface Bill {
  billing_id: number;
  billing_name: string;
  billing_reference_id: string;
  billing_type: string;
  client_notes: string;
  custom_fields: Record<string, CustomField>;
  customer_id: number;
  merchant_category_name: string;
  merchant_id: number;
  merchant_name: string;
  payment_type_id: number;
  project_id: number;
  billing_status?: string | null;
  date_paid?: string | null;
  due_date?: string | null;
  is_active?: boolean;
  paid_at?: string | null;
  payment_status?: string | null;
  status?: string | null;
}

export interface BillsResponse {
  bills: Bill[];
}

export interface GetBillsParams {
  page: number;
}

export interface DeleteBillResponse {
  status: string;
}
