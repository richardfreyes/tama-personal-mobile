import type { Biller } from '@/redux/features/biller/billerTypes';
import type { Bill } from '@/redux/features/bills/billsTypes';
import type { Enrollment } from './enrollment';

export type UpcomingBillStatus = 'Upcoming' | 'Due Soon' | 'Overdue';

export type SavedBillStatusSource = Pick<
  Bill,
  'custom_fields' | 'billing_status' | 'date_paid' | 'due_date' | 'is_active' | 'paid_at' | 'payment_status' | 'status'
>;

export type CustomFields = SavedBillStatusSource['custom_fields'];

export type SavedBillSummarySource = Pick<Bill, 'custom_fields' | 'billing_name' | 'merchant_name' | 'client_notes'>;

export type BillerStatusTone = 'overdue' | 'due' | 'paid' | 'none';

export interface BillerStatus {
  tone: BillerStatusTone;
  label: string;

  dueDate?: Date;
}

export interface BillerDueSummary {
  billCount: number;
  overdueCount: number;

  total: number;
  knownAmountCount: number;
  hasUnknownAmounts: boolean;

  next: { nickname: string; dueDateLabel: string } | null;
}

export interface BillerSummaryRow {
  id: string;
  label: string;
  value: string;
}

export interface BillerSummaryRows {
  primary: BillerSummaryRow[];
  secondary: BillerSummaryRow[];
}

export interface BillerDirectoryGroup<T = Biller> {
  letter: string;
  billers: T[];
}

export interface UpcomingEnrollmentBill {
  amount: string;
  daysRemaining: number;
  daysRemainingLabel: string;
  dueDate: Date;
  dueDateLabel: string;
  enrollment: Enrollment;
  isNearestUpcoming: boolean;
  key: string;
  merchantName: string | null;
  status: UpcomingBillStatus;
  title: string;
}

export interface ResolveBillerEnrollmentMetadataArgs {
  merchantCode: string;
  merchantId: number;
  paymentType?: any;
  projectId?: any;
}
