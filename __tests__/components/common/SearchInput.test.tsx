import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import SearchInput from '../../../components/common/SearchInput';
import { Colors } from '../../../styles/common/colors';
import { inputFocusColor } from '../../../styles/common/globals';

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
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe(inputFocusColor);
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

  describe('filled', () => {
    it('is a 48pt grey pill with no border', () => {
      render(<SearchInput onChangeText={jest.fn()} placeholder="Search 21 billers" testID="search" value="" variant="filled" />);

      const container = StyleSheet.flatten(screen.getByTestId('search-container').props.style);
      expect(container).toEqual(expect.objectContaining({
        backgroundColor: Colors.neutral03,
        borderRadius: 999,
        height: 48,
      }));
      expect(container.borderWidth).toBeUndefined();
      expect(StyleSheet.flatten(screen.getByTestId('search-placeholder').props.style).color).toBe(Colors.maroon06);
    });

    it('has no clear button for an empty field', () => {
      render(<SearchInput onChangeText={jest.fn()} onClear={jest.fn()} placeholder="Search" testID="search" value="" variant="filled" />);
      expect(screen.queryByLabelText('Clear search')).toBeNull();
    });

    it('clears the search from its clear button once there is text', () => {
      const onClear = jest.fn();
      render(<SearchInput onChangeText={jest.fn()} onClear={onClear} placeholder="Search" testID="search" value="land" variant="filled" />);

      fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('has no clear button without a handler for it', () => {
      render(<SearchInput onChangeText={jest.fn()} placeholder="Search" testID="search" value="land" variant="filled" />);
      expect(screen.queryByLabelText('Clear search')).toBeNull();
    });

    it('passes typing and focus through', () => {
      const onChangeText = jest.fn();
      const onFocus = jest.fn();
      render(<SearchInput onChangeText={onChangeText} onFocus={onFocus} placeholder="Search" testID="search" value="" variant="filled" />);

      fireEvent.changeText(screen.getByTestId('search'), 'avida');
      fireEvent(screen.getByTestId('search'), 'focus');
      expect(onChangeText).toHaveBeenCalledWith('avida');
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });
});
