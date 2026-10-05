import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { Switch } from 'react-native';
import SettingToggleItem from '../../../components/settings/NotificationSetting';
import { renderWithProviders } from '../../../utils/test-utils';

const baseProps = {
  label: 'Push Notifications',
  description: 'Receive alerts about your account activity.',
  isEnabled: false,
  onToggle: jest.fn(),
};

describe('SettingToggleItem (NotificationSetting)', () => {

  it('renders the label', () => {
    renderWithProviders(<SettingToggleItem {...baseProps} />);
    expect(screen.getByText('Push Notifications')).toBeTruthy();
  });

  it('renders the description when provided', () => {
    renderWithProviders(<SettingToggleItem {...baseProps} />);
    expect(
      screen.getByText('Receive alerts about your account activity.'),
    ).toBeTruthy();
  });

  it('omits the description when not provided', () => {
    renderWithProviders(
      <SettingToggleItem {...baseProps} description={undefined} />,
    );
    expect(
      screen.queryByText('Receive alerts about your account activity.'),
    ).toBeNull();
  });

  it('reflects the disabled state on the switch', () => {
    renderWithProviders(<SettingToggleItem {...baseProps} isEnabled={false} />);
    expect(screen.UNSAFE_getByType(Switch).props.value).toBe(false);
  });

  it('reflects the enabled state on the switch', () => {
    renderWithProviders(<SettingToggleItem {...baseProps} isEnabled />);
    expect(screen.UNSAFE_getByType(Switch).props.value).toBe(true);
  });

  it('calls onToggle when the row is pressed', () => {
    const onToggle = jest.fn();
    renderWithProviders(<SettingToggleItem {...baseProps} onToggle={onToggle} />);
    fireEvent.press(screen.getByText('Push Notifications'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle when the switch value changes', () => {
    const onToggle = jest.fn();
    renderWithProviders(<SettingToggleItem {...baseProps} onToggle={onToggle} />);
    fireEvent(screen.UNSAFE_getByType(Switch), 'valueChange', true);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
