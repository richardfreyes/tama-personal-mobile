export type InvoiceStatus = 'Paid' | 'Sched' | 'Pending' | 'Draft';

export interface SelectedInvoice {
  refId: string | null;
  amount: number | null;
  dueDate: string | null;
  status: string | null;
}
