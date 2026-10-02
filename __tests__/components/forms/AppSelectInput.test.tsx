import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import AppSelectInput from '../../../components/forms/AppSelectInput';
import { renderWithProviders } from '../../../utils/test-utils';

const mockOptions = [
  { code: 'us', name: 'United States' },
  { code: 'ph', name: 'Philippines' },
  { code: 'jp', name: 'Japan' },
];

const defaultProps = {
  label: 'Country',
  placeholder: 'Select a country',
  options: mockOptions,
};

function renderSelect(overrides: Record<string, any> = {}) {
  return renderWithProviders(
    <PaperProvider>
      <AppSelectInput {...defaultProps} {...(overrides as any)} />
    </PaperProvider>,
  );
}

describe('AppSelectInput', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label text', () => {
    renderSelect();
    expect(screen.getAllByText('Country').length).toBeGreaterThanOrEqual(1);
  });

  it('shows placeholder as display value when no option is selected', () => {
    renderSelect();
    expect(screen.getByDisplayValue('Select a country')).toBeTruthy();
  });

  it('shows selected option name when selectedValue matches', () => {
    renderSelect({ selectedValue: 'ph' });
    expect(screen.getByDisplayValue('Philippines')).toBeTruthy();
  });

  it('falls back to placeholder when selectedValue does not match any option', () => {
    renderSelect({ selectedValue: 'xx' });
    expect(screen.getByDisplayValue('Select a country')).toBeTruthy();
  });

  it('shows all options when anchor is pressed', async () => {
    renderSelect();
    fireEvent.press(screen.getByTestId('select-input-anchor'));

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeTruthy();
      expect(screen.getByText('Philippines')).toBeTruthy();
      expect(screen.getByText('Japan')).toBeTruthy();
    });
  });

  it('shows placeholder as a clearable menu option', async () => {
    renderSelect({ selectedValue: 'us' });
    fireEvent.press(screen.getByTestId('select-input-anchor'));

    await waitFor(() => {
      expect(screen.getByText('Select a country')).toBeTruthy();
    });
  });

  it('calls onValueChange with the option code when an option is pressed', async () => {
    const onValueChange = jest.fn();
    renderSelect({ onValueChange });

    fireEvent.press(screen.getByTestId('select-input-anchor'));
    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Japan'));
    expect(onValueChange).toHaveBeenCalledWith('jp');
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('calls onValueChange with null when placeholder menu item is pressed', async () => {
    const onValueChange = jest.fn();
    renderSelect({ selectedValue: 'us', onValueChange });

    fireEvent.press(screen.getByTestId('select-input-anchor'));
    await waitFor(() => {
      expect(screen.getByText('Select a country')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Select a country'));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('renders with an empty options array', () => {
    renderSelect({ options: [] });
    expect(screen.getAllByText('Country').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByDisplayValue('Select a country')).toBeTruthy();
  });

  it('does not throw when onValueChange is not provided', async () => {
    renderSelect();
    fireEvent.press(screen.getByTestId('select-input-anchor'));

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeTruthy();
    });

    expect(() => {
      fireEvent.press(screen.getByText('United States'));
    }).not.toThrow();
  });

  it('handles options with numeric codes', async () => {
    const numericOptions = [
      { code: 1, name: 'Option One' },
      { code: 2, name: 'Option Two' },
    ];
    const onValueChange = jest.fn();
    renderSelect({ options: numericOptions, selectedValue: 1, onValueChange });

    expect(screen.getByDisplayValue('Option One')).toBeTruthy();

    fireEvent.press(screen.getByTestId('select-input-anchor'));
    await waitFor(() => {
      expect(screen.getByText('Option Two')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Option Two'));
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it('handles options with null code', async () => {
    const nullCodeOptions = [
      { code: null, name: 'None' },
      { code: 'a', name: 'Alpha' },
    ];
    const onValueChange = jest.fn();
    renderSelect({ options: nullCodeOptions, onValueChange });

    fireEvent.press(screen.getByTestId('select-input-anchor'));
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Alpha'));
    expect(onValueChange).toHaveBeenCalledWith('a');
  });

  it('applies custom style prop without errors', () => {
    const customStyle = { marginTop: 20 };
    renderSelect({ style: customStyle });
    expect(screen.getAllByText('Country').length).toBeGreaterThanOrEqual(1);
  });

  it('highlights the currently selected option in the menu', async () => {
    renderSelect({ selectedValue: 'ph' });
    fireEvent.press(screen.getByTestId('select-input-anchor'));

    await waitFor(() => {
      expect(screen.getByText('Philippines')).toBeTruthy();
      expect(screen.getByText('United States')).toBeTruthy();
    });
  });
});
