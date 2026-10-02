import { GlobalScrollView } from "@/components/common/GlobalScrollView";
import NavHeaderComponent from "@/components/layout/NavHeaderComponent";
import { SlideUpScreenModal } from "@/components/layout/SlideUpScreenModal";
import FilterAutopay from "@/components/payments/FilterAutopay";
import TransactionHistoryComponent from "@/components/transactions/TransactionHistoryComponent";
import { COMMON } from "@/constants/common";
import { Colors } from "@/styles/common/colors";
import { globalStyle } from "@/styles/common/globals";
import { AppliedFilters, TransactionHistoryRef } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { RefreshControl, View } from "react-native";

export default function Transactions() {
  const [activeFilters, setActiveFilters] = useState<AppliedFilters>(COMMON.EMPTY_FILTERS);
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const listRef = useRef<TransactionHistoryRef>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setActiveFilters(COMMON.EMPTY_FILTERS);
        bottomSheetRef.current?.close();
      };
    }, [])
  );

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
    bottomSheetRef.current?.close();
  };

  const handleResetFilters = () => {
    setActiveFilters(COMMON.EMPTY_FILTERS);
    bottomSheetRef.current?.close();
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
    <View style={{ flex: 1 }}>
      <GlobalScrollView 
        contentContainerStyle={[globalStyle.screenContainer, {minHeight: '110%'}]}
        onScroll={() => {
          listRef.current?.loadMore();
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.aqua10}
            colors={[Colors.aqua10]}
          />
        }
        scrollEventThrottle={16}>
        <NavHeaderComponent title='Transaction History' />
        <View style={{ flex: 1 }}>
          <TransactionHistoryComponent 
            ref={listRef}
            isFilterVisible={true} 
            activeFilters={activeFilters}
            sectionHeader={{ title: 'Review your payment history' }} 
            onOpenFilterSheet={() => bottomSheetRef.current?.snapToIndex(2)} 
          />
        </View>
      </GlobalScrollView>
      <SlideUpScreenModal ref={bottomSheetRef}>
        <View>
          <FilterAutopay
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </View>
      </SlideUpScreenModal>
    </View>
  );
}
