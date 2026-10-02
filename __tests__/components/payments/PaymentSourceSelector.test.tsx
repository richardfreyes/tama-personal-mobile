import { describe, expect, it, jest } from '@jest/globals';
import PaymentSourceSelector from '@/components/payments/PaymentSourceSelector';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const options = [
  { value: 'saved', label: 'Use a saved payment method', description: 'Pay using a saved card.' },
  { value: 'new-card', label: 'Pay with a new card', description: 'Not saved to your account.' },
];

describe('PaymentSourceSelector', () => {
  it('renders every option with its label and description', () => {
    render(<PaymentSourceSelector options={options} selectedValue="saved" onSelect={jest.fn()} />);
    expect(screen.getByText('Use a saved payment method')).toBeTruthy();
    expect(screen.getByText('Pay with a new card')).toBeTruthy();
    expect(screen.getByText('Not saved to your account.')).toBeTruthy();
  });

  it('marks the selected option and reports selections', () => {
    const onSelect = jest.fn();
    render(<PaymentSourceSelector options={options} selectedValue="saved" onSelect={onSelect} />);

    const savedOption = screen.getByRole('radio', { name: /Use a saved payment method/ });
    expect(savedOption.props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));

    fireEvent.press(screen.getByRole('radio', { name: /Pay with a new card/ }));
    expect(onSelect).toHaveBeenCalledWith('new-card');
  });
});
