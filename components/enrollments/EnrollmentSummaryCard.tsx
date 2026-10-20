import { useThemedStyles, useThemeColors } from '@/hooks/useAppTheme';
import { AppText } from '@/components/common/AppText';
import EnrollmentStatusBadge from '@/components/enrollments/EnrollmentStatusBadge';
import { ENROLLMENT_SUMMARY_PANEL_GLOW_COLORS, ENROLLMENT_SUMMARY_PANEL_GLOW_END, ENROLLMENT_SUMMARY_PANEL_GLOW_START, ENROLLMENT_SUMMARY_PANEL_GRADIENT_COLORS, ENROLLMENT_SUMMARY_PANEL_GRADIENT_END, ENROLLMENT_SUMMARY_PANEL_GRADIENT_LOCATIONS, ENROLLMENT_SUMMARY_PANEL_GRADIENT_START, } from '@/constants/enrollment';
import { Feather } from '@expo/vector-icons';
import { createEnrollmentListComponentStyles as makeStyles } from '@/styles/components/enrollments/EnrollmentListComponent';
import type { EnrollmentSummaryCardProps } from '@/types/enrollment';
import { getCardIcon } from '@/utils/card';
import { getEnrollmentMerchantCode, getEnrollmentMonthlyAmount, getEnrollmentNextDebitCountdown, getEnrollmentNextDebitShortDate, getEnrollmentPaymentMethod, getEnrollmentReferenceId, getEnrollmentStatusLabel, getEnrollmentTitle } from '@/utils/enrollmentPresentation';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, View } from 'react-native';

const EnrollmentSummaryCard = ({ item, index, logoUrl: resolvedLogoUrl, onPress, wrapperStyle }: EnrollmentSummaryCardProps) => {
  const styles = useThemedStyles(makeStyles);
  const Colors = useThemeColors();

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const title = getEnrollmentTitle(item);
  const referenceId = getEnrollmentReferenceId(item);
  const merchantCode = getEnrollmentMerchantCode(item);
  const monthlyAmount = getEnrollmentMonthlyAmount(item);
  const amount = monthlyAmount.startsWith('PHP') ? monthlyAmount.replace(/^PHP\s*/, '₱') : monthlyAmount;
  const nextDebitDate = getEnrollmentNextDebitShortDate(item) ?? 'Not scheduled';
  const nextDebitCountdown = getEnrollmentNextDebitCountdown(item);
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
          <Feather
            accessible={false}
            color={Colors.neutral06}
            name="chevron-right"
            size={18}
            style={styles.headerChevron}
          />
        </View>

        <LinearGradient
          colors={[...ENROLLMENT_SUMMARY_PANEL_GRADIENT_COLORS]}
          end={ENROLLMENT_SUMMARY_PANEL_GRADIENT_END}
          locations={[...ENROLLMENT_SUMMARY_PANEL_GRADIENT_LOCATIONS]}
          start={ENROLLMENT_SUMMARY_PANEL_GRADIENT_START}
          style={styles.amountPanel}
        >
          <LinearGradient
            colors={[...ENROLLMENT_SUMMARY_PANEL_GLOW_COLORS]}
            end={ENROLLMENT_SUMMARY_PANEL_GLOW_END}
            pointerEvents="none"
            start={ENROLLMENT_SUMMARY_PANEL_GLOW_START}
            style={styles.amountPanelGlow}
          />
          <View style={styles.amountColumn}>
            <AppText weight="600" style={styles.panelLabel}>
              MONTHLY
            </AppText>
            <AppText
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              numberOfLines={1}
              weight="700"
              style={styles.panelAmount}
            >
              {amount}
            </AppText>
          </View>
          <View style={styles.nextDebitColumn}>
            <AppText weight="600" style={styles.panelLabel}>
              NEXT DEBIT
            </AppText>
            <AppText numberOfLines={1} weight="700" style={styles.nextDebitValue}>
              {nextDebitDate}
            </AppText>
            {nextDebitCountdown ? (
              <AppText numberOfLines={1} weight="500" style={styles.nextDebitCountdown}>
                {nextDebitCountdown}
              </AppText>
            ) : null}
          </View>
        </LinearGradient>

        <View style={styles.paymentMethodFooter}>
          <View style={styles.paymentMethodIconFrame}>
            <PaymentMethodIcon height={24} width={34} />
          </View>
          <AppText numberOfLines={1} weight="400" style={styles.paymentMethodText}>
            {paymentMethod.lastFour ? `\u2022\u2022 ${paymentMethod.lastFour}` : paymentMethod.display}
          </AppText>
          <AppText weight="600" style={styles.manageText}>
            Manage
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default memo(EnrollmentSummaryCard);
