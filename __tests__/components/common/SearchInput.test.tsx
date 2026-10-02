import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import SearchInput from '../../../components/common/SearchInput';
import { Colors } from '../../../styles/common/colors';

describe('SearchInput', () => {
  it('centers the icon and reserves space for it', () => {
    render(
      <SearchInput
        onChangeText={jest.fn()}
        placeholder="Search"
        testID="search-input"
        value=""
      />,
    );

    const inputStyle = StyleSheet.flatten(screen.getByTestId('search-input').props.style);
    const containerStyle = StyleSheet.flatten(screen.getByTestId('search-input-container').props.style);
    const iconStyle = StyleSheet.flatten(screen.getByTestId('search-input-icon').props.style);

    expect(containerStyle.height).toBe(44);
    expect(inputStyle.height).toBe(44);
    expect(inputStyle.paddingTop).toBe(0);
    expect(inputStyle.paddingBottom).toBe(0);
    expect(inputStyle.paddingRight).toBe(54);
    expect(inputStyle.textAlignVertical).toBe('center');
    expect(iconStyle.alignItems).toBe('center');
    expect(iconStyle.justifyContent).toBe('center');
    expect(iconStyle.top).toBe(0);
    expect(iconStyle.bottom).toBe(0);
  });

  it('applies the shared focus state and preserves focus callbacks', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    render(
      <SearchInput
        onBlur={onBlur}
        onChangeText={jest.fn()}
        onFocus={onFocus}
        placeholder="Search"
        testID="search-input"
        value=""
      />,
    );

    const input = screen.getByTestId('search-input');

    fireEvent(input, 'focus');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe(Colors.aqua10);
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent(input, 'blur');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe(Colors.neutral04);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('applies the disabled state when the input is not editable', () => {
    render(
      <SearchInput
        editable={false}
        onChangeText={jest.fn()}
        placeholder="Search"
        testID="search-input"
        value=""
      />,
    );

    const inputStyle = StyleSheet.flatten(screen.getByTestId('search-input').props.style);
    const iconStyle = StyleSheet.flatten(screen.getByTestId('search-input-icon').props.style);

    expect(inputStyle.backgroundColor).toBe(Colors.neutral03);
    expect(inputStyle.borderColor).toBe(Colors.neutral05);
    expect(iconStyle.opacity).toBe(0.45);
  });
});
