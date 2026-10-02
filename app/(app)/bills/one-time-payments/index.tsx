import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import SearchMerchants from '@/components/common/SearchMerchants';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import BillsComponent from '@/components/one-time-payments/BillsComponent';
import { COMMON } from '@/constants/common';
import { useGetBillersQuery } from '@/redux/features/biller/billerApi';
import { globalStyle } from '@/styles/common/globals';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

export default function Bills() {
  const params = useLocalSearchParams<{ view?: string | string[] }>();
  const selectedView = Array.isArray(params.view) ? params.view[0] : params.view;
  const isAddBillerView = selectedView === 'add';
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(COMMON.BILLER_CATEGORIES[0].categoryId);
  const { data: billersData, isLoading: isLoadingBillers, isError: isErrorBillers } = useGetBillersQuery(
    { search: '', category: activeCategoryId },
  );

  const handleAddBillerPress = (biller: any) => {
    router.push({
      pathname: '/(app)/bills/one-time-payments/add/form',
      params: {
        merchantId: biller.merchant_id,
        merchantCode: biller.merchant_code,
        merchantName: biller.merchant_name,
      },
    });
  };

  const handleCategoryPress = (categoryId: number | undefined) => {
    setActiveCategoryId(categoryId);
  };

  const handleOpenSavedBills = () => {
    router.push('/bills/one-time-payments/saved');
  };

  const billerSearch = (
    <SearchMerchants
      data={billersData || []}
      searchProperty="merchant_name"
      onSelect={handleAddBillerPress}
      isError={isErrorBillers}
      isLoading={isLoadingBillers}
      activeCategoryId={activeCategoryId}
      onCategoryChange={handleCategoryPress}
    />
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <GlobalScrollView
        contentContainerStyle={[
          globalStyle.screenContainer,
          globalStyle.screenContainerTop,
        ]}
      >
        <View>
          <NavHeaderComponent title="One Time Payments" />
          {isAddBillerView ? (
            billerSearch
          ) : (
            <>
              <View>
                <BillsComponent
                  sectionHeader={{ title: 'Saved Billers', linkText: 'View All' }}
                  onViewAllPress={handleOpenSavedBills}
                />
              </View>
              <SpacerComponent height={12} />
              {billerSearch}
            </>
          )}
        </View>
      </GlobalScrollView>
    </KeyboardAvoidingView>
  );
};
