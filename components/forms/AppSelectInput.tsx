import { inputFocusColor } from '@/styles/common/globals';
import { appSelectInputStyles as styles } from '@/styles/components/forms/AppSelectInput';
import { AppSelectInputProps } from '@/types';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { Menu, TextInput, useTheme } from 'react-native-paper';

const AppSelectInput = ({
  label,
  placeholder,
  options,
  selectedValue,
  onValueChange,
  style,
}: AppSelectInputProps) => {
  const [visible, setVisible] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const theme = useTheme();

  const openMenu = () => {
    setForceUpdateKey(prev => prev + 1); 
    setVisible(true);
  };
  
  const closeMenu = () => {
    setIsFocused(false);
    setVisible(false);
  };

  const selectedOption = options.find(opt => opt.code === selectedValue);
  const displayValue = selectedOption ? selectedOption.name : '';
  const inputLabel = displayValue || placeholder;
  const isPlaceholder = !displayValue;

  const handleSelect = (value: string | number | null) => {
    onValueChange?.(value);
    closeMenu();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <View style={[styles.container, { zIndex: 100 }, style]}> 
        <Menu
          key={forceUpdateKey}
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity testID="select-input-anchor" onPress={openMenu} style={styles.touchableAnchor}>
              <View pointerEvents="none"> 
                <TextInput
                  mode="outlined"
                  activeOutlineColor={inputFocusColor}
                  label={label}
                  value={inputLabel}
                  placeholder={placeholder}
                  style={[
                    styles.input, 
                    isPlaceholder ? { color: theme.colors.outline } : {}, 
                    isFocused && { borderColor: inputFocusColor }
                  ]}
                  right={
                    <TextInput.Icon 
                      icon={visible ? "chevron-up" : "chevron-down"} 
                    />
                  }
                  showSoftInputOnFocus={false}
                  editable={false}
                />
              </View>
            </TouchableOpacity>
          }
        >

          <Menu.Item 
            key="placeholder-null-option"
            onPress={() => handleSelect(null)} 
            title={placeholder} 
            style={isPlaceholder ? { backgroundColor: theme.colors.surfaceVariant } : {}}
          />
          
          {options.map((option) => (
            <Menu.Item
              key={option.code != null ? option.code.toString() : `null-${option.name}`} 
              onPress={() => handleSelect(option.code)}
              title={option.name}
              style={selectedValue === option.code ? { backgroundColor: theme.colors.primaryContainer } : {}}
            />
          ))}
        </Menu>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AppSelectInput;