import DownloadIcon from '@/assets/icons/download.svg';
import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { ReceiptSkeleton } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useGetBillDetailQuery } from '@/redux/features/billDetail/billDetailApi';
import { useGetBillersQuery } from '@/redux/features/biller/billerApi';
import { useGetPaymentMethodsQuery } from '@/redux/features/paymentMethods/paymentMethodApi';
import { useGetTransactionDetailQuery } from '@/redux/features/transactionDetail/transactionDetailApi';
import type { TransactionDetail } from '@/redux/features/transactionDetail/transactionDetailTypes';
import { oneTimePaymentCompleted } from '@/redux/features/oneTimePayment/oneTimePaymentSlice';
import { cacheCompletedTransaction } from '@/redux/features/transactions/transactionApi';
import { useAppDispatch } from '@/redux/hooks';
import { paymentSuccessStyles as styles } from '@/styles/app/bills/common/payment-success';
import { globalStyle } from '@/styles/common/globals';
import { formatApiDate } from '@/utils/date';
import { getSearchParam } from '@/utils/format';
import { isFailedPaymentStatus, isProcessingPaymentStatus } from '@/utils/paymentStatus';
import { buildCustomerDetails, buildReceiptDetails, formatCurrencyAmount, parseComputationResponse } from '@/utils/paymentReceipt';
import { transactionDetailToListTransaction } from '@/utils/transactionHistory';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

const PaymentSuccessScreen = () => {
  const dispatch = useAppDispatch();
  const { billingReferenceId, computationResponse, invoiceReferenceId, transactionReferenceId } = useLocalSearchParams();
  const billingId = getSearchParam(billingReferenceId);
  const rawComputationResponse = getSearchParam(computationResponse);
  const parsedComputationResponse = useMemo(() => (
    parseComputationResponse(rawComputationResponse)
  ), [rawComputationResponse]);

  const receiptInvoiceReferenceId = getSearchParam(transactionReferenceId) || getSearchParam(invoiceReferenceId) || parsedComputationResponse?.invoiceReferenceId || parsedComputationResponse?.computation?.invoiceReferenceId || '';
  const { data: billData } = useGetBillDetailQuery(billingId, { skip: !billingId });
  const { data: billers = [] } = useGetBillersQuery({});

  const { currentData: transactionData, isLoading: isTransactionLoading, isFetching: isTransactionFetching, isError: isTransactionError } = useGetTransactionDetailQuery(receiptInvoiceReferenceId, {
    skip: !receiptInvoiceReferenceId,
  });
  const { data: paymentMethods } = useGetPaymentMethodsQuery();
  const [receipt, setReceipt] = useState<{ invoiceReferenceId: string; transaction: TransactionDetail } | null>(null);
  const receiptTransaction = receipt?.invoiceReferenceId === receiptInvoiceReferenceId ? receipt.transaction : null;
  const activeTransaction = receiptTransaction || transactionData || null;
  const computedAmount = parsedComputationResponse?.computation;
  const totalCurrency = activeTransaction?.totalCurrency || computedAmount?.totalCurrency || '';
  const totalAmount = typeof activeTransaction?.totalAmount === 'number' ? activeTransaction.totalAmount : computedAmount?.totalAmount;
  const formattedTotalAmount = totalCurrency && typeof totalAmount === 'number' ? formatCurrencyAmount(totalCurrency, totalAmount) : '';
  const dateToDisplay = activeTransaction?.transactionDate || new Date().toISOString();
  const formattedDate = formatApiDate(dateToDisplay, "MMMM dd, yyyy - hh:mm:ss a");
  const transactionDetails = useMemo(() => (
    activeTransaction
      ? buildReceiptDetails(activeTransaction)
      : {}
  ), [activeTransaction]);
  const customerDetails = useMemo(() => (
    activeTransaction
      ? buildCustomerDetails(activeTransaction, billData?.custom_fields)
      : {}
  ), [activeTransaction, billData?.custom_fields]);
  const merchantLogoUrl = useMemo(() => {
    const billerById = billData?.merchant_id
      ? billers.find((biller) => biller.merchant_id === billData.merchant_id)
      : undefined;
    const normalizedMerchantName = (billData?.merchant_name || transactionData?.merchantName || '')
      .trim()
      .toLowerCase();
    const matchingBiller = billerById || billers.find((biller) => (
      biller.merchant_name.trim().toLowerCase() === normalizedMerchantName
    ));

    return matchingBiller?.merchant_logo_url ?? null;
  }, [billData?.merchant_id, billData?.merchant_name, billers, transactionData?.merchantName]);

  const paymentIsProcessing = isProcessingPaymentStatus(activeTransaction?.status);
  const paymentFailed = isFailedPaymentStatus(activeTransaction?.status);

  useEffect(() => {
    if (receiptInvoiceReferenceId && transactionData && !isFailedPaymentStatus(transactionData.status)) {
      dispatch(oneTimePaymentCompleted(receiptInvoiceReferenceId));
    }
  }, [dispatch, receiptInvoiceReferenceId, transactionData]);

  useEffect(() => {
    if (transactionData && !isFailedPaymentStatus(transactionData.status)) {
      setReceipt({ invoiceReferenceId: receiptInvoiceReferenceId, transaction: transactionData });
      dispatch(cacheCompletedTransaction(
        transactionDetailToListTransaction(
          transactionData,
          receiptInvoiceReferenceId,
          merchantLogoUrl,
        ),
      ));
    }
  }, [dispatch, merchantLogoUrl, receiptInvoiceReferenceId, transactionData]);

  const paymentProvider = useMemo(() => {
    if (activeTransaction?.paymentMethodProvider) {
      return activeTransaction.paymentMethodProvider;
    }

    const primaryMethod = paymentMethods?.find(method => method.isPrimary);
    if (primaryMethod?.paymentMethodProvider) {
      return primaryMethod.paymentMethodProvider;
    }

    return paymentMethods?.[0]?.paymentMethodProvider || '';
  }, [activeTransaction, paymentMethods]);

  const renderState = (message: string, variant: 'empty' | 'error' = 'error') => (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <View style={{ flex: 1 }}>
        <NavHeaderComponent title='Pay Bills' onBackPress={() => router.replace('/dashboard')} />
        <EmptyStateCard variant={variant} message={message} />
        <SpacerComponent height={24} />
        <AppButton
          title="Back to Home"
          variant="tertiary"
          onPress={() => router.push('/dashboard')}
        />
      </View>
      <SpacerComponent height={24} />
    </GlobalScrollView>
  );

  if (!receiptInvoiceReferenceId) {
    return renderState('Missing payment receipt reference. Please return to your bills and try again.', 'empty');
  }

  if (isTransactionLoading || (isTransactionFetching && !activeTransaction)) {
    return (
      <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title='Pay Bills' onBackPress={() => router.replace('/dashboard')} />
          <ReceiptSkeleton label="Loading payment receipt" />
        </View>
      </GlobalScrollView>
    );
  }

  if (isTransactionError || !activeTransaction) {
    return renderState('Unable to load the payment receipt. Please try again later.');
  }

  if (paymentFailed) {
    return renderState('This payment could not be completed. Check transaction history before trying again.');
  }

  return (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <View style={{ flex: 1 }}>
        <NavHeaderComponent title='Pay Bills' onBackPress={() => router.replace('/dashboard')} />
        <View style={styles.screenWrapper}>
          {paymentIsProcessing ? (
            <AppText size="small" weight="700" style={styles.processingNotice}>Payment is processing</AppText>
          ) : null}
          <View style={{ alignItems: 'center' }}>
            <AppText size='medium' style={styles.title} weight='700'>{activeTransaction.merchantName || billData?.merchant_name}</AppText>
            {formattedTotalAmount ? (
              <AppText size='large' mBottom={8} weight='700'>{formattedTotalAmount}</AppText>
            ) : null}
            {paymentProvider ? (
              <AppText size='extraSmall' mBottom={8}>
                using <AppText size='extraSmall' mBottom={8} weight='700'>{paymentProvider.toUpperCase()}</AppText>
              </AppText>
            ) : null}
          </View>

          <View style={[globalStyle.outerContainer, { marginBottom: 24 }]}>
            <View style={styles.wrapper}>
              <AppText size='base' style={styles.sectionTitle} weight='700'>Transaction Details</AppText>
              {Object.entries(transactionDetails).map(([key, field]) => (
                  <InfoFieldComponent label={field.text} value={field.value} key={key} />
              ))}
            </View>
          </View>

          {Object.keys(customerDetails).length > 0 ? (
            <View style={[globalStyle.outerContainer, { marginBottom: 24 }]}>
              <View style={styles.wrapper}>
                <AppText size='base' style={styles.sectionTitle} weight='700'>Payment Details</AppText>
                {Object.entries(customerDetails).map(([key, field]) => (
                    <InfoFieldComponent label={field.text} value={field.value} key={key} />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.paymentDetailsContainer}>
            <TouchableOpacity style={styles.downloadReceiptContainer}>
              <DownloadIcon width={24} height={24} />
              <AppText style={styles.downloadReceiptLabel}>Get PDF Receipt</AppText>
            </TouchableOpacity>
            
            <AppText mBottom={12} style={styles.downloadDateLabel}>{formattedDate}</AppText>
            <AppText mBottom={20} style={styles.downloadDescLabel}>
              {paymentIsProcessing
                ? 'Payment is processing. It will show in your transaction history.'
                : 'This has been processed and your payment will be posted real-time.'}
            </AppText>
          </View>
        </View>
        <SpacerComponent height={24} />

        <AppButton
          title="Share Receipt"
          variant="primary"
        />

        <SpacerComponent height={12} />
        <AppButton 
          title="Back to Home"
          variant="tertiary" 
          onPress={() => router.push('/dashboard')}
        />
      </View>
      <SpacerComponent height={24} />
    </GlobalScrollView>
  );
};

export default PaymentSuccessScreen;
