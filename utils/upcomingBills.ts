import { MILLISECONDS_PER_DAY, UPCOMING_BILL_DUE_SOON_DAYS } from '@/constants/monthlyBills';
import type { UpcomingBillStatus, UpcomingEnrollmentBill } from '@/types/bill';
import type { Enrollment } from '@/types/enrollment';
import { formatApiDate, parseDateValue } from '@/utils/date';
import { getEnrollmentKey } from '@/utils/enrollment';
import { getEnrollmentBillTitle, getEnrollmentMerchantName, getEnrollmentMonthlyAmount, getEnrollmentNextDebitDateValue } from '@/utils/enrollmentPresentation';

const isRecord = (value: any): value is Record<string, any> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const getUpcomingBillRecords = (enrollment: Enrollment): Record<string, any>[] => {
  const schedule = isRecord(enrollment.schedule) ? enrollment.schedule : null;
  const candidates = [
    enrollment.upcomingBills,
    enrollment.upcoming_bills,
    schedule?.upcomingBills,
    schedule?.upcoming_bills,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(isRecord);
    }
  }

  const singleUpcomingBill = isRecord(enrollment.upcomingBill)
    ? enrollment.upcomingBill
    : isRecord(enrollment.upcoming_bill)
      ? enrollment.upcoming_bill
      : null;

  return singleUpcomingBill ? [singleUpcomingBill] : [];
};

const getBillRecordKey = (bill: Record<string, any>, fallbackIndex: number): string => {
  const value = bill.id || bill.referenceId || bill.billingReferenceId || bill.dueDate || bill.nextDebitDate;
  return typeof value === 'string' || typeof value === 'number' ? String(value) : `bill-${fallbackIndex}`;
};

const startOfLocalDay = (date: Date): Date => new Date(
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
);

const getDaysRemaining = (dueDate: Date, now: Date): number => (
  Math.round((startOfLocalDay(dueDate).getTime() - startOfLocalDay(now).getTime()) / MILLISECONDS_PER_DAY)
);

const getStatus = (daysRemaining: number): UpcomingBillStatus => {
  if (daysRemaining < 0) return 'Overdue';
  if (daysRemaining <= UPCOMING_BILL_DUE_SOON_DAYS) return 'Due Soon';
  return 'Upcoming';
};

const getDaysRemainingLabel = (daysRemaining: number): string => {
  if (daysRemaining === 0) return 'Due today';
  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`;
  }

  return `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`;
};

export const getUpcomingBillsForMonth = (
  enrollments: Enrollment[],
  now = new Date(),
): UpcomingEnrollmentBill[] => {
  const bills: UpcomingEnrollmentBill[] = [];

  enrollments.forEach((enrollment, enrollmentIndex) => {
    const upcomingRecords = getUpcomingBillRecords(enrollment);
    const sources = upcomingRecords.length > 0 ? upcomingRecords : [null];

    sources.forEach((upcomingRecord, billIndex) => {
      const displayEnrollment = upcomingRecord
        ? ({ ...enrollment, ...upcomingRecord, upcomingBill: upcomingRecord } as Enrollment)
        : enrollment;
      const rawDueDate = getEnrollmentNextDebitDateValue(displayEnrollment);
      if (!rawDueDate) return;

      const dueDate = parseDateValue(rawDueDate);
      if (!dueDate) return;

      const daysRemaining = getDaysRemaining(dueDate, now);
      if (daysRemaining < 0) return;

      const enrollmentKey = getEnrollmentKey(enrollment, enrollmentIndex);
      const billKey = upcomingRecord ? getBillRecordKey(upcomingRecord, billIndex) : rawDueDate;

      bills.push({
        amount: getEnrollmentMonthlyAmount(displayEnrollment),
        daysRemaining,
        daysRemainingLabel: getDaysRemainingLabel(daysRemaining),
        dueDate,
        dueDateLabel: formatApiDate(rawDueDate, 'MMM dd, yyyy'),
        enrollment,
        isNearestUpcoming: false,
        key: `${enrollmentKey}-${billKey}`,
        merchantName: getEnrollmentMerchantName(displayEnrollment),
        status: getStatus(daysRemaining),
        title: getEnrollmentBillTitle(displayEnrollment),
      });
    });
  });

  const sortedBills = bills.sort((first, second) => first.dueDate.getTime() - second.dueDate.getTime());
  const nearestUpcomingBill = sortedBills[0];
  if (!nearestUpcomingBill) return [];

  const isCurrentMonth = (
    nearestUpcomingBill.dueDate.getFullYear() === now.getFullYear()
    && nearestUpcomingBill.dueDate.getMonth() === now.getMonth()
  );

  return sortedBills
    .filter((bill) => (
      bill.dueDate.getFullYear() === nearestUpcomingBill.dueDate.getFullYear()
      && bill.dueDate.getMonth() === nearestUpcomingBill.dueDate.getMonth()
    ))
    .map((bill) => ({
      ...bill,
      isNearestUpcoming: !isCurrentMonth,
    }));
};
