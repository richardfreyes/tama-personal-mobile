import SearchIcon from '@/assets/icons/search.svg';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { searchInputStyles as styles } from '@/styles/components/common/SearchInput';
import type { SearchInputProps } from '@/types/component-props';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { forwardRef, useState } from 'react';
import { Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';

const SearchInput = forwardRef<TextInput, SearchInputProps>(function SearchInput({
  containerStyle,
  editable = true,
  inputStyle,
  onBlur,
  onClear,
  onFocus,
  placeholderTextColor,
  testID,
  variant = 'outlined',
  ...props
}, ref) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  if (variant === 'filled') {
    return (
      <View
        style={[styles.filledContainer, containerStyle]}
        testID={testID ? `${testID}-container` : undefined}
      >
        <Feather color={Colors.maroon09} name="search" size={20} style={styles.filledIcon} />
        <TextInput
          {...props}
          editable={editable}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholderTextColor={Colors.transparent}
          ref={ref}
          style={[styles.filledInput, inputStyle]}
          testID={testID}
        />
        {/* iOS clips the native placeholder with Poppins, so draw it ourselves. */}
        {!props.value && props.placeholder ? (
          <Text
            accessible={false}
            numberOfLines={1}
            pointerEvents="none"
            style={[styles.filledPlaceholder, placeholderTextColor ? { color: placeholderTextColor } : null]}
            testID={testID ? `${testID}-placeholder` : undefined}
          >
            {props.placeholder}
          </Text>
        ) : null}
        {props.value && onClear ? (
          <Pressable
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            hitSlop={4}
            onPress={onClear}
            style={styles.clearButton}
            testID={testID ? `${testID}-clear` : undefined}
          >
            <Ionicons color={Colors.maroon07} name="close-circle" size={18} />
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[globalStyle.searchBarContainer, containerStyle]}
      testID={testID ? `${testID}-container` : undefined}
    >
      <TextInput
        {...props}
        editable={editable}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholderTextColor={placeholderTextColor ?? Colors.neutral07}
        ref={ref}
        style={[
          globalStyle.inputBase,
          isFocused && editable && globalStyle.inputFocused,
          !editable && globalStyle.inputDisabled,
          inputStyle,
        ]}
        testID={testID}
      />
      <View
        accessible={false}
        pointerEvents="none"
        style={[globalStyle.searchIcon, !editable && globalStyle.searchIconDisabled]}
        testID={testID ? `${testID}-icon` : undefined}
      >
        <SearchIcon height={18} width={18} />
      </View>
    </View>
  );
});

export default SearchInput;
