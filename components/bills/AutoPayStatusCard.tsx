import EnrollmentStatusBadge from '@/components/enrollments/EnrollmentStatusBadge';
import { globalStyle } from '@/styles/common/globals';
import { autoPayStatusCardStyles as styles } from '@/styles/components/bills/AutoPayStatusCard';
import { AutoPayStatusCardProps } from '@/types/common';
import React from 'react';
import { View } from 'react-native';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';
import { SectionHeaderComponent } from '../common/SectionHeaderComponent';

export default function AutoPayStatusCard({ activeCount, onManage }: AutoPayStatusCardProps) {
  const enrollmentLabel = activeCount === 1 ? 'enrollment' : 'enrollments';

  return (
    <View style={globalStyle.outerContainer}>
      <SectionHeaderComponent title="Auto Debit" />
      <View style={styles.card}>
        <View
          accessibilityRole="summary"
          accessibilityLabel={`Auto Debit active, ${activeCount} ${enrollmentLabel}`}
          style={styles.statusRow}
        >
          <EnrollmentStatusBadge status="active" variant="summaryCard" />
          <AppText size="small" weight="600" color="neutral08" style={styles.statusText}>
            {activeCount} active {enrollmentLabel}
          </AppText>
        </View>
        <AppText size="extraSmall" color="neutral07" style={styles.subtitle}>
          Your eligible bills are paid automatically on their due dates.
        </AppText>
        <AppButton
          title="View Auto Debit"
          variant="secondary"
          onPress={onManage}
          buttonStyle={styles.manageButton}
        />
      </View>
    </View>
  );
}
