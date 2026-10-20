import { AppText } from '@/components/common/AppText';
import SearchInput from '@/components/common/SearchInput';
import { useThemedStyles, useThemeColors } from '@/hooks/useAppTheme';
import { createGlobalStyle as makeGlobalStyle, inputFocusColor } from '@/styles/common/globals';
import { createNativePickerStyles as makeStyles } from '@/styles/components/forms/NativePicker';
import type { NativePickerProps } from '@/types';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NativePicker: React.FC<NativePickerProps> = ({ label, placeholder, options, selectedValue, onValueChange, enabled = true, error, disabledMessage }) => {
  const globalStyle = useThemedStyles(makeGlobalStyle);
  const styles = useThemedStyles(makeStyles);
  const Colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [tempValue, setTempValue] = useState(selectedValue);
  const [search, setSearch] = useState('');
  const displayValue = options.find(option => option.code === selectedValue)?.name || '';
  const matchingOptions = options.filter(option => option.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));

  useEffect(() => {
    setTempValue(selectedValue);
  }, [selectedValue]);

  const openPicker = () => {
    if (!enabled) {
      if (disabledMessage) {
        if (Platform.OS === 'ios') Alert.alert('Action Required', disabledMessage, [{ text: 'OK' }]);
        else Alert.alert('Action Required', disabledMessage);
      }
      return;
    }
    Keyboard.dismiss();
    setTempValue(selectedValue);
    setSearch('');
    setVisible(true);
  };

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={placeholder} accessibilityState={{ disabled: !enabled, expanded: visible }} onPress={openPicker}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            accessibilityLabel={`${label} selection`}
            value={displayValue}
            editable={false}
            error={!!error}
            activeOutlineColor={inputFocusColor}
            outlineColor={Colors.border}
            textColor={Colors.text}
            placeholderTextColor={Colors.textSecondary}
            outlineStyle={globalStyle.inputOutline}
            contentStyle={globalStyle.inputContent}
            right={<TextInput.Icon icon={!enabled ? 'alert-circle-outline' : 'chevron-down'} color={Colors.textSecondary} forceTextInputFocus={false} />}
            style={[styles.input, !enabled && styles.disabledInput]}
          />
        </View>
      </Pressable>
      <HelperText style={globalStyle.inputLabelError} type="error" visible={!!error}>{error}</HelperText>
      <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable accessibilityLabel="Dismiss picker" style={styles.modalBackdrop} onPress={() => setVisible(false)} />
          <View accessibilityViewIsModal style={[styles.modalContent, { backgroundColor: Colors.surface, paddingBottom: insets.bottom }]}>
            <View style={styles.modalHeader}>
              <Pressable accessibilityRole="button" onPress={() => setVisible(false)} hitSlop={12}><AppText style={styles.cancelButton}>Cancel</AppText></Pressable>
              <AppText style={styles.modalTitle} weight="600">{label}</AppText>
              <Pressable accessibilityRole="button" onPress={() => { onValueChange(tempValue); setVisible(false); }} hitSlop={12}><AppText style={styles.doneButton}>Done</AppText></Pressable>
            </View>
            <SearchInput accessibilityLabel={`Search ${label}`} containerStyle={styles.pickerSearch} placeholder={`Search ${label.toLowerCase()}`} value={search} onChangeText={setSearch} onClear={() => setSearch('')} variant="filled" />
            <FlatList
              keyboardShouldPersistTaps="handled"
              style={styles.pickerList}
              data={matchingOptions}
              keyExtractor={item => String(item.code)}
              ListHeaderComponent={!search ? <Pressable accessibilityRole="radio" accessibilityState={{ selected: tempValue === '' }} onPress={() => setTempValue('')} style={styles.pickerRow}><AppText style={styles.pickerLabel}>{placeholder}</AppText></Pressable> : null}
              ListEmptyComponent={<AppText style={styles.pickerSearch}>No results found.</AppText>}
              renderItem={({ item }) => (
                <Pressable accessibilityRole="radio" accessibilityLabel={item.name} accessibilityState={{ selected: item.code === tempValue }} style={[styles.pickerRow, item.code === tempValue && styles.selectedRow]} onPress={() => setTempValue(item.code)}>
                  <AppText style={[styles.pickerLabel, item.code === tempValue && styles.selectedLabel]}>{item.name}</AppText>
                  {item.code === tempValue ? <Feather name="check" color={Colors.primaryText} size={20} /> : null}
                </Pressable>
              )}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default NativePicker;
