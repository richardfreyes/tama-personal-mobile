import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { TransactionDetailSkeleton } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import ToggleOptionComponent from '@/components/common/ToggleOption';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import EnrollmentTransactionDetails from '@/components/transactions/EnrollmentTransactionDetails';
import { useGetEnrollmentTransactionHistoryQuery } from '@/redux/features/enrollmentTransactionHistory/enrollmentTransactionHistoryApi';
import { useGetTransactionDetailQuery } from '@/redux/features/transactionDetail/transactionDetailApi';
import { invoiceReferenceIdStyles as styles } from '@/styles/app/transactions/invoiceReferenceId';
import { globalStyle } from '@/styles/common/globals';
import { formatMoney } from '@/utils/format';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

const TransactionDetailScreen = () => {
  const { invoiceReferenceId, isAutoPay, transactionId: transactionIdParam, transactionType } = useLocalSearchParams();
  const routeReferenceId = Array.isArray(invoiceReferenceId) ? invoiceReferenceId[0] : invoiceReferenceId;
  const routeTransactionId = Array.isArray(transactionIdParam) ? transactionIdParam[0] : transactionIdParam;
  const resolvedTransactionType = Array.isArray(transactionType) ? transactionType[0] : transactionType;
  const isEnrollment = resolvedTransactionType === 'enrollment';
  const detailId = routeTransactionId || routeReferenceId || '';
  const {
    data: transactionData,
    currentData: transactionCurrentData,
    isLoading,
    isFetching,
    isUninitialized,
    isError,
  } = useGetTransactionDetailQuery(routeReferenceId || '', { skip: isEnrollment || !routeReferenceId });
  const {
    data: enrollmentHistoryData,
    currentData: enrollmentHistoryCurrentData,
    isLoading: isEnrollmentLoading,
    isFetching: isEnrollmentFetching,
    isUninitialized: isEnrollmentUninitialized,
    isError: isEnrollmentError,
    refetch: refetchEnrollmentHistory,
  } = useGetEnrollmentTransactionHistoryQuery(
    { page: 0, count: 10, searchQuery: detailId },
    { skip: !isEnrollment || !detailId },
  );
  const toggleOptions = ['Details', 'Invoices'];
  const [selectedToggleOptions, setSelectedToggleOptions] = useState('Details');

  if (isEnrollment) {
    const enrollmentTransaction = enrollmentHistoryData?.transactions.find((transaction) => (
      routeTransactionId
      && [
        transaction.enrollmentTransactionId,
        transaction.externalTransactionId,
        transaction.invoiceReferenceId,
        transaction.paymentReferenceId,
      ].some((identifier) => identifier != null && String(identifier) === routeTransactionId)
    )) ?? enrollmentHistoryData?.transactions.find((transaction) => (
      transaction.enrollmentReferenceId != null
      && String(transaction.enrollmentReferenceId) === routeReferenceId
    ));

    const isEnrollmentPending = !detailId
      || isEnrollmentLoading
      || isEnrollmentUninitialized
      || (isEnrollmentFetching && !enrollmentHistoryData)
      || (enrollmentHistoryData !== undefined && enrollmentHistoryCurrentData === undefined);

    if (isEnrollmentPending) {
      return (
        <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
          <NavHeaderComponent title="Enrollment Transaction Details" />
          <SpacerComponent height={12} />
          <TransactionDetailSkeleton label="Loading enrollment transaction details" />
        </GlobalScrollView>
      );
    }

    if (isEnrollmentError && !enrollmentTransaction) {
      return (
        <View style={styles.centered}>
          <AppText style={styles.errorText}>Unable to load enrollment transaction details.</AppText>
          <TouchableOpacity onPress={() => { void refetchEnrollmentHistory(); }}>
            <AppText style={styles.backLink}>Try Again</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <AppText style={styles.backLink}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!enrollmentTransaction) {
      return (
        <View style={styles.centered}>
          <AppText style={styles.errorText}>Enrollment transaction details are unavailable.</AppText>
          <TouchableOpacity onPress={() => router.back()}>
            <AppText style={styles.backLink}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      );
    }

    return <EnrollmentTransactionDetails transaction={enrollmentTransaction} />;
  }

  const isTransactionPending = !routeReferenceId
    || isLoading
    || isUninitialized
    || (isFetching && !transactionData)
    || (transactionData !== undefined && transactionCurrentData === undefined);

  if (isTransactionPending) {
    return (
      <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
        <NavHeaderComponent title='Transaction Details' />
        <SpacerComponent height={12} />
        <TransactionDetailSkeleton label="Loading transaction details" />
      </GlobalScrollView>
    );
  }

  if (isError && !transactionData) {
    return (
      <View style={styles.centered}>
        <AppText style={styles.errorText}>Error loading transaction: {isError}</AppText>
        <TouchableOpacity onPress={() => router.back()}>
          <AppText style={styles.backLink}>Go Back</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  if (!transactionData) {
    return (
      <View style={styles.centered}>
        <AppText style={styles.errorText}>Transaction details are unavailable.</AppText>
        <TouchableOpacity onPress={() => router.back()}>
          <AppText style={styles.backLink}>Go Back</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const transactionDateFormatted = new Date(transactionData.transactionDate).toLocaleDateString();

  const handleSelectionChange = (option: string) => {
    setSelectedToggleOptions(option);
  }

  return (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <View style={{ flex: 1 }}>
        <NavHeaderComponent title={transactionData.merchantName} logo={false} />
        { isAutoPay && isAutoPay === 'Autopay' &&  (
            <ToggleOptionComponent
              options={toggleOptions}
              initialSelected={'Details'}
              onOptionChange={handleSelectionChange}
            />
          )
        }

        <SpacerComponent height={12} />
        { selectedToggleOptions && selectedToggleOptions === 'Details' ? (
          <View>
            <View style={globalStyle.outerContainer}>
              <AppText size='base' weight='700' mBottom={8}>Payment Details</AppText>
              <InfoFieldComponent label="Status" value={transactionData.status.toLowerCase() === 'uncaptured' ? 'Pending' : transactionData.status.charAt(0).toUpperCase() + transactionData.status.slice(1).toLowerCase()} />
              <InfoFieldComponent label="Date" value={transactionDateFormatted} />
              <InfoFieldComponent label="Reference ID" value={transactionData?.paymentReferenceId} weight="700" copy={true} />
              <InfoFieldComponent label="Transaction ID" value={transactionData.externalTransactionId} />
            </View>

            <SpacerComponent height={12} />

            <View style={globalStyle.outerContainer}>
              <AppText size='base' weight='700' mBottom={8}>Billing Details</AppText>

              {Object.keys(transactionData.billingDetails).map(key => {
                const detail = transactionData.billingDetails[key];
                return <InfoFieldComponent label={detail.text} value={detail.value} key={key} />
              })}

              {transactionData.items.map((item, index) => {
                const isBillPayment = item.description === 'Bills payment';
                const amount = isBillPayment ? item.chargedAmount : item.feeAmount;
                const currency = isBillPayment ? item.chargedCurrency : item.feeCurrency;

                return (
                  <InfoFieldComponent 
                    key={index} 
                    label={item.description} 
                    value={formatMoney([currency, amount])}
                  />
                );
              })}

              <InfoFieldComponent label="Total Charged" value={formatMoney([transactionData.totalCurrency, transactionData.totalAmount])} weight="700" />

            </View>
          </View>
        ) : null }
        <SpacerComponent height={100} />
      </View>

    </GlobalScrollView>
  );
};

export default TransactionDetailScreen;
