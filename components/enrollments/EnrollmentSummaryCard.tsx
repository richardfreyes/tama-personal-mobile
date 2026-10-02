import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import { AppText } from '@/components/common/AppText';
import EnrollmentStatusBadge from '@/components/enrollments/EnrollmentStatusBadge';
import { enrollmentListComponentStyles as styles } from '@/styles/components/enrollments/EnrollmentListComponent';
import type { EnrollmentSummaryCardProps } from '@/types/enrollment';
import { getCardIcon } from '@/utils/card';
import { getEnrollmentMerchantCode, getEnrollmentMonthlyAmount, getEnrollmentNextDebitDate, getEnrollmentPaymentMethod, getEnrollmentReferenceId, getEnrollmentStatusLabel, getEnrollmentTitle } from '@/utils/enrollmentPresentation';
import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, View } from 'react-native';

const EnrollmentSummaryCard = ({ item, index, logoUrl: resolvedLogoUrl, onPress, wrapperStyle }: EnrollmentSummaryCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const title = getEnrollmentTitle(item);
  const referenceId = getEnrollmentReferenceId(item);
  const merchantCode = getEnrollmentMerchantCode(item);
  const amount = getEnrollmentMonthlyAmount(item);
  const nextDebitDate = getEnrollmentNextDebitDate(item);
  const paymentMethod = getEnrollmentPaymentMethod(item);
  const displayTitle = merchantCode === 'Not available' ? title : merchantCode;
  const avatarInitial = displayTitle.trim().charAt(0).toUpperCase() || 'A';
  const logoUrl = resolvedLogoUrl || item.logoUrl || item.merchantLogoUrl || item.merchant_logo_url;
  const { uri: PaymentMethodIcon } = getCardIcon(paymentMethod.provider);

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      delay: Math.min(index * 24, 144),
      duration: 180,
      easing: Easing.out(Easing.quad),
      toValue: 1,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [index, opacity]);

  const animateScale = (toValue: number) => {
    Animated.timing(scale, {
      duration: 110,
      easing: Easing.out(Easing.quad),
      toValue,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardAnimationWrapper,
        { opacity, transform: [{ scale }] },
        wrapperStyle,
      ]}
    >
      <Pressable
        accessibilityHint="Opens enrollment details"
        accessibilityLabel={`${displayTitle}, reference ID ${referenceId}, ${getEnrollmentStatusLabel(item.status)}`}
        accessibilityRole="button"
        onPress={() => onPress(item)}
        onPressIn={() => animateScale(0.98)}
        onPressOut={() => animateScale(1)}
        style={styles.itemContainer}
        testID={`enrollment-card-${index}`}
      >
        <View style={styles.headerRow}>
          <View
            style={[styles.avatar, logoUrl ? styles.avatarWithLogo : null]}
            testID={`enrollment-avatar-${index}`}
          >
            {logoUrl ? (
              <Image
                accessible={false}
                resizeMode="contain"
                source={{ uri: logoUrl }}
                style={styles.avatarLogo}
              />
            ) : (
              <AppText size="medium" weight="700" style={styles.avatarText}>
                {avatarInitial}
              </AppText>
            )}
          </View>
          <View style={styles.identityGroup}>
            <AppText numberOfLines={1} weight="700" style={styles.title}>
              {displayTitle.toUpperCase()}
            </AppText>
            <AppText
              ellipsizeMode="middle"
              numberOfLines={1}
              size="extraSmall"
              weight="500"
              style={styles.referenceText}
            >
              {referenceId}
            </AppText>
          </View>
          <EnrollmentStatusBadge status={item.status} variant="summaryCard" />
          <ChevronRightIcon height={22} width={22} style={styles.chevron} />
        </View>

        <View style={styles.amountPanel}>
          <AppText size="extraSmall" weight="600" style={styles.panelLabel}>
            MONTHLY AMOUNT
          </AppText>
          <AppText
            adjustsFontSizeToFit
            numberOfLines={1}
            weight="700"
            style={styles.panelAmount}
          >
            {amount}
          </AppText>
          <View style={styles.panelDivider} />
          <View style={styles.nextDebitRow}>
            <AppText size="extraSmall" weight="600" style={styles.panelLabel}>
              NEXT DEBIT
            </AppText>
            <AppText
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              numberOfLines={1}
              size="extraSmall"
              weight="600"
              style={styles.nextDebitValue}
            >
              {nextDebitDate}
            </AppText>
          </View>
        </View>

        <View style={styles.paymentMethodFooter}>
          <View style={styles.paymentMethodIconFrame}>
            <PaymentMethodIcon height={24} width={34} />
          </View>
          <AppText numberOfLines={1} size="small" weight="500" style={styles.paymentMethodText}>
            {paymentMethod.display}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default memo(EnrollmentSummaryCard);
