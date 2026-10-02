
import { describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AppButton } from '../../../components/common/AppButton';
import { renderWithProviders } from '../../../utils/test-utils';

jest.mock('expo-router', () => ({
  router: {
    navigate: jest.fn(),
  },
}));

describe('AppButton', () => {
  it('renders correctly with title', () => {
    renderWithProviders(<AppButton title="Submit" onPress={() => {}} />);
    expect(screen.getByText('Submit')).toBeTruthy();
  });

  it('handles user press', () => {
    const mockPress = jest.fn();
    renderWithProviders(<AppButton title="Tap Me" onPress={mockPress} />);
    fireEvent.press(screen.getByText('Tap Me'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const mockPress = jest.fn();
    renderWithProviders(<AppButton title="Disabled" onPress={mockPress} disabled />);
    fireEvent.press(screen.getByText('Disabled'));
    expect(mockPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when isLoading', () => {
    renderWithProviders(<AppButton title="Loading" isLoading onPress={() => {}} />);
    expect(screen.getByText('Loading')).toBeTruthy();
    expect(screen.getByTestId('ActivityIndicator')).toBeTruthy();
  });

  it('shows countdown and disables during countdown', async () => {
    jest.useFakeTimers();
    const mockPress = jest.fn();
    renderWithProviders(
      <AppButton
        title="Resend"
        onPress={mockPress}
        isCountdownActive
        countdownSeconds={2}
      />
    );
    expect(screen.getByText(/Resend \(2\)/)).toBeTruthy();
    fireEvent.press(screen.getByText(/Resend \(2\)/));
    expect(mockPress).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Resend \(1\)/)).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => expect(screen.getByText('Resend')).toBeTruthy());
    fireEvent.press(screen.getByText('Resend'));
    expect(mockPress).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('applies variant styles', () => {
    const { rerender } = renderWithProviders(<AppButton title="Primary" variant="primary" onPress={() => {}} />);
    expect(screen.getByText('Primary')).toBeTruthy();
    rerender(<AppButton title="Secondary" variant="secondary" onPress={() => {}} />);
    expect(screen.getByText('Secondary')).toBeTruthy();
    rerender(<AppButton title="Tertiary" variant="tertiary" onPress={() => {}} />);
    expect(screen.getByText('Tertiary')).toBeTruthy();
    rerender(<AppButton title="Quaternary" variant="quaternary" onPress={() => {}} />);
    expect(screen.getByText('Quaternary')).toBeTruthy();
    rerender(<AppButton title="Danger" variant="danger" onPress={() => {}} />);
    expect(screen.getByText('Danger')).toBeTruthy();
  });

  it('applies custom buttonStyle and textStyle', () => {
    const customButtonStyle = { backgroundColor: 'red' };
    const customTextStyle = { color: 'yellow' };
    renderWithProviders(
      <AppButton
        title="Styled"
        onPress={() => {}}
        buttonStyle={customButtonStyle}
        textStyle={customTextStyle}
      />
    );
    expect(screen.getByText('Styled')).toBeTruthy();
  });
});
