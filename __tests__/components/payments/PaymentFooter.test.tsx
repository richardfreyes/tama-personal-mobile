import { describe, expect, it, jest } from '@jest/globals';
import PaymentFooter from '@/components/payments/PaymentFooter';
import { Colors } from '@/styles/common/colors';
import { renderWithProviders } from '@/utils/test-utils';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

const footer = (overrides: Partial<React.ComponentProps<typeof PaymentFooter>> = {}) => (
  <PaymentFooter
    isConfirmDisabled={false}
    isConfirming={false}
    label="Total · Visa •••• 4242"
    onConfirm={jest.fn()}
    total="₱ 10,000.00"
    {...overrides}
  />
);

describe('PaymentFooter', () => {
  it('shows what the total is for, the total and a Confirm button', () => {
    renderWithProviders(footer());

    expect(screen.getByText('Total · Visa •••• 4242')).toBeTruthy();
    expect(screen.getByText('₱ 10,000.00')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy();
  });

  it('confirms when Confirm is pressed', () => {
    const onConfirm = jest.fn();
    renderWithProviders(footer({ onConfirm }));

    fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not confirm while Confirm is disabled', () => {
    const onConfirm = jest.fn();
    renderWithProviders(footer({ isConfirmDisabled: true, label: 'Enter an amount to continue', onConfirm }));

    fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Confirm' }).props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  });

  it('shows Confirm as busy while it is confirming', () => {
    renderWithProviders(footer({ isConfirming: true }));
    expect(screen.getByTestId('ActivityIndicator')).toBeTruthy();
  });

  it('colours the label as an error when told it is one', () => {
    renderWithProviders(footer({ isLabelError: true, label: 'Unable to calculate fees' }));

    expect(StyleSheet.flatten(screen.getByText('Unable to calculate fees').props.style).color).toBe(Colors.dashboardErrorText);
  });

  it('is pinned to the bottom, over a white bar with a top border', () => {
    renderWithProviders(footer());

    expect(StyleSheet.flatten(screen.getByTestId('payment-footer').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: Colors.neutral01,
        borderTopColor: Colors.dashboardCardBorder,
        borderTopWidth: 1,
        bottom: 0,
        paddingTop: 12,
        position: 'absolute',
      }),
    );
  });

  it('clears the home indicator, with at least 16pt of padding', () => {
    renderWithProviders(footer());
    expect(StyleSheet.flatten(screen.getByTestId('payment-footer').props.style).paddingBottom).toBe(16);
  });
});
