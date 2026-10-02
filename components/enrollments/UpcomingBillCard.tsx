import { AppText } from '@/components/common/AppText';
import { monthlyBillsStyles as styles } from '@/styles/components/enrollments/MonthlyBills';
import type { UpcomingBillCardProps } from '@/types/bill';
import React, { memo, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

const UpcomingBillCard = ({
  bill,
  index,
  onPress,
  pageWidth,
  scrollX,
}: UpcomingBillCardProps) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const accessibilityTitle = bill.merchantName || bill.title;
  const inputRange = [
    (index - 1) * pageWidth,
    index * pageWidth,
    (index + 1) * pageWidth,
  ];
  const pageScale = scrollX.interpolate({
    extrapolate: 'clamp',
    inputRange,
    outputRange: [0.985, 1, 0.985],
  });

  const animatePress = (toValue: number) => {
    Animated.timing(pressScale, {
      duration: 110,
      easing: Easing.out(Easing.quad),
      toValue,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: Animated.multiply(pageScale, pressScale) }],
        width: pageWidth,
      }}
    >
      <Pressable
        accessibilityHint="Opens Auto Debit enrollment details"
        accessibilityLabel={`${accessibilityTitle}, ${bill.amount}, due ${bill.dueDateLabel}`}
        accessibilityRole="button"
        onPress={() => onPress(bill)}
        onPressIn={() => animatePress(0.98)}
        onPressOut={() => animatePress(1)}
        style={styles.pressableCard}
        testID={`monthly-bill-card-${index}`}
      >
        <View style={styles.amountGroup}>
          {bill.merchantName ? (
            <AppText
              numberOfLines={1}
              size="small"
              weight="600"
              style={styles.merchantName}
            >
              {bill.merchantName}
            </AppText>
          ) : null}
          <AppText
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            numberOfLines={1}
            weight="700"
            style={styles.heading}
          >
            {bill.amount}
          </AppText>
          <AppText size="small" style={styles.amountLabel}>
            {`Next bill due ${bill.dueDateLabel}`}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default memo(UpcomingBillCard);
