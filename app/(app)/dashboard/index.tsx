import AutoDebitCard from '@/components/enrollments/AutoDebitCard';
import BillsComponent from '@/components/one-time-payments/BillsComponent';
import { MonthlyBillsComponent } from '@/components/enrollments/MonthlyBills';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import PaymentMethodCardComponent from '@/components/payments/PaymentMethodsComponent';
import TransactionHistoryComponent from '@/components/transactions/TransactionHistoryComponent';
import { useTabBarAnimation } from '@/context/TabBarAnimationContext';
import { clearEnrollmentCardPayload, clearEnrollmentTransactionResponse } from '@/redux/features/enrollments/review/reviewSlice';
import { useGetMonthlyBillsEnrollmentsQuery } from '@/redux/features/enrollments/enrollmentApi';
import { useAppDispatch } from '@/redux/hooks';
import { globalStyle } from '@/styles/common/globals';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

export default function Dashboard() {
  const { tabBarTranslateY } = useTabBarAnimation();
  const lastContentOffset = useSharedValue(0);
  const dispatch = useAppDispatch();
  const { data: enrollments } = useGetMonthlyBillsEnrollmentsQuery();
  const activeEnrollmentCount = enrollments?.items.filter((item) => ['ONGOING', 'PENDING', 'FOR_REVIEW', 'ACTIVE'].includes((item.status || '').toUpperCase().replace(/\s+/g, '_'))).length ?? 0;

  const handleEnrollAutoDebit = () => {
    dispatch(clearEnrollmentCardPayload());
    dispatch(clearEnrollmentTransactionResponse());
    router.push('/(app)/bills/enrollments');
  };

  const handleAddBiller = () => {
    router.push({ pathname: '/bills/one-time-payments', params: { view: 'add' } });
  };

  const handlePayNow = () => {
    router.push('/bills/one-time-payments/saved');
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffset = event.contentOffset.y;
      const diff = currentOffset - lastContentOffset.value;
      if (diff > 0 && currentOffset > 50) {
        tabBarTranslateY.value = 150;
      } else if (diff < 0) {
        tabBarTranslateY.value = 0;
      }

      lastContentOffset.value = currentOffset;
    },
  });

  return (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <View style={{ flex: 1 }}>
        <MonthlyBillsComponent />
        <SpacerComponent height={12} />
        <AutoDebitCard onPress={handleEnrollAutoDebit} showViewAll activeCount={activeEnrollmentCount} />
        <SpacerComponent height={12} />
        <BillsComponent
          sectionHeader={{ title: 'One Time Payments', linkText: 'View All' }}
          sectionFooter={{ button: true }}
          onAddBillerPress={handleAddBiller}
          onPayNowPress={handlePayNow}
        />
        <SpacerComponent height={12} />
        <PaymentMethodCardComponent sectionHeader={{ title: 'Payment Methods', linkText: 'View All' }} sectionFooter={{ button: true }} />
        <SpacerComponent height={12} />
        <TransactionHistoryComponent sectionHeader={{ title: 'Recent Transactions', linkText: 'View All' }} sectionFooter={{ button: true }} />
      </View>
    </GlobalScrollView>
  );
}
