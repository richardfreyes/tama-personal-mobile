import SearchMerchants from '@/components/common/SearchMerchants';
import EnrollmentListComponent from '@/components/enrollments/EnrollmentListComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useGetMerchantsQuery } from '@/redux/features/merchants/merchantApi';
import { clearEnrollmentCardPayload, clearEnrollmentTransactionResponse, triggerEnrollmentFormReset } from '@/redux/features/enrollments/review/reviewSlice';
import { useAppDispatch } from '@/redux/hooks';
import { autoDebitEnrollmentStyles as styles } from '@/styles/app/bills/enrollments/index';
import { Colors } from '@/styles/common/colors';
import type { EnrollmentListRef } from '@/types';
import { getDisplayableAutoDebitMerchants } from '@/utils/enrollmentMerchants';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';

export default function Bills() {
  const dispatch = useAppDispatch();
  const listRef = useRef<EnrollmentListRef>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { data: enrollmentsData, isLoading, isError: isErrorEnrollmentsData } = useGetMerchantsQuery('');
  const autoDebitMerchants = useMemo(() => getDisplayableAutoDebitMerchants(enrollmentsData), [enrollmentsData]);

  useFocusEffect(
    useCallback(() => {
      dispatch(clearEnrollmentTransactionResponse());
      dispatch(clearEnrollmentCardPayload());
    }, [dispatch])
  );

  const handleBillerPress = (biller: any) => {
    dispatch(triggerEnrollmentFormReset());
    router.push({
      pathname: '/bills/enrollments/form',
      params: {
        merchantId: biller.id,
        merchantCode: biller.pid,
        merchantName: biller.name
      },
    });
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await listRef.current?.refresh();
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <NavHeaderComponent title="Enroll in Auto Debit" variant="outlined" />
      <SearchMerchants
        data={autoDebitMerchants}
        header={<EnrollmentListComponent ref={listRef} variant="carousel" />}
        isError={isErrorEnrollmentsData}
        isLoading={isLoading}
        onSelect={handleBillerPress}
        refreshControl={(
          <RefreshControl
            colors={[Colors.red10]}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor={Colors.red10}
          />
        )}
        searchProperty="name"
      />
    </KeyboardAvoidingView>
  );
}
