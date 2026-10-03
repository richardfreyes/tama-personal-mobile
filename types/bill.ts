import type { Enrollment } from './enrollment';

export type UpcomingBillStatus = 'Upcoming' | 'Due Soon' | 'Overdue';

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