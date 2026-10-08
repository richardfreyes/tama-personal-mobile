import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import SearchMerchants from '@/components/common/SearchMerchants';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import BillsComponent from '@/components/one-time-payments/BillsComponent';
import { COMMON } from '@/constants/common';
import { useAllSavedBills } from '@/hooks/useAllSavedBills';
import { useGetBillersQuery } from '@/redux/features/biller/billerApi';
import type { Biller } from '@/redux/features/biller/billerTypes';
import { billsStyles } from '@/styles/app/bills/one-time-payments';
import { globalStyle } from '@/styles/common/globals';
import { getSavedMerchantIds } from '@/utils/savedBills';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function Bills() {
  const params = useLocalSearchParams<{ view?: string | string[] }>();
  const selectedView = Array.isArray(params.view) ? params.view[0] : params.view;
  const isAddBillerView = selectedView === 'add';
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(COMMON.BILLER_CATEGORIES[0].categoryId);
  const { data: billers, isLoading, isError, refetch } = useGetBillersQuery(
    isAddBillerView ? { search: '', category: activeCategoryId } : {},
  );
  const { bills: savedBills } = useAllSavedBills({ skip: isAddBillerView });
  const savedMerchantIds = useMemo(() => getSavedMerchantIds(savedBills), [savedBills]);

  const handleOpenSavedBills = () => {
    router.push('/bills/one-time-payments/saved');
  };

  const handleAddBillerPress = (biller: Biller) => {
    router.push({
      pathname: '/bills/one-time-payments/add/form',
      params: {
        merchantId: String(biller.merchant_id),
        merchantCode: biller.merchant_code,
        merchantName: biller.merchant_name,
      },
    });
  };

  if (isAddBillerView) {
    return (
      <KeyboardAvoidingView style={billsStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
          <NavHeaderComponent title="Add Biller" variant="outlined" />
          <SearchMerchants
            activeCategoryId={activeCategoryId}
            data={billers || []}
            isError={isError}
            isLoading={isLoading}
            onCategoryChange={setActiveCategoryId}
            onSelect={handleAddBillerPress}
            searchProperty="merchant_name"
          />
        </GlobalScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={billsStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <NavHeaderComponent title="One Time Payments" variant="outlined" />
      <SearchMerchants
        data={billers ?? []}
        header={(
          <BillsComponent
            onViewAllPress={handleOpenSavedBills}
            sectionHeader={{ title: 'Saved billers', linkText: 'Manage' }}
            variant="plain"
          />
        )}
        isError={isError}
        isLoading={isLoading}
        layout="directory"
        onRetry={() => { void refetch(); }}
        savedMerchantIds={savedMerchantIds}
        searchProperty="merchant_name"
      />
    </KeyboardAvoidingView>
  );
}
