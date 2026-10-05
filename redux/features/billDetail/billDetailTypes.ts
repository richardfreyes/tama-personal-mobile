import type { Bill } from '../bills/billsTypes';

export interface BillDetail extends Pick<
  Bill,
  'billing_status' | 'date_paid' | 'due_date' | 'is_active' | 'paid_at' | 'payment_status' | 'status'
> {
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
