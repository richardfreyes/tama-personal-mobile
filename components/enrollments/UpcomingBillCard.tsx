import { AppText } from '@/components/common/AppText';
import {
  DASHBOARD_BILL_CARD_GRADIENT_COLORS,
  DASHBOARD_BILL_CARD_GRADIENT_LOCATIONS,
  DASHBOARD_BILL_CAROUSEL_GAP,
  GRADIENT_HORIZONTAL_END,
  GRADIENT_HORIZONTAL_START,
} from '@/constants';
import { Colors } from '@/styles/common/colors';
import { upcomingBillCardStyles as styles } from '@/styles/components/enrollments/UpcomingBillCard';
import type { UpcomingBillCardProps } from '@/types/common';
import { getAmountParts } from '@/utils/format';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

const UpcomingBillCard = ({ bill, index, onEnroll, onPress, pageWidth }: UpcomingBillCardProps) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const accessibilityTitle = bill.merchantName || bill.title;
  const amountParts = getAmountParts(bill.amount);

  const animatePress = (toValue: number) => {
    Animated.timing(pressScale, {
      duration: 110,
      easing: Easing.out(Easing.quad),
      toValue,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.page, { width: pageWidth + DASHBOARD_BILL_CAROUSEL_GAP }]}>
      <Animated.View style={[styles.cardShadow, { width: pageWidth, transform: [{ scale: pressScale }] }]}>
        <View style={styles.card} testID={`monthly-bill-card-container-${index}`}>
          <Pressable
            accessibilityHint="Opens Auto Debit enrollment details"
            accessibilityLabel={`${accessibilityTitle}, ${bill.amount}, due ${bill.dueDateLabel}`}
            accessibilityRole="button"
            onPress={() => onPress(bill)}
            onPressIn={() => animatePress(0.98)}
            onPressOut={() => animatePress(1)}
            testID={`monthly-bill-card-${index}`}
          >
            <LinearGradient
              colors={DASHBOARD_BILL_CARD_GRADIENT_COLORS}
              locations={DASHBOARD_BILL_CARD_GRADIENT_LOCATIONS}
              start={GRADIENT_HORIZONTAL_START}
              end={GRADIENT_HORIZONTAL_END}
              style={styles.topBand}
            >
              <View style={styles.labelColumn}>
                <AppText weight="400" style={styles.overline}>Next bill due</AppText>
                <AppText numberOfLines={1} weight="500" style={styles.merchantName}>
                  {accessibilityTitle}
                </AppText>
              </View>
              {amountParts ? (
                <View accessibilityLabel={bill.amount} style={styles.amountRow}>
                  <AppText weight="500" style={styles.currency}>{amountParts.currency}</AppText>
                  <AppText
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    numberOfLines={1}
                    weight="600"
                    style={styles.wholeAmount}
                  >
                    {amountParts.whole}
                    <AppText weight="500" style={styles.cents}>{amountParts.cents}</AppText>
                  </AppText>
                </View>
              ) : (
                <AppText numberOfLines={1} weight="600" style={styles.amountFallback}>{bill.amount}</AppText>
              )}
            </LinearGradient>
            <View style={styles.dueSection}>
              <View style={styles.dueRow}>
                <View style={styles.dueDate}>
                  <Feather name="calendar" size={14} color={Colors.maroon10} />
                  <AppText weight="500" style={styles.dueDateText}>{`Due ${bill.dueDateLabel}`}</AppText>
                </View>
                <View style={styles.daysBadge}>
                  <AppText weight="500" style={styles.daysBadgeText}>{bill.daysRemainingLabel}</AppText>
                </View>
              </View>
            </View>
          </Pressable>
          <View style={styles.enrollSection}>
            <Pressable
              accessibilityLabel="Enroll Auto Debit"
              accessibilityRole="button"
              onPress={onEnroll}
              style={({ pressed }) => [styles.enrollButton, pressed && styles.enrollButtonPressed]}
            >
              <Feather name="repeat" size={18} color={Colors.red09} />
              <AppText weight="600" style={styles.enrollText}>Enroll Auto Debit</AppText>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default memo(UpcomingBillCard);
