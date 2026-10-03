import OneTimePaymentCard from '@/components/bills/OneTimePaymentCard';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import AutoDebitCard from '@/components/enrollments/AutoDebitCard';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useGetEnrollmentsQuery } from '@/redux/features/enrollments/enrollmentApi';
import { globalStyle } from '@/styles/common/globals';
import { countActiveEnrollments } from '@/utils/enrollmentPresentation';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

export default function Bills() {
  const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useGetEnrollmentsQuery();
  const activeEnrollmentCount = useMemo(
    () => countActiveEnrollments(enrollmentsData?.items),
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
          <AutoDebitCard
            activeCount={activeEnrollmentCount}
            isLoading={isLoadingEnrollments}
            onPress={hasActiveEnrollment ? handleManageAutoPay : handleEnrollAutoPay}
          />
        </View>
      </GlobalScrollView>
    </KeyboardAvoidingView>
  );
}
