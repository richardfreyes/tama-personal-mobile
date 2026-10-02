import { paymentSourceSelectorStyles as styles } from '@/styles/components/payments/PaymentSourceSelector';
import { PaymentSourceSelectorProps } from '@/types';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { AppText } from '../common/AppText';

const PaymentSourceSelector: React.FC<PaymentSourceSelectorProps> = ({ options, selectedValue, onSelect }) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            activeOpacity={0.7}
          >
            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
              {isSelected ? <View style={styles.radioInner} /> : null}
            </View>
            <View style={styles.optionTextContainer}>
              <AppText weight="600">{option.label}</AppText>
              {option.description ? (
                <AppText size="small" style={styles.optionDescription}>{option.description}</AppText>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PaymentSourceSelector;
