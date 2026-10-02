import { AppText } from '@/components/common/AppText';
import { enrollmentStatusBadgeStyles as styles } from '@/styles/components/enrollments/EnrollmentStatusBadge';
import type { EnrollmentStatusBadgeProps, EnrollmentStatusStyles } from '@/types/enrollment';
import { getEnrollmentStatusLabel } from '@/utils/enrollmentPresentation';
import React from 'react';
import { View } from 'react-native';

const getStatusStyles = (status?: string | null): EnrollmentStatusStyles => {
  const normalized = status?.trim().toLowerCase() || '';
  const statusWords = normalized.split(/[\s_-]+/);

  if (statusWords.some((word) => ['failed', 'error', 'declined', 'cancelled', 'canceled', 'expired'].includes(word))) {
    return { badge: styles.failedBadge, dot: styles.failedDot };
  }

  if (statusWords.some((word) => ['pending', 'processing', 'scheduled'].includes(word))) {
    return { badge: styles.pendingBadge, dot: styles.pendingDot };
  }

  if (statusWords.some((word) => ['active', 'approved', 'completed', 'success', 'successful', 'ongoing', 'progress'].includes(word))) {
    return { badge: styles.activeBadge, dot: styles.activeDot };
  }

  if (statusWords.includes('paused') || normalized === 'on hold') {
    return { badge: styles.pausedBadge, dot: styles.pausedDot };
  }

  return { badge: styles.neutralBadge, dot: styles.neutralDot };
};

const EnrollmentStatusBadge = ({ status, variant = 'default' }: EnrollmentStatusBadgeProps) => {
  const statusStyles = getStatusStyles(status);
  const isSummaryCard = variant === 'summaryCard';

  return (
    <View style={[styles.badge, isSummaryCard && styles.summaryCardBadge, statusStyles.badge]}>
      <View style={[styles.dot, statusStyles.dot]} />
      <AppText size={isSummaryCard ? 'extraSmall' : 'tiny'} weight="600" style={[styles.text, statusStyles.text]}>
        {getEnrollmentStatusLabel(status)}
      </AppText>
    </View>
  );
};

export default EnrollmentStatusBadge;
