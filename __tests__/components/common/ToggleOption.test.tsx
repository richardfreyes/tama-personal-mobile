import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import ToggleOptionComponent from '../../../components/common/ToggleOption';
import { renderWithProviders } from '../../../utils/test-utils';

describe('ToggleOptionComponent', () => {
  // ---- Default rendering ----

  it('renders the default options when none are provided', () => {
    renderWithProviders(<ToggleOptionComponent />);
    expect(screen.getByText('Option A')).toBeTruthy();
    expect(screen.getByText('Option B')).toBeTruthy();
  });

  it('renders custom options', () => {
    renderWithProviders(
      <ToggleOptionComponent options={['Daily', 'Weekly', 'Monthly']} />,
    );
    expect(screen.getByText('Daily')).toBeTruthy();
    expect(screen.getByText('Weekly')).toBeTruthy();
    expect(screen.getByText('Monthly')).toBeTruthy();
  });

  // ---- Selection ----

  it('calls onOptionChange with the pressed option', () => {
    const onOptionChange = jest.fn();
    renderWithProviders(
      <ToggleOptionComponent
        options={['One', 'Two']}
        onOptionChange={onOptionChange}
      />,
    );
    fireEvent.press(screen.getByText('Two'));
    expect(onOptionChange).toHaveBeenCalledWith('Two');
  });

  it('honours the initialSelected option', () => {
    const onOptionChange = jest.fn();
    renderWithProviders(
      <ToggleOptionComponent
        options={['One', 'Two']}
        initialSelected="Two"
        onOptionChange={onOptionChange}
      />,
    );
    // Pressing the already-selected option still triggers the change callback
    fireEvent.press(screen.getByText('Two'));
    expect(onOptionChange).toHaveBeenCalledWith('Two');
  });

  it('does not crash when pressed without an onOptionChange handler', () => {
    renderWithProviders(<ToggleOptionComponent options={['One', 'Two']} />);
    expect(() => fireEvent.press(screen.getByText('Two'))).not.toThrow();
  });

  // ---- Button-config (AppButton) variant ----

  it('renders the AppButton variant when buttonConfig.isButton is true', () => {
    const onOptionChange = jest.fn();
    renderWithProviders(
      <ToggleOptionComponent
        options={['One Time Payment', 'Autopay']}
        buttonConfig={{
          isButton: true,
          primaryBtn: 'primary',
          secondaryBtn: 'tertiary',
        }}
        onOptionChange={onOptionChange}
      />,
    );
    expect(screen.getByText('One Time Payment')).toBeTruthy();
    expect(screen.getByText('Autopay')).toBeTruthy();

    fireEvent.press(screen.getByText('Autopay'));
    expect(onOptionChange).toHaveBeenCalledWith('Autopay');
  });
});
