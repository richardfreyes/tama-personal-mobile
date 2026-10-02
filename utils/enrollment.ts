import type { Enrollment } from '@/types/enrollment';

export const getEnrollmentKey = (enrollment: Enrollment, index?: number): string => (
  enrollment.referenceId ||
  enrollment.transactionId ||
  enrollment.externalTransactionId ||
  `enrollment-${index ?? 0}`
);

export const matchesEnrollmentId = (enrollment: Enrollment, enrollmentId: string): boolean => {
  const identifiers = [
    enrollment.referenceId,
    enrollment.reference_id,
    enrollment.enrollmentReferenceId,
    enrollment.transactionId,
    enrollment.externalTransactionId,
  ];

  return identifiers.some((identifier) => identifier != null && String(identifier) === enrollmentId);
};
