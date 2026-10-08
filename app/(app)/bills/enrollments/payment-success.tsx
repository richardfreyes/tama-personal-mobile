import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { ReceiptSkeleton } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/constants/contact';
import { useGetMerchantEnrollmentReceiptQuery, useGetMerchantReceiptQuery } from '@/redux/features/merchants/merchantApi';
import type { MerchantTransactionFieldPayload } from '@/redux/features/merchants/merchantTypes';
import { paymentSuccessStyles as styles } from '@/styles/app/bills/common/payment-success';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { formatApiDate } from '@/utils/date';
import { formatEnrollmentAmount, formatMoney, getFirstString, getSearchParam, resolveDisplayValue } from '@/utils/format';
import { buildScheduledPaymentInfo } from '@/utils/paymentMappers';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, View } from 'react-native';

const EnrollmentPaymentSuccessScreen = () => {
  const { merchantId, referenceId, receiptAccessSignature, receiptAccessType, receiptAccessToken, isEnrollment: isEnrollmentParam } = useLocalSearchParams<{ merchantId?: string | string[]; referenceId?: string | string[]; receiptAccessSignature?: string | string[]; receiptAccessType?: string | string[]; receiptAccessToken?: string | string[]; isEnrollment?: string | string[]; }>();
  const merchantCode = getSearchParam(merchantId);
  const receiptReferenceId = getSearchParam(referenceId);
  const accessSignature = getFirstString( getSearchParam(receiptAccessSignature), getSearchParam(receiptAccessToken) );
  const accessType = getFirstString( getSearchParam(receiptAccessType), 'view' );
  const isEnrollment = getSearchParam(isEnrollmentParam) === 'true';

  const paymentReceiptQuery = useGetMerchantReceiptQuery(
    { merchantCode, referenceId: receiptReferenceId, accessSignature, accessType },
    { skip: isEnrollment || !merchantCode || !receiptReferenceId || !accessSignature },
  );

  const enrollmentReceiptQuery = useGetMerchantEnrollmentReceiptQuery(
    { merchantCode, referenceId: receiptReferenceId, accessSignature, accessType },
    { skip: !isEnrollment || !merchantCode || !receiptReferenceId || !accessSignature },
  );

  const { data: receipt, isError, isLoading } = isEnrollment ? enrollmentReceiptQuery : paymentReceiptQuery;

  const paidAt = receipt?.paidAt || receipt?.invoiceUpdatedAt || receipt?.updatedAt || receipt?.createdAt;
  const formattedDate = formatApiDate(paidAt, 'MMMM dd, yyyy - hh:mm:ss a');
  const paymentProvider = [receipt?.methodProvider, receipt?.methodType].filter(Boolean).join(' ').toUpperCase();
  const dynamicFields = ((isEnrollment ? receipt?.fields : receipt?.transactionFields) as MerchantTransactionFieldPayload[] | undefined ?? [])
    .filter((f: MerchantTransactionFieldPayload) => f.value != null && String(f.value).trim() !== '')
    .map((f: MerchantTransactionFieldPayload) => ({ label: f.text || f.name, value: String(f.value) }));

  const enrollmentAmount = isEnrollment
    ? formatEnrollmentAmount(receipt?.bill?.currency, receipt?.bill?.amount)
    : undefined;

  const scheduledPaymentInfo = isEnrollment && receipt
    ? buildScheduledPaymentInfo({
        currency: receipt.bill?.currency,
        monthlyAmount: receipt.enrollmentMonthlyInvoiceAmount ?? receipt.bill?.amount,
        months: receipt.enrollmentMonths,
        startDate: receipt.enrollmentStartDate,
      })
    : null;

  const receiptDetails: { label: string; value: string }[] = receipt ? (isEnrollment ? [
      { label: 'Reference ID', value: resolveDisplayValue(receipt.referenceId) },
      { label: 'Transaction ID', value: resolveDisplayValue(receipt.transactionId) },
      { label: 'Project Name', value: resolveDisplayValue(receipt.projectName) },
      { label: 'Payment Type', value: resolveDisplayValue(receipt.paymentTypeName || receipt.transactionTypeCode) },
      ...dynamicFields,
      { label: 'Name', value: resolveDisplayValue(receipt.customerName) },
      { label: 'Email', value: resolveDisplayValue(receipt.customerEmail) },
      { label: 'Mobile', value: resolveDisplayValue(receipt.customerMobileNo) },
      { label: 'Enrollment Start Date', value: receipt?.enrollmentStartDate ? formatApiDate(receipt.enrollmentStartDate, 'MMMM dd, yyyy') : 'N/A' },
      { label: 'Enrollment Duration', value: receipt?.enrollmentMonths != null ? `${receipt.enrollmentMonths} month(s)` : 'N/A' },
      { label: 'Monthly Invoice Amount', value: formatEnrollmentAmount(receipt?.bill?.currency, receipt?.enrollmentMonthlyInvoiceAmount) },
      { label: 'Amount', value: enrollmentAmount || 'N/A' },
      { label: 'Payment Status', value: resolveDisplayValue(receipt?.paymentStatusName || receipt?.status) },
    ] : [
      { label: 'Reference ID', value: resolveDisplayValue(receipt.referenceId) },
      { label: 'Transaction ID', value: resolveDisplayValue(receipt.transactionId) },
      { label: 'Project Name', value: resolveDisplayValue(receipt.projectName) },
      { label: 'Payment Type', value: resolveDisplayValue(receipt.paymentTypeName) },
      ...dynamicFields,
      { label: 'Name', value: resolveDisplayValue(receipt.customerName) },
      { label: 'Email', value: resolveDisplayValue(receipt.customerEmail) },
      { label: 'Mobile', value: resolveDisplayValue(receipt.customerMobileNo) },
      { label: 'Amount Due', value: formatMoney(receipt.billBase) },
      { label: `Amount in ${receipt.billConverted?.[0] || 'Converted Currency'}`, value: formatMoney(receipt.billConverted) },
      { label: 'Convenience Fee', value: formatMoney(receipt.billFee) },
      { label: 'Total Amount', value: formatMoney(receipt.billTotal) },
      { label: 'Tama Exchange Rate', value: receipt.qwxRate ? `${receipt.qwxRate[0]} 1 = ${receipt.qwxRate[2]} ${receipt.qwxRate[1]}` : 'N/A' },
      { label: 'Payment Status', value: resolveDisplayValue(receipt.paymentStatusName || receipt.status) },
    ]) : [];

  return (
    <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
      <View style={{ flex: 1 }}>
        <NavHeaderComponent title='Pay Bills' onBackPress={() => router.replace('/dashboard')} />
        {isLoading ? (
          <ReceiptSkeleton label="Loading payment receipt" />
        ) : isError || !receipt ? (
          <View style={styles.screenWrapper}>
            <View style={{ alignItems: 'center' }}>
              <AppText size='medium' style={styles.title} weight='700'>Receipt unavailable</AppText>
              <AppText size='small' mBottom={24}>We could not load the payment receipt. Please try again later.</AppText>
            </View>
          </View>
        ) : (
          <View style={styles.screenWrapper}>
            <View style={{ alignItems: 'center' }}>
              <AppText size='medium' style={styles.title} weight='700'>{receipt.merchantName}</AppText>
              <AppText size='large' mBottom={8} weight='700'>{isEnrollment ? (enrollmentAmount || 'N/A') : formatMoney(receipt.billTotal)}</AppText>
              {paymentProvider ? (
                <AppText size='extraSmall' mBottom={8}>
                  using <AppText size='extraSmall' mBottom={8} weight='700'>{paymentProvider}</AppText>
                </AppText>
              ) : null}
            </View>

            <View style={[globalStyle.outerContainer, { marginBottom: 24 }]}>
              <View style={styles.wrapper}>
                {receiptDetails.map((item, index) => (
                  <InfoFieldComponent
                    weight={item.label === 'Total Amount' || item.label === 'Amount' || item.label === 'Reference ID' ? '700' : '400'}
                    label={item.label}
                    value={item.value}
                    key={index}
                  />
                ))}
              </View>
            </View>

            {scheduledPaymentInfo && (
              <>
                <View style={[globalStyle.outerContainer, { marginBottom: 16 }]}>
                  <View style={styles.wrapper}>
                    <AppText size='small' color='neutral07'>Scheduled Payment</AppText>
                    {scheduledPaymentInfo.rows.map((item, index) => (
                      <InfoFieldComponent
                        weight={item.weight || '400'}
                        label={item.label}
                        value={item.value}
                        key={index}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.scheduledPaymentNoteContainer}>
                  <AppText size='extraSmall' color='neutral07' style={{ textAlign: 'center' }}>This has been processed and your payment will be posted real-time. You can also find a copy of your receipt on your email. For questions or concerns, please reach out to us at 
                    <AppText style={{ fontSize: styles.downloadDescLabel.fontSize, color: Colors.info07 }} onPress={() => Linking.openURL(SUPPORT_MAILTO)}>
                      <AppText> </AppText>{SUPPORT_EMAIL}
                    </AppText>
                  </AppText>
                </View>
              </>
            )}

            <View style={styles.paymentDetailsContainer}>
              <AppText mBottom={6} style={styles.downloadRefLabel}>{receipt.referenceId}</AppText>
              <AppText mBottom={20} style={styles.downloadDateLabel}>{formattedDate}</AppText>
            </View>
          </View>
        )}

        <SpacerComponent height={24} />
        <AppButton
          title='Back to Home'
          variant='tertiary'
          onPress={() => router.replace('/dashboard')}
        />
      </View>
      <SpacerComponent height={24} />
    </GlobalScrollView>
  );
};

export default EnrollmentPaymentSuccessScreen;
