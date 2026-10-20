import { renderWithProviders } from '@/utils/test-utils';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { Alert, Platform } from 'react-native';
import NativePicker from '../../../components/forms/NativePicker';

const defaultOptions = [{ code: 'ph', name: 'Philippines' }, { code: 'us', name: 'United States' }, { code: 'jp', name: 'Japan' }];

const defaultProps = () => ({ label: 'Country', placeholder: 'Select a country', options: defaultOptions, selectedValue: '' as string | number, onValueChange: jest.fn<(value: string | number) => void>() });

const originalPlatform = Platform.OS;

afterEach(() => {
  Platform.OS = originalPlatform;
  jest.restoreAllMocks();
});

describe.each(['ios', 'android'] as const)('NativePicker on %s', platform => {
  it('keeps the current value until a selection is confirmed', () => {
    Platform.OS = platform;
    const props = defaultProps();
    props.selectedValue = 'ph';
    renderWithProviders(<NativePicker {...props} />);
    expect(screen.getByDisplayValue('Philippines')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Country' }));
    fireEvent.press(screen.getByRole('radio', { name: 'United States' }));
    expect(props.onValueChange).not.toHaveBeenCalled();
    fireEvent.press(screen.getByText('Done'));
    expect(props.onValueChange).toHaveBeenCalledWith('us');
  });

  it('searches options and discards an unconfirmed selection on Cancel', () => {
    Platform.OS = platform;
    const props = defaultProps();
    props.selectedValue = 'ph';
    renderWithProviders(<NativePicker {...props} />);
    fireEvent.press(screen.getByRole('button', { name: 'Country' }));
    fireEvent.changeText(screen.getByLabelText('Search Country'), 'jap');
    expect(screen.queryByRole('radio', { name: 'United States' })).toBeNull();
    fireEvent.press(screen.getByRole('radio', { name: 'Japan' }));
    fireEvent.press(screen.getByText('Cancel'));
    expect(props.onValueChange).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: 'Country' }));
    expect(screen.getByRole('radio', { name: 'Philippines' }).props.accessibilityState.selected).toBe(true);
    fireEvent.press(screen.getByText('Done'));
    expect(props.onValueChange).toHaveBeenCalledWith('ph');
  });

  it('preserves numeric option values when confirming', () => {
    Platform.OS = platform;
    const props = defaultProps();
    renderWithProviders(<NativePicker {...props} options={[{ code: 12, name: 'Project Twelve' }]} />);
    fireEvent.press(screen.getByRole('button', { name: 'Country' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Project Twelve' }));
    fireEvent.press(screen.getByText('Done'));
    expect(props.onValueChange).toHaveBeenCalledWith(12);
  });

  it('shows validation errors and keeps disabled options inaccessible', () => {
    Platform.OS = platform;
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const props = defaultProps();
    renderWithProviders(<NativePicker {...props} enabled={false} error="Required field" disabledMessage="Please select a biller first" />);
    expect(screen.getByText('Required field')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Country' }));
    expect(screen.queryByText('Done')).toBeNull();
    expect(props.onValueChange).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalled();
  });
});
