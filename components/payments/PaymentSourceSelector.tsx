import { paymentSourceSelectorStyles as styles } from '@/styles/components/payments/PaymentSourceSelector';
import { PaymentSourceSelectorProps } from '@/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '../common/AppText';

const PaymentSourceSelector: React.FC<PaymentSourceSelectorProps> = ({ options, selectedValue, onSelect }) => {
  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <View style={styles.container}>
      <View accessibilityRole="tablist" style={styles.segments}>
        {options.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              hitSlop={{ bottom: 2, top: 2 }}
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={[styles.segment, isSelected && styles.segmentSelected]}
            >
              <AppText weight={isSelected ? '600' : '500'} style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {selectedOption?.description ? (
        <AppText style={styles.hint}>{selectedOption.description}</AppText>
      ) : null}
    </View>
  );
};

export default PaymentSourceSelector;
