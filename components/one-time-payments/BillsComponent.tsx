import { useGetBillersQuery } from "@/redux/features/biller/billerApi";
import { useGetBillsQuery } from "@/redux/features/bills/billsApi";
import { globalStyle } from "@/styles/common/globals";
import { billsComponentStyles as styles } from "@/styles/components/one-time-payments/BillsComponent";
import type { BillsComponentProps } from "@/types";
import { formatMonetaryDisplayValue } from "@/utils/format";
import { getSavedBillsForDisplay, getUniqueSavedBills, shouldUseMockSavedBills } from "@/utils/savedBills";
import { router } from "expo-router";
import { useMemo } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { AppButton } from "../common/AppButton";
import { AppText } from "../common/AppText";
import EmptyStateCard from "../common/EmptyStateCard";
import { HorizontalCardSkeleton } from "../common/Loading";
import { SectionHeaderComponent } from "../common/SectionHeaderComponent";
import { SpacerComponent } from "../common/SpacerComponent";

export default function BillsComponent({
  sectionHeader,
  sectionFooter,
  onViewAllPress,
  onAddBillerPress,
  onPayNowPress,
}: BillsComponentProps) {
  const {
    data: BillersData = [],
    isLoading: isLoadingBillers,
    isError: isErrorBillers,
  } = useGetBillersQuery({});
  const {
    data: billsData,
    isLoading: isLoadingBills,
    isError: isErrorBills,
  } = useGetBillsQuery({ page: 0 });
  const isUsingMockBills = shouldUseMockSavedBills(billsData);
  const uniqueBills = useMemo(
    () => getUniqueSavedBills(getSavedBillsForDisplay(billsData)),
    [billsData],
  );
  const isBillsListEmpty = uniqueBills.length === 0;
  const hasBillsError = (isErrorBillers || isErrorBills) && !isUsingMockBills;

  const getBillerLogoUrl = (bill: any, billers: any) => {
    const matchingBiller = billers.find((biller: any) => biller.merchant_id === bill.merchant_id);
    return matchingBiller ? matchingBiller.merchant_logo_url : null;
  };

  const handleBillPress = (billingReferenceId: string, merchantName: string) => {
    router.push({
      pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
      params: { billingReferenceId, merchantName },
    });
  };

  const handleViewAllPress = () => {
    if (onViewAllPress) {
      onViewAllPress();
      return;
    }

    router.push('/bills/one-time-payments');
  };

  const handleAddBillerPress = () => {
    if (onAddBillerPress) {
      onAddBillerPress();
      return;
    }

    router.push({
      pathname: '/bills/one-time-payments',
      params: { view: 'add' },
    });
  };

  const handlePayNowPress = () => {
    if (onPayNowPress) {
      onPayNowPress();
      return;
    }

    router.push('/bills/one-time-payments/saved');
  };

  if ((isLoadingBillers || isLoadingBills) && !isUsingMockBills) {
    return (
      <View style={globalStyle.outerContainer}>
        <SectionHeaderComponent title={sectionHeader?.title} />
        <HorizontalCardSkeleton label="Loading saved bills" />
      </View>
    );
  }

  return (
    <View style={globalStyle.outerContainer}>
      <SectionHeaderComponent title={sectionHeader?.title} linkText={isBillsListEmpty ? null : sectionHeader?.linkText} onViewAllPress={handleViewAllPress} />
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.billListContent, isBillsListEmpty ? { width: '100%' } : null]}>
        {hasBillsError ? (
          <EmptyStateCard
            variant="error"
            message="Unable to load bills at the moment. Please try again later."
          />
        ) : isBillsListEmpty ? (
          <EmptyStateCard
            variant="empty"
            message="It looks like you don't have any bills added yet."
          />
          ) : 
          uniqueBills.map((bill) => {
            const logoUrl = getBillerLogoUrl(bill, BillersData);
            return (
              <TouchableOpacity 
                key={bill.billing_id} 
                onPress={() => handleBillPress(bill.billing_reference_id, bill.merchant_name)}
                style={styles.cardWrapper}
              >
                <View style={styles.billCard}>
                  <View style={styles.logoPlaceholder}>
                    {logoUrl && (
                      <Image
                        source={{ uri: logoUrl }}
                        style={styles.billerLogo}
                        resizeMode='contain'
                      />
                    )}
                  </View>
                  <AppText size='small' weight="600" style={styles.billerName}>{bill.billing_name}</AppText>
                  <AppText size='tiny' style={styles.subText}>{bill.merchant_name}</AppText>
                  <AppText size='base' weight="600" style={styles.amountText}>
                    {formatMonetaryDisplayValue(bill?.custom_fields?.amount?.value, bill?.custom_fields?.amount?.text)}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
      {!hasBillsError && sectionFooter?.button &&
        <View style={{ marginTop: 12 }}>
          <AppButton title="Add Biller" variant="primary" onPress={handleAddBillerPress} />
          <SpacerComponent height={12} />
          <AppButton title="Pay Now" variant="secondary" onPress={handlePayNowPress} />
        </View>
      }
    </View>
  );
}
