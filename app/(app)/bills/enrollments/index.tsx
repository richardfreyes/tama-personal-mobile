import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import SearchMerchants from '@/components/common/SearchMerchants';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import EnrollmentListComponent from '@/components/enrollments/EnrollmentListComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { COMMON } from '@/constants/common';
import { useGetMerchantsQuery } from '@/redux/features/merchants/merchantApi';
import { clearEnrollmentCardPayload, clearEnrollmentTransactionResponse, triggerEnrollmentFormReset } from '@/redux/features/enrollments/review/reviewSlice';
import { useAppDispatch } from '@/redux/hooks';
import { autoDebitEnrollmentStyles as styles } from '@/styles/app/bills/enrollments/index';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import type { EnrollmentListRef } from '@/types';
import { getDisplayableAutoDebitMerchants } from '@/utils/enrollmentMerchants';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, View } from 'react-native';

export default function Bills() {
  const dispatch = useAppDispatch();
  const listRef = useRef<EnrollmentListRef>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(COMMON.BILLER_CATEGORIES[0].categoryId);
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

  const handleCategoryPress = (categoryId: number | undefined) => {
    setActiveCategoryId(categoryId);
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
      <GlobalScrollView
        contentContainerStyle={globalStyle.screenContainer}
        refreshControl={(
          <RefreshControl
            colors={[Colors.red10]}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor={Colors.red10}
          />
        )}
      >
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title="Enroll in Auto Debit" />
          <EnrollmentListComponent ref={listRef} variant="carousel" />
          <SpacerComponent height={12} />
          <SearchMerchants
            data={autoDebitMerchants}
            searchProperty="name"
            onSelect={handleBillerPress}
            isError={isErrorEnrollmentsData}
            isLoading={isLoading}
            activeCategoryId={activeCategoryId}
            onCategoryChange={handleCategoryPress}
            apiEnv="enrollments"
          />
        </View>
      </GlobalScrollView>
    </KeyboardAvoidingView>
  );
}
