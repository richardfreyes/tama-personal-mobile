import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { AppText } from '@/components/common/AppText';
import { BILLER_SUMMARY_EMPTY_LABEL } from '@/constants/savedBills';
import { paymentInfoStyles as styles } from '@/styles/app/bills/common/payment-info';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { Feather } from '@expo/vector-icons';
import React, { memo, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { PaymentInfoSectionProps } from '../../types';

const PaymentInfoSection = ({
  title,
  rows,
  secondaryRows = [],
  emptyText,
  variant = 'default',
  testID,
}: PaymentInfoSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const isSummary = variant === 'summary';
  const visibleRows = expanded ? [...rows, ...secondaryRows] : rows;
  const hiddenCount = secondaryRows.length;

  const titleText = (
    <AppText
      color={isSummary ? undefined : 'neutral07'}
      size={isSummary ? undefined : 'small'}
      weight={isSummary ? '600' : undefined}
      style={isSummary ? styles.title : undefined}
    >
      {title}
    </AppText>
  );

  const fields = (
    <>
      {visibleRows.map((row) => (
        <InfoFieldComponent
          emptyText={emptyText ?? (isSummary ? BILLER_SUMMARY_EMPTY_LABEL : '---')}
          key={row.id ?? row.label}
          label={row.label}
          value={row.value}
          variant={isSummary ? 'summary' : 'default'}
          weight={row.weight || '400'}
        />
      ))}
      {hiddenCount > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((current) => !current)}
          style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
        >
          <AppText weight="600" style={styles.toggleText}>
            {expanded ? 'Show less' : `Show all details (${hiddenCount} more)`}
          </AppText>
          <Feather color={Colors.red09} name={expanded ? 'chevron-up' : 'chevron-down'} size={16} />
        </Pressable>
      ) : null}
    </>
  );

  if (isSummary) {
    return (
      <View style={styles.section}>
        {titleText}
        <View style={styles.card} testID={testID}>{fields}</View>
      </View>
    );
  }

  return (
    <View style={[globalStyle.outerContainer, { marginBottom: 24 }]}>
      <View style={styles.wrapper} testID={testID}>
        {titleText}
        {fields}
      </View>
    </View>
  );
};

export default memo(PaymentInfoSection);
