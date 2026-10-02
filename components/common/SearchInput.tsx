import SearchIcon from '@/assets/icons/search.svg';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import type { SearchInputProps } from '@/types/component-props';
import React, { forwardRef, useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

const SearchInput = forwardRef<TextInput, SearchInputProps>(({ 
  containerStyle,
  editable = true,
  inputStyle,
  onBlur,
  onFocus,
  placeholderTextColor = Colors.neutral07,
  testID,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

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
        placeholderTextColor={placeholderTextColor}
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
