import StatusBadge from '@/components/common/StatusBadge';
import { Colors } from '@/styles/common/colors';
import type { EnrollmentStatusBadgeProps } from '@/types/enrollment';
import { getEnrollmentStatusLabel } from '@/utils/enrollmentPresentation';
import React from 'react';

const getStatusColors = (status?: string | null): { text: string; dot: string; background: string } => {
  const normalized = status?.trim().toLowerCase() || '';
  const statusWords = normalized.split(/[\s_-]+/);

  if (statusWords.some((word) => ['failed', 'error', 'declined', 'cancelled', 'canceled', 'expired'].includes(word))) {
    return { background: Colors.error01, dot: Colors.error10, text: Colors.neutral09 };
  }

  if (statusWords.some((word) => ['pending', 'processing', 'scheduled'].includes(word))) {
    return { background: Colors.amber02, dot: Colors.amber10, text: Colors.neutral09 };
  }

  if (statusWords.some((word) => ['active', 'approved', 'completed', 'success', 'successful', 'ongoing', 'progress'].includes(word))) {
    return { background: Colors.success01, dot: Colors.success10, text: Colors.neutral09 };
  }

  if (statusWords.includes('paused') || normalized === 'on hold') {
    return { background: Colors.info01, dot: Colors.info10, text: Colors.neutral09 };
  }

  return { background: Colors.neutral04, dot: Colors.neutral07, text: Colors.neutral09 };
};

const EnrollmentStatusBadge = ({ status, variant = 'default' }: EnrollmentStatusBadgeProps) => (
  <StatusBadge
    appearance="badge"
    colors={getStatusColors(status)}
    label={getEnrollmentStatusLabel(status)}
    variant={variant}
  />
);

export default EnrollmentStatusBadge;
