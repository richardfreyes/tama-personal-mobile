import AutoPayStatusCard from '@/components/bills/AutoPayStatusCard';
import OneTimePaymentCard from '@/components/bills/OneTimePaymentCard';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SkeletonBlock } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import AutoDebitCard from '@/components/enrollments/AutoDebitCard';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useGetEnrollmentsQuery } from '@/redux/features/enrollments/enrollmentApi';
import { globalStyle } from '@/styles/common/globals';
import { getEnrollmentStatusLabel } from '@/utils/enrollmentPresentation';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

export default function Bills() {
  const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useGetEnrollmentsQuery();
  const activeEnrollmentCount = useMemo(
    () => (enrollmentsData?.items ?? []).filter(
      (enrollment) => getEnrollmentStatusLabel(enrollment.status) === 'Active',
    ).length,
    [enrollmentsData?.items],
  );
  const hasActiveEnrollment = activeEnrollmentCount > 0;

  const handleMakePayment = () => router.push('/bills/one-time-payments');
  const handleEnrollAutoPay = () => router.push('/bills/enrollments');
  const handleManageAutoPay = () => router.push('/(app)/bills/enrollments/enrolled');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <GlobalScrollView
        contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}
      >
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title="Bills" />

          <OneTimePaymentCard onMakePayment={handleMakePayment} />

          <SpacerComponent height={12} />
          {isLoadingEnrollments ? (
            <View style={globalStyle.outerContainer} testID="autopay-loading">
              <SkeletonBlock width="40%" height={16} />
              <SpacerComponent height={12} />
              <SkeletonBlock height={56} borderRadius={12} />
            </View>
          ) : hasActiveEnrollment ? (
            <AutoPayStatusCard activeCount={activeEnrollmentCount} onManage={handleManageAutoPay} />
          ) : (
            <AutoDebitCard onPress={handleEnrollAutoPay} />
          )}
        </View>
      </GlobalScrollView>
    </KeyboardAvoidingView>
  );
}
