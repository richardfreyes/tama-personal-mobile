import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { AppText } from '@/components/common/AppText';
import { paymentInfoStyles as styles } from '@/styles/app/bills/common/payment-info';
import { globalStyle } from '@/styles/common/globals';
import React, { memo } from 'react';
import { View } from 'react-native';
import type { PaymentInfoSectionProps } from '../../types';

const PaymentInfoSection = ({ title, rows }: PaymentInfoSectionProps) => (
  <View style={[globalStyle.outerContainer, { marginBottom: 24 }]}> 
    <View style={styles.wrapper}>
      <AppText size="small" color="neutral07">{title}</AppText>
      {rows.map(({ label, value, weight }) => (
        <InfoFieldComponent key={label} weight={weight || '400'} label={label} value={value} />
      ))}
    </View>
  </View>
);

export default memo(PaymentInfoSection);
