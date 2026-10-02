import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import EnrollmentDetailsContent from '@/components/enrollments/EnrollmentDetailsContent';
import EnrollmentDetailsSkeleton from '@/components/enrollments/EnrollmentDetailsSkeleton';
import { useGetEnrollmentsQuery } from '@/redux/features/enrollments/enrollmentApi';
import { enrollmentDetailsStyles as styles } from '@/styles/app/bills/enrollments/details';
import { Colors } from '@/styles/common/colors';
import type { EnrollmentDetailsLookupProps } from '@/types/common';
import { matchesEnrollmentId } from '@/utils/enrollment';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

export default function EnrollmentDetailsLookup({ enrollmentId }: EnrollmentDetailsLookupProps) {
  const { data, isError, isFetching, isLoading, refetch } = useGetEnrollmentsQuery({
    count: 10,
    page: 0,
    searchQuery: enrollmentId,
  });
  const enrollment = data?.items.find((item) => matchesEnrollmentId(item, enrollmentId));

  if ((isLoading || isFetching) && !data) {
    return <EnrollmentDetailsSkeleton />;
  }

  if (enrollment) {
    return <EnrollmentDetailsContent enrollment={enrollment} />;
  }

  if (isError) {
    return (
      <View style={styles.stateCard}>
        <Feather color={Colors.error06} name="alert-circle" size={30} />
        <AppText accessibilityRole="header" weight="700" style={styles.stateTitle}>
          We couldn&apos;t load this enrollment
        </AppText>
        <AppText size="small" style={styles.stateDescription}>
          Check your connection and try again.
        </AppText>
        <AppButton
          accessibilityLabel="Retry loading enrollment details"
          buttonStyle={styles.retryButton}
          onPress={() => { void refetch(); }}
          title="Try again"
          variant="tertiary"
        />
      </View>
    );
  }

  return (
    <EmptyStateCard
      containerStyle={styles.emptyState}
      message="This enrollment could not be found. Return to the list and choose another enrollment."
      variant="empty"
    />
  );
}
