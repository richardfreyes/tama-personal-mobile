import { useThemedStyles } from '@/hooks/useAppTheme';
import { createGlobalStyle as makeGlobalStyle, inputFocusColor } from '@/styles/common/globals';
import { createAppSelectInputStyles as makeStyles } from '@/styles/components/forms/AppSelectInput';
import { AppSelectInputProps } from '@/types';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { BRAND_RING_GRADIENT_COLORS, GRADIENT_HORIZONTAL_END, GRADIENT_HORIZONTAL_START } from '@/constants/gradients';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, TextInput, useTheme } from 'react-native-paper';

const AppSelectInput = ({
  label,
  placeholder,
  options,
  selectedValue,
  onValueChange,
  style,
}: AppSelectInputProps) => {
  const styles = useThemedStyles(makeStyles);
  const globalStyle = useThemedStyles(makeGlobalStyle);

  const [visible, setVisible] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const theme = useTheme();

  const openMenu = () => {
    setForceUpdateKey(prev => prev + 1);
    setIsFocused(true);
    setVisible(true);
  };

  const closeMenu = () => {
    setIsFocused(false);
    setVisible(false);
  };

  const selectedOption = options.find(opt => opt.code === selectedValue);
  const displayValue = selectedOption ? selectedOption.name : '';
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
                {isFocused ? (
                  <LinearGradient
                    colors={[...BRAND_RING_GRADIENT_COLORS]}
                    end={GRADIENT_HORIZONTAL_END}
                    start={GRADIENT_HORIZONTAL_START}
                    style={globalStyle.inputFocusGradient}
                  />
                ) : null}
                {isFocused ? <View pointerEvents="none" style={globalStyle.inputFocusFill} /> : null}
                <TextInput
                  mode="outlined"
                  label={label ?? placeholder}
                  activeOutlineColor={inputFocusColor}
                  theme={isFocused ? { colors: { onSurfaceVariant: inputFocusColor } } : undefined}
                  accessibilityLabel={label}
                  outlineStyle={[globalStyle.inputOutline, isFocused && { backgroundColor: 'transparent', borderColor: 'transparent' }]}
                  contentStyle={globalStyle.inputContent}
                  value={displayValue}
                  style={styles.input}
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