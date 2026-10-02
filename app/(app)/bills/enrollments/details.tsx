import EmptyStateCard from '@/components/common/EmptyStateCard';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import EnrollmentDetailsContent from '@/components/enrollments/EnrollmentDetailsContent';
import EnrollmentDetailsLookup from '@/components/enrollments/EnrollmentDetailsLookup';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { selectSelectedEnrollment } from '@/redux/features/enrollmentSelection/enrollmentSelectionSlice';
import { useAppSelector } from '@/redux/hooks';
import { enrollmentDetailsStyles as styles } from '@/styles/app/bills/enrollments/details';
import { globalStyle } from '@/styles/common/globals';
import { matchesEnrollmentId } from '@/utils/enrollment';
import { getSearchParam } from '@/utils/format';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function EnrollmentDetailsScreen() {
  const selectedEnrollment = useAppSelector(selectSelectedEnrollment);
  const { enrollmentId: enrollmentIdParam } = useLocalSearchParams<{ enrollmentId?: string | string[] }>();
  const enrollmentId = getSearchParam(enrollmentIdParam);
  const routeEnrollment = selectedEnrollment && (!enrollmentId || matchesEnrollmentId(selectedEnrollment, enrollmentId))
    ? selectedEnrollment
    : null;

  return (
    <GlobalScrollView
      contentContainerStyle={[
        globalStyle.screenContainer,
        globalStyle.screenContainerTop,
        styles.screenContent,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.screenInner}>
        <NavHeaderComponent title="Enrollment Details" />

        {routeEnrollment ? (
          <EnrollmentDetailsContent enrollment={routeEnrollment} />
        ) : enrollmentId ? (
          <EnrollmentDetailsLookup enrollmentId={enrollmentId} />
        ) : (
          <EmptyStateCard
            containerStyle={styles.emptyState}
            message="This enrollment is no longer available. Return to the list and open it again."
            variant="empty"
          />
        )}
      </View>
    </GlobalScrollView>
  );
}
