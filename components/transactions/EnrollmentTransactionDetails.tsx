import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { globalStyle } from '@/styles/common/globals';
import type { EnrollmentTransactionDetailsProps } from '@/types';
import { formatMoney } from '@/utils/format';
import React from 'react';
import { View } from 'react-native';

const EnrollmentTransactionDetails = ({ transaction }: EnrollmentTransactionDetailsProps) => {
  const transactionDateFormatted = new Date(transaction.createdAt).toLocaleDateString();
  const enrollmentName = transaction.enrollmentName || transaction.billingName || transaction.description;
  const referenceId = transaction.paymentReferenceId || transaction.invoiceReferenceId || transaction.enrollmentReferenceId;

  return (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <View style={{ flex: 1 }}>
        <NavHeaderComponent title={transaction.merchantName} logo />
        <SpacerComponent height={12} />

        <View style={globalStyle.outerContainer}>
          <AppText size="base" weight="700" mBottom={8}>Payment Details</AppText>
          <InfoFieldComponent label="Status" value={transaction.paymentStatusName || transaction.paymentStatus} />
          <InfoFieldComponent label="Date" value={transactionDateFormatted} />
          <InfoFieldComponent label="Reference ID" value={referenceId} weight="700" copy />
          <InfoFieldComponent label="Transaction ID" value={transaction.externalTransactionId} />
          {transaction.customerName ? (
            <InfoFieldComponent label="Customer Name" value={transaction.customerName} />
          ) : null}
        </View>

        <SpacerComponent height={12} />

        <View style={globalStyle.outerContainer}>
          <AppText size="base" weight="700" mBottom={8}>Enrollment Details</AppText>
          <InfoFieldComponent label="Enrollment Status" value={transaction.enrollmentStatus} />
          <InfoFieldComponent label="Enrollment Reference ID" value={transaction.enrollmentReferenceId} />
          {enrollmentName ? (
            <InfoFieldComponent label="Enrollment Name" value={enrollmentName} />
          ) : null}
          <InfoFieldComponent label="Merchant" value={transaction.merchantName} />
        </View>

        <SpacerComponent height={12} />

        <View style={globalStyle.outerContainer}>
          <AppText size="base" weight="700" mBottom={8}>Amount Details</AppText>
          <InfoFieldComponent label="Amount" value={formatMoney([transaction.baseCurrency, transaction.baseAmount])} />
          <InfoFieldComponent label="Fee" value={formatMoney([transaction.feeCurrency, transaction.feeAmount])} />
          <InfoFieldComponent label="Total Amount" value={formatMoney([transaction.totalCurrency, transaction.totalAmount])} />
        </View>

        <SpacerComponent height={100} />
      </View>
    </GlobalScrollView>
  );
};

export default EnrollmentTransactionDetails;
