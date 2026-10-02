import { SkeletonBlock } from '@/components/common/Loading';
import { enrollmentDetailsStyles as styles } from '@/styles/app/bills/enrollments/details';
import React from 'react';
import { View } from 'react-native';

export default function EnrollmentDetailsSkeleton() {
  return (
    <View
      accessibilityLabel="Loading enrollment details"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.skeletonLayout}
      testID="enrollment-details-skeleton"
    >
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonHeaderRow}>
          <View style={styles.skeletonIdentity}>
            <SkeletonBlock width="62%" height={22} />
            <SkeletonBlock width="42%" height={13} />
          </View>
          <SkeletonBlock width={72} height={28} borderRadius={14} />
        </View>
        <SkeletonBlock width="88%" height={13} />
        <SkeletonBlock height={56} borderRadius={12} />
      </View>
      <View style={[styles.skeletonCard, styles.skeletonSummary]}>
        <SkeletonBlock width="30%" height={13} />
        <SkeletonBlock width="58%" height={38} />
        <View style={styles.skeletonMetrics}>
          {[0, 1, 2, 3].map((item) => <SkeletonBlock key={item} width="47%" height={54} borderRadius={10} />)}
        </View>
      </View>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <SkeletonBlock width="42%" height={17} />
          <SkeletonBlock height={13} />
          <SkeletonBlock width="82%" height={13} />
          <SkeletonBlock width="90%" height={13} />
        </View>
      ))}
    </View>
  );
}
