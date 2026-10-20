import { useThemedStyles } from '@/hooks/useAppTheme';
import { AppText } from '@/components/common/AppText';
import { createEnrollmentDetailsStyles as makeStyles } from '@/styles/app/bills/enrollments/details';
import type { DetailRowsProps } from '@/types/common';
import React from 'react';
import { View } from 'react-native';

export default function DetailRows({ fields }: DetailRowsProps) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.detailRows}>
      {fields.map((field) => (
        <View
          accessibilityLabel={`${field.label}: ${field.value}`}
          key={field.key}
          style={styles.detailRow}
        >
          <AppText size="small" style={styles.detailLabel}>{field.label}</AppText>
          <AppText selectable size="small" weight="600" style={styles.detailValue}>
            {field.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}
