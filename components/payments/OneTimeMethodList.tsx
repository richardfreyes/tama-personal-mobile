import { useThemedStyles } from '@/hooks/useAppTheme';
import { ONE_TIME_PAYMENT_METHODS } from '@/constants/paymentOptions';
import { createGlobalStyle as makeGlobalStyle } from '@/styles/common/globals';
import { createOneTimeMethodListStyles as makeStyles } from '@/styles/components/payments/OneTimeMethodList';
import type { OneTimeMethodListProps } from '@/types';
import React from 'react';
import { View } from 'react-native';
import PaymentOptionRow from './PaymentOptionRow';

export default function OneTimeMethodList({ selectedMethod, onSelectMethod }: OneTimeMethodListProps) {
  const globalStyle = useThemedStyles(makeGlobalStyle);
  const styles = useThemedStyles(makeStyles);

  return (
    <View accessibilityRole="radiogroup" style={[globalStyle.listCard, styles.list]}>
      {ONE_TIME_PAYMENT_METHODS.map((method, index) => {
        const Icon = method.icon;

        return (
          <PaymentOptionRow
            isLast={index === ONE_TIME_PAYMENT_METHODS.length - 1}
            key={method.value}
            leading={(
              <View style={styles.tile}>
                <Icon height={method.iconHeight} width={method.iconWidth} />
              </View>
            )}
            onPress={() => onSelectMethod(method.value)}
            selected={selectedMethod === method.value}
            size="tall"
            subtitle={method.description}
            testID={`one-time-method-${method.value}`}
            title={method.title}
          />
        );
      })}
    </View>
  );
}
