import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import DashboardStatusBarScrim from '@/components/dashboard/DashboardStatusBarScrim';
import AutoDebitCard from '@/components/enrollments/AutoDebitCard';
import { MonthlyBillsComponent } from '@/components/enrollments/MonthlyBills';
import HeaderComponent from '@/components/layout/HeaderComponent';
import BillsComponent from '@/components/one-time-payments/BillsComponent';
import PaymentMethodsComponent from '@/components/payments/PaymentMethodsComponent';
import TransactionHistoryComponent from '@/components/transactions/TransactionHistoryComponent';
import { DASHBOARD_RECENT_TRANSACTION_COUNT } from '@/constants';
import { clearEnrollmentCardPayload, clearEnrollmentTransactionResponse } from '@/redux/features/enrollments/review/reviewSlice';
import { useGetMonthlyBillsEnrollmentsQuery } from '@/redux/features/enrollments/enrollmentApi';
import { useAppDispatch } from '@/redux/hooks';
import { dashboardStyles as styles } from '@/styles/app/dashboard/index';
import { countActiveEnrollments } from '@/utils/enrollmentPresentation';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const enrollmentsQuery = useGetMonthlyBillsEnrollmentsQuery();
  const activeEnrollmentCount = countActiveEnrollments(enrollmentsQuery.data?.items);

  const openAutoDebit = () => {
    if (activeEnrollmentCount > 0) {
      router.push('/(app)/bills/enrollments/enrolled');
      return;
    }

    dispatch(clearEnrollmentCardPayload());
    dispatch(clearEnrollmentTransactionResponse());
    router.push('/(app)/bills/enrollments');
  };

  return (
    <View style={styles.screen}>
      <GlobalScrollView contentContainerStyle={styles.content}>
        <HeaderComponent />
        <MonthlyBillsComponent />
        <AutoDebitCard
          activeCount={activeEnrollmentCount}
          isError={enrollmentsQuery.isError}
          isLoading={enrollmentsQuery.isLoading || (enrollmentsQuery.isError && enrollmentsQuery.isFetching)}
          onPress={openAutoDebit}
          onRetry={() => { void enrollmentsQuery.refetch(); }}
        />
        <BillsComponent
          sectionHeader={{ title: 'One Time Payments', linkText: 'View All' }}
          sectionFooter={{ button: true }}
        />
        <TransactionHistoryComponent
          limit={DASHBOARD_RECENT_TRANSACTION_COUNT}
          sectionHeader={{ title: 'Recent Transactions', linkText: 'View All' }}
        />
        <PaymentMethodsComponent
          isRefreshable={false}
          route="/dashboard"
          sectionFooter={{ button: false }}
          sectionHeader={{ title: 'Payment Methods', linkText: 'View All' }}
        />
      </GlobalScrollView>
      <DashboardStatusBarScrim />
    </View>
  );
}
