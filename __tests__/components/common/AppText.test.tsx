import { Colors } from '@/styles/common/colors';
import { FontSizes } from '@/styles/common/typography';
import { POPPINS_FONT_NAMES } from '@/constants/fonts';
import { renderWithProviders } from '@/utils/test-utils';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import React from 'react';
import * as ReactNative from 'react-native';
import { StyleSheet } from 'react-native';
import { AppText } from '../../../components/common/AppText';

const { fireEvent, waitFor } = require('@testing-library/react-native');
const RN = require('react-native');
jest.spyOn(RN.Linking, 'canOpenURL').mockImplementation(jest.fn());
jest.spyOn(RN.Linking, 'openURL').mockImplementation(jest.fn());

describe('AppText', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders text correctly', () => {
    renderWithProviders(<AppText>Hello World</AppText>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('applies the correct font family based on weight', () => {    
    renderWithProviders(<AppText weight="bold">Bold Text</AppText>);
    const textComponent = screen.getByText('Bold Text');
    const flattenedStyle = StyleSheet.flatten(textComponent.props.style);
    expect(flattenedStyle).toEqual(
      expect.objectContaining({ fontFamily: POPPINS_FONT_NAMES.bold })
    );
  });

  it('applies custom color and font size', () => {
    const testColorKey = Object.keys(Colors)[0] as keyof typeof Colors; 
    const testSizeKey = 'small';
    renderWithProviders(<AppText color={testColorKey} size={testSizeKey}>Styled Text</AppText>);
    const textComponent = screen.getByText('Styled Text');
    const flattenedStyle = StyleSheet.flatten(textComponent.props.style);
    expect(flattenedStyle).toEqual(
      expect.objectContaining({ color: Colors[testColorKey] }),
    );
    expect(flattenedStyle).toEqual(
      expect.objectContaining({ fontSize: FontSizes[testSizeKey] }),
    );
  });

  it('applies margin props top, bottom and horizontal correctly', () => {
    renderWithProviders(<AppText mTop={10} mBottom={20} mHorizontal={5}>Margin Text</AppText>);
    const textComponent = screen.getByText('Margin Text');
    const flattenedStyle = StyleSheet.flatten(textComponent.props.style);
    expect(flattenedStyle).toEqual(
      expect.objectContaining({ 
        marginTop: 10, 
        marginBottom: 20, 
        marginHorizontal: 5 
      })
    );
  });

  it('applies margin props correctly', () => {
    renderWithProviders(<AppText m={10}>Margin Text</AppText>);
    const textComponent = screen.getByText('Margin Text');
    const flattenedStyle = StyleSheet.flatten(textComponent.props.style);
    expect(flattenedStyle).toEqual(
      expect.objectContaining({ 
        margin: 10,
      })
    );
  });

  it('applies margin props left, right and vertical correctly', () => {
    renderWithProviders(<AppText mLeft={10} mRight={20} mVertical={5}>Margin Text</AppText>);
    const textComponent = screen.getByText('Margin Text');
    const flattenedStyle = StyleSheet.flatten(textComponent.props.style);
    expect(flattenedStyle).toEqual(
      expect.objectContaining({ 
        marginLeft: 10,
        marginRight: 20,
        marginVertical: 5,
      })
    );
  });

  it('should do nothing when URL is undefined', async () => {
    const testUrl = undefined;
    renderWithProviders(<AppText url={testUrl}>Open Link</AppText>);
    fireEvent.press(screen.getByText('Open Link'));
    expect(ReactNative.Linking.canOpenURL).not.toHaveBeenCalled();
    expect(ReactNative.Linking.openURL).not.toHaveBeenCalled();
  });

  it('opens the URL if it is supported', async () => {
    const testUrl = 'https://google.com';
    const canOpenURLMock = ReactNative.Linking.canOpenURL as jest.MockedFunction<typeof ReactNative.Linking.canOpenURL>;
    const openURLMock = ReactNative.Linking.openURL as jest.MockedFunction<typeof ReactNative.Linking.openURL>;
    canOpenURLMock.mockResolvedValue(true);
    openURLMock.mockResolvedValue(false as never);
    renderWithProviders(<AppText url={testUrl}>Open Link</AppText>);
    fireEvent.press(screen.getByText('Open Link'));
    await waitFor(() => {
      expect(ReactNative.Linking.canOpenURL).toHaveBeenCalledWith(testUrl);
      expect(ReactNative.Linking.canOpenURL).toHaveBeenCalledTimes(1);
      expect(ReactNative.Linking.openURL).toHaveBeenCalledWith(testUrl);
      expect(ReactNative.Linking.openURL).toHaveBeenCalledTimes(1);
    });
  });

  it('does NOT open the URL if Linking.canOpenURL returns false', async () => {
    const testUrl = 'unsupported://invalid';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const canOpenURLMock = ReactNative.Linking.canOpenURL as jest.MockedFunction<typeof ReactNative.Linking.canOpenURL>;
    canOpenURLMock.mockResolvedValue(false);
    renderWithProviders(<AppText url={testUrl}>Bad Link</AppText>);
    fireEvent.press(screen.getByText('Bad Link'));
    await new Promise(process.nextTick);
    expect(ReactNative.Linking.canOpenURL).toHaveBeenCalledWith(testUrl);
    expect(ReactNative.Linking.openURL).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(`Don't know how to open URL: ${testUrl}`);
    consoleSpy.mockRestore();
  });
});
