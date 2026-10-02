
export interface BillDetail {
  billing_id: number;
  billing_reference_id: string;
  billing_name: string;
  merchant_name: string;
  merchant_id: number;
  custom_fields: Record<string, { text: string; value: string }>;
  client_notes: string;
}
export interface BillDetailResponse {
  bill: BillDetail;
}