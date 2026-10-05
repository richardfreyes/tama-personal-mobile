import { AppText } from '@/components/common/AppText';
import { Colors } from '@/styles/common/colors';
import { globalStyle, inputFocusColor } from '@/styles/common/globals';
import { nativePickerStyles as styles } from '@/styles/components/forms/NativePicker';
import { NativePickerProps } from '@/types';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Keyboard, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { HelperText, TextInput, useTheme } from 'react-native-paper';

const NativePicker: React.FC<NativePickerProps> = ({
  label,
  placeholder,
  options,
  selectedValue,
  onValueChange,
  enabled = true,
  error,
  disabledMessage,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [tempValue, setTempValue] = useState(selectedValue);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(300)).current;

  const selectedOption = options.find(opt => opt.code === selectedValue);
  const displayValue = selectedOption?.name || '';

  useEffect(() => {
    setTempValue(selectedValue);
  }, [selectedValue]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: visible ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: visible ? 0 : 300,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  const openIOSPicker = () => {
    if (!enabled) {
      disabledMessage &&
        Alert.alert('Action Required', disabledMessage, [{ text: 'OK' }]);
      return;
    }

    Keyboard.dismiss();

    requestAnimationFrame(() => {
      setVisible(true);
    });
  };

  const renderInput = () => (
    <View pointerEvents="none">
      <TextInput
        mode="outlined"
        activeOutlineColor={inputFocusColor}
        label={label}
        value={displayValue}
        placeholder={placeholder}
        editable={false}
        multiline
        error={!!error}
        right={
          <TextInput.Icon
            icon={!enabled ? 'alert-circle-outline' : 'menu-down'}
            color={!enabled ? Colors.amber10 : undefined}
            forceTextInputFocus={false}
          />
        }
        style={[styles.input, !enabled && styles.disabledInput]}
      />
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          {renderInput()}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={openIOSPicker}
            activeOpacity={0.7}
          />
        </View>

        <HelperText style={globalStyle.inputLabelError} type="error" visible={!!error}>
          {error}
        </HelperText>

        <Modal
          transparent
          visible={visible}
          animationType="none"
          onRequestClose={() => setVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={() => setVisible(false)}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: slideAnimation }],
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <AppText style={styles.cancelButton}>Cancel</AppText>
                </TouchableOpacity>

                <AppText weight="600">{label}</AppText>

                <TouchableOpacity
                  onPress={() => {
                    onValueChange(tempValue);
                    setVisible(false);
                  }}
                >
                  <AppText style={styles.doneButton}>Done</AppText>
                </TouchableOpacity>
              </View>

              <Picker
                selectedValue={tempValue}
                onValueChange={setTempValue}
                style={styles.iosPicker}
                itemStyle={[styles.iosPickerItem, { color: theme.colors.onSurface }]}>
                <Picker.Item label={placeholder} value="" />
                {options.map(o => (
                  <Picker.Item key={o.code} label={o.name} value={o.code} />
                ))}
              </Picker>
            </Animated.View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.androidWrapper}>
        {renderInput()}

        <Picker
          enabled={enabled}
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          mode="dialog"
          style={styles.androidInvisiblePicker}
          dropdownIconColor="transparent"
        >
          <Picker.Item label={placeholder} value="" />
          {options.map(o => (
            <Picker.Item key={o.code} label={o.name} value={o.code} />
          ))}
        </Picker>

        {!enabled && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() =>
              disabledMessage &&
              Alert.alert('Action Required', disabledMessage)
            }
          />
        )}
      </View>

      <HelperText style={globalStyle.inputLabelError} type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
};

export default NativePicker;
