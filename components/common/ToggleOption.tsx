import { toggleOptionStyles } from '@/styles/components/common/ToggleOption';
import { ButtonVariant, ToggleOptionProps } from '@/types';
import React, { useState } from 'react';
import { LayoutAnimation, TouchableOpacity, View } from 'react-native';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

const ToggleOptionComponent: React.FC<ToggleOptionProps> = ({ options = ['Option A', 'Option B'], initialSelected, onOptionChange, buttonConfig }) => {
  const defaultSelection = initialSelected || options[0];
  const [selected, setSelected] = useState(defaultSelection);
  const useAppButton = buttonConfig?.isButton;
  const primaryVariant = (buttonConfig?.primaryBtn) as ButtonVariant;
  const secondaryVariant = (buttonConfig?.secondaryBtn) as ButtonVariant;

  const handlePress = (option: string) => {
    LayoutAnimation.easeInEaseOut();
    setSelected(option);
    if (onOptionChange) {
      onOptionChange(option);
    }
  };

  return (
    <View style={[toggleOptionStyles.container, useAppButton ? { padding: 0 } : null]}>
      {options.map((option, index) => {
        const isSelected = selected === option;

        return (
          <View style={[useAppButton && index === 0 ? { marginRight: 8 } : null, { flex: 1 }]} key={option}>
            { useAppButton ? (
              <AppButton 
                title={option} 
                variant={isSelected ? primaryVariant : secondaryVariant} 
                key={option} 
                onPress={() => handlePress(option)}
              />
            ) : (
              <TouchableOpacity 
                key={option} 
                style={[ toggleOptionStyles.button, isSelected ? toggleOptionStyles.selectedButton : undefined ]}
                onPress={() => handlePress(option)}
                activeOpacity={0.8}
              >
                <AppText style={[ toggleOptionStyles.text, isSelected ? toggleOptionStyles.selectedText : toggleOptionStyles.unselectedText ]}>
                  {option}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default ToggleOptionComponent;