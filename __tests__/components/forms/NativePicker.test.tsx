import { renderWithProviders } from '@/utils/test-utils';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert, Platform } from 'react-native';
import NativePicker from '../../../components/forms/NativePicker';

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const Picker = (props: any) => {
    return (
      <View testID="picker">
        {React.Children.map(props.children, (child: any) => child)}
      </View>
    );
  };

  Picker.Item = (props: any) => <Text testID={`picker-item-${props.value}`}>{props.label}</Text>;

  return { Picker };
});

jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

const defaultOptions = [
  { code: 'ph', name: 'Philippines' },
  { code: 'us', name: 'United States' },
  { code: 'jp', name: 'Japan' },
];

const defaultProps = () => ({
  label: 'Country',
  placeholder: 'Select a country',
  options: defaultOptions,
  selectedValue: '' as string | number,
  onValueChange: jest.fn<(value: string | number) => void>(),
});

describe('NativePicker', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label', () => {
    const props = defaultProps();
    renderWithProviders(<NativePicker {...props} />);
    expect(screen.getAllByText('Country').length).toBeGreaterThan(0);
  });

  it('renders the placeholder picker item on Android', () => {
    Platform.OS = 'android';
    const props = defaultProps();
    renderWithProviders(<NativePicker {...props} />);
    expect(screen.getByTestId('picker-item-')).toBeTruthy();
    expect(screen.getByText('Select a country')).toBeTruthy();
  });

  it('renders all option picker items on Android', () => {
    Platform.OS = 'android';
    const props = defaultProps();
    renderWithProviders(<NativePicker {...props} />);
    expect(screen.getByText('Philippines')).toBeTruthy();
    expect(screen.getByText('United States')).toBeTruthy();
    expect(screen.getByText('Japan')).toBeTruthy();
  });

  it('shows selected option name as display value', () => {
    const props = defaultProps();
    props.selectedValue = 'us';
    renderWithProviders(<NativePicker {...props} />);
    expect(screen.getByDisplayValue('United States')).toBeTruthy();
  });

  it('shows empty display value when no option is selected', () => {
    const props = defaultProps();
    props.selectedValue = '';
    renderWithProviders(<NativePicker {...props} />);
    expect(screen.getByDisplayValue('')).toBeTruthy();
  });

  it('shows error text when error prop is provided', () => {
    const props = defaultProps();
    renderWithProviders(<NativePicker {...props} error="Required field" />);
    expect(screen.getByText('Required field')).toBeTruthy();
  });

  it('does not show error text when error is undefined', () => {
    const props = defaultProps();
    renderWithProviders(<NativePicker {...props} />);
    expect(screen.queryByText('Required field')).toBeNull();
  });

  describe('when disabled', () => {
    it('shows alert with disabledMessage on Android', () => {
      Platform.OS = 'android';
      const props = defaultProps();
      renderWithProviders(
        <NativePicker {...props} enabled={false} disabledMessage="Please select a biller first" />,
      );

      const overlay = screen.getByTestId('picker').parent;

      const touchables = screen.root.findAll(
        (node) =>
          node.props.onPress !== undefined &&
          node.props.style !== undefined,
      );

      const disabledOverlay = touchables[touchables.length - 1];
      fireEvent.press(disabledOverlay);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Action Required',
        'Please select a biller first',
      );
    });

    it('does not show alert when disabled without disabledMessage on Android', () => {
      Platform.OS = 'android';
      const props = defaultProps();
      renderWithProviders(<NativePicker {...props} enabled={false} />);

      const touchables = screen.root.findAll(
        (node) =>
          node.props.onPress !== undefined &&
          node.props.style !== undefined,
      );
      const disabledOverlay = touchables[touchables.length - 1];
      fireEvent.press(disabledOverlay);

      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('iOS', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('shows Cancel and Done buttons in the modal', async () => {
      const props = defaultProps();
      renderWithProviders(<NativePicker {...props} />);

      const touchables = screen.root.findAll(
        (node) =>
          node.props.onPress !== undefined &&
          node.props.activeOpacity === 0.7,
      );
      fireEvent.press(touchables[0]);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeTruthy();
        expect(screen.getByText('Done')).toBeTruthy();
      });
    });

    it('shows alert when disabled and pressed on iOS', () => {
      const props = defaultProps();
      renderWithProviders(
        <NativePicker {...props} enabled={false} disabledMessage="Not available" />,
      );

      const touchables = screen.root.findAll(
        (node) =>
          node.props.onPress !== undefined &&
          node.props.activeOpacity === 0.7,
      );
      fireEvent.press(touchables[0]);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Action Required',
        'Not available',
        [{ text: 'OK' }],
      );
    });

    it('does not open picker when disabled on iOS', () => {
      const props = defaultProps();
      renderWithProviders(
        <NativePicker {...props} enabled={false} />,
      );

      const touchables = screen.root.findAll(
        (node) =>
          node.props.onPress !== undefined &&
          node.props.activeOpacity === 0.7,
      );
      fireEvent.press(touchables[0]);

      expect(screen.queryByText('Cancel')).toBeNull();
    });

    it('closes modal when Cancel is pressed', async () => {
      const props = defaultProps();
      renderWithProviders(<NativePicker {...props} />);

      const touchables = screen.root.findAll(
        (node) =>
          node.props.onPress !== undefined &&
          node.props.activeOpacity === 0.7,
      );
      fireEvent.press(touchables[0]);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Cancel'));

      expect(props.onValueChange).not.toHaveBeenCalled();
    });

    it('calls onValueChange and closes modal when Done is pressed', async () => {
      const props = defaultProps();
      props.selectedValue = 'ph';
      renderWithProviders(<NativePicker {...props} />);

      const touchables = screen.root.findAll(
        (node) =>
          node.props.onPress !== undefined &&
          node.props.activeOpacity === 0.7,
      );
      fireEvent.press(touchables[0]);

      await waitFor(() => {
        expect(screen.getByText('Done')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Done'));

      expect(props.onValueChange).toHaveBeenCalledWith('ph');
    });
  });
});
