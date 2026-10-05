import { describe, expect, it, jest } from '@jest/globals';
import PaymentSourceSelector from '@/components/payments/PaymentSourceSelector';
import { PAYMENT_SOURCE_OPTIONS } from '@/constants/paymentOptions';
import { Colors } from '@/styles/common/colors';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

const options = [
  { value: 'saved', label: 'Saved card', description: 'Pay using a saved card.' },
  { value: 'new-card', label: 'Other method', description: 'Not saved to your account.' },
];

describe('PaymentSourceSelector', () => {
  it('shows every option as a tab', () => {
    render(<PaymentSourceSelector options={options} selectedValue="saved" onSelect={jest.fn()} />);

    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'tablist' })).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByText('Saved card')).toBeTruthy();
    expect(screen.getByText('Other method')).toBeTruthy();
  });

  it('describes only the selected option', () => {
    const { rerender } = render(<PaymentSourceSelector options={options} selectedValue="saved" onSelect={jest.fn()} />);
    expect(screen.getByText('Pay using a saved card.')).toBeTruthy();
    expect(screen.queryByText('Not saved to your account.')).toBeNull();

    rerender(<PaymentSourceSelector options={options} selectedValue="new-card" onSelect={jest.fn()} />);
    expect(screen.getByText('Not saved to your account.')).toBeTruthy();
    expect(screen.queryByText('Pay using a saved card.')).toBeNull();
  });

  it('marks the selected tab and reports selections', () => {
    const onSelect = jest.fn();
    render(<PaymentSourceSelector options={options} selectedValue="saved" onSelect={onSelect} />);

    expect(screen.getByRole('tab', { name: 'Saved card' }).props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));
    expect(screen.getByRole('tab', { name: 'Other method' }).props.accessibilityState).toEqual(expect.objectContaining({ selected: false }));

    fireEvent.press(screen.getByRole('tab', { name: 'Other method' }));
    expect(onSelect).toHaveBeenCalledWith('new-card');
  });

  it('lifts the selected tab onto a white 40pt segment', () => {
    render(<PaymentSourceSelector options={options} selectedValue="saved" onSelect={jest.fn()} />);

    const selected = StyleSheet.flatten(screen.getByRole('tab', { name: 'Saved card' }).props.style);
    const idle = StyleSheet.flatten(screen.getByRole('tab', { name: 'Other method' }).props.style);
    expect(selected).toEqual(expect.objectContaining({ backgroundColor: Colors.neutral01, height: 40, borderRadius: 11 }));
    expect(idle.backgroundColor).toBeUndefined();
  });

  it('offers Saved card and Other method with the design copy', () => {
    render(<PaymentSourceSelector options={PAYMENT_SOURCE_OPTIONS} selectedValue="saved" onSelect={jest.fn()} />);

    expect(screen.getByText('Saved card')).toBeTruthy();
    expect(screen.getByText('Other method')).toBeTruthy();
    expect(screen.getByText('Pay using a card saved to your account.')).toBeTruthy();
  });
});
