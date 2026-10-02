import { globalStyle } from '@/styles/common/globals';
import { enrollmentListComponentStyles } from '@/styles/components/enrollments/EnrollmentListComponent';
import { invoiceItemStyles } from '@/styles/components/one-time-payments/InvoiceItemComponent';
import { SavedBillCardProps } from '@/types/common';
import { getSavedBillAmount, getSavedBillCaption } from '@/utils/savedBills';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { AppText } from '../common/AppText';

export default function SavedBillCard({ bill, logoUrl, onPress }: SavedBillCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const amount = useMemo(() => getSavedBillAmount(bill), [bill]);
  const caption = useMemo(() => getSavedBillCaption(bill), [bill]);

  return (
    <Pressable
      accessibilityHint="Opens this bill for payment"
      accessibilityLabel={`${bill.billing_name}, ${bill.merchant_name}, ${amount}, ${caption}`}
      accessibilityRole="button"
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onPress={() => onPress(bill)}
      style={[
        globalStyle.optionHolder,
        enrollmentListComponentStyles.headerRow,
        isFocused ? globalStyle.inputFocused : null,
      ]}
      testID={`saved-bill-card-${bill.billing_reference_id || bill.billing_id}`}
    >
      <View style={[enrollmentListComponentStyles.avatar, enrollmentListComponentStyles.avatarWithLogo]}>
        {logoUrl ? (
          <Image
            accessible={false}
            resizeMode="contain"
            source={{ uri: logoUrl }}
            style={enrollmentListComponentStyles.avatarLogo}
            testID={`saved-bill-logo-${bill.billing_reference_id || bill.billing_id}`}
          />
        ) : null}
      </View>

      <View style={enrollmentListComponentStyles.identityGroup}>
        <AppText
          color="neutral09"
          numberOfLines={1}
          size="small"
          weight="600"
        >
          {bill.billing_name}
        </AppText>
        <AppText
          color="neutral08"
          ellipsizeMode="tail"
          numberOfLines={1}
          size="small"
        >
          {bill.merchant_name}
        </AppText>
      </View>

      <View style={invoiceItemStyles.amountContainer}>
        <AppText
          adjustsFontSizeToFit
          color="neutral09"
          minimumFontScale={0.8}
          numberOfLines={1}
          size="small"
          weight="600"
        >
          {amount}
        </AppText>
        <AppText color="aqua10" numberOfLines={1} size="extraSmall" weight="600">
          {caption}
        </AppText>
      </View>
    </Pressable>
  );
}
