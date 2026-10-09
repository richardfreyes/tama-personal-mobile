import { SAVED_BILL_NO_AMOUNT_LABEL, SAVED_BILL_STATUS_COLORS } from '@/constants/savedBills';
import { globalStyle } from '@/styles/common/globals';
import { enrollmentListComponentStyles } from '@/styles/components/enrollments/EnrollmentListComponent';
import { invoiceItemStyles } from '@/styles/components/one-time-payments/InvoiceItemComponent';
import { savedBillCardStyles as cardStyles } from '@/styles/components/one-time-payments/SavedBillCard';
import { SavedBillCardProps } from '@/types/common';
import type { Bill } from '@/redux/features/bills/billsTypes';
import { formatSavedBillAmount, getBillerStatus, getSavedBillInitials, getSavedBillNickname, getSavedBillSubtitle, } from '@/utils/savedBills';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import StatusBadge from '../common/StatusBadge';
import { AppText } from '../common/AppText';
import MerchantLogo from '../common/MerchantLogo';

export default function SavedBillCard({
  bill,
  logoUrl,
  onPress,
  variant = 'row',
  fullWidth = false,
  status: statusOverride,
}: SavedBillCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const amount = formatSavedBillAmount(bill as Bill);
  const hasAmount = amount !== SAVED_BILL_NO_AMOUNT_LABEL;
  const name = getSavedBillNickname(bill);
  const computedStatus = useMemo(() => getBillerStatus(bill as Bill), [bill]);
  const status = statusOverride !== undefined ? statusOverride : computedStatus;
  const isCard = variant === 'card';
  const isHero = variant === 'hero';
  const reference = 'billing_reference_id' in bill
    ? bill.billing_reference_id || bill.billing_id
    : undefined;

  const statusBadge = status ? (
    <StatusBadge
      colors={SAVED_BILL_STATUS_COLORS[status.tone]}
      label={status.label}
      style={isHero ? cardStyles.heroStatus : undefined}
      testID={`biller-status-${status.tone}`}
    />
  ) : null;

  if (isHero) {
    const subtitle = getSavedBillSubtitle(bill);

    return (
      <View style={cardStyles.hero} testID="biller-hero">
        <MerchantLogo
          initials={getSavedBillInitials(bill.merchant_name || name)}
          logoUrl={logoUrl}
          size={56}
          variant="ring"
        />
        <View style={cardStyles.heroCopy}>
          <AppText numberOfLines={1} weight="600" style={cardStyles.heroNickname}>{name}</AppText>
          {subtitle ? <AppText numberOfLines={1} style={cardStyles.heroSubtitle}>{subtitle}</AppText> : null}
          {statusBadge}
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityHint="Opens this bill for payment"
      accessibilityLabel={[name, bill.merchant_name, amount, status?.label].filter(Boolean).join(', ')}
      accessibilityRole="button"
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onPress={() => onPress?.(bill as Bill)}
      style={
        isCard
          ? ({ pressed }) => [cardStyles.card, fullWidth && cardStyles.cardFull, pressed && cardStyles.cardPressed]
          : [
            globalStyle.optionHolder,
            enrollmentListComponentStyles.headerRow,
            isFocused ? globalStyle.inputFocused : null,
          ]
      }
      testID={`${isCard ? 'biller-card' : 'saved-bill-card'}-${reference}`}
    >
      {isCard ? (
        <>
          <View style={[cardStyles.identity, fullWidth && cardStyles.identityFull]}>
            <MerchantLogo
              initials={getSavedBillInitials(bill.merchant_name || name)}
              logoUrl={logoUrl}
              size={40}
              variant="ring"
            />
            <View style={cardStyles.names}>
              <AppText numberOfLines={1} weight="600" style={cardStyles.nickname}>{name}</AppText>
              <AppText numberOfLines={1} style={cardStyles.merchantName}>{bill.merchant_name}</AppText>
            </View>
          </View>
          <View style={[cardStyles.details, fullWidth && cardStyles.detailsFull]}>
            <AppText
              adjustsFontSizeToFit={hasAmount}
              minimumFontScale={0.8}
              numberOfLines={1}
              weight={hasAmount ? '600' : '500'}
              style={hasAmount ? cardStyles.amount : cardStyles.noAmount}
            >
              {amount}
            </AppText>
            {statusBadge}
          </View>
        </>
      ) : (
        <>
          <MerchantLogo
            initials={getSavedBillInitials(bill.merchant_name || name)}
            logoUrl={logoUrl}
            size={40}
            variant="circle"
          />

          <View style={enrollmentListComponentStyles.identityGroup}>
            <AppText color="neutral09" numberOfLines={1} size="small" weight="600">{name}</AppText>
            <AppText color="neutral08" ellipsizeMode="tail" numberOfLines={1} size="small">
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
              weight={hasAmount ? '600' : '500'}
            >
              {amount}
            </AppText>
            {statusBadge}
          </View>
        </>
      )}
    </Pressable>
  );
}
