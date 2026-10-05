import { describe, expect, it, jest } from '@jest/globals';
import OneTimeMethodList from '@/components/payments/OneTimeMethodList';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

describe('OneTimeMethodList', () => {
  it('offers a card, PayPal, Philippine banks and QRPH, each with a description', () => {
    render(<OneTimeMethodList onSelectMethod={jest.fn()} selectedMethod={null} />);

    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByText('Credit/Debit Card')).toBeTruthy();
    expect(screen.getByText('Visa, Mastercard, Amex, Discover, Diners, UnionPay')).toBeTruthy();
    expect(screen.getByText('PayPal')).toBeTruthy();
    expect(screen.getByText('Pay with your PayPal account')).toBeTruthy();
    expect(screen.getByText('Philippine Banks')).toBeTruthy();
    expect(screen.getByText('BPI, RCBC, UnionBank and more')).toBeTruthy();
    expect(screen.getByText('QRPH')).toBeTruthy();
    expect(screen.getByText('Scan with any bank or e-wallet app')).toBeTruthy();
  });

  it('starts with nothing chosen', () => {
    render(<OneTimeMethodList onSelectMethod={jest.fn()} selectedMethod={null} />);

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));
    });
  });

  it('gives each method a 68pt row', () => {
    render(<OneTimeMethodList onSelectMethod={jest.fn()} selectedMethod={null} />);

    screen.getAllByRole('radio').forEach((radio) => {
      expect(StyleSheet.flatten(radio.props.style).minHeight).toBe(68);
    });
  });

  it('marks the chosen method', () => {
    render(<OneTimeMethodList onSelectMethod={jest.fn()} selectedMethod="paypal" />);

    expect(screen.getByTestId('one-time-method-paypal').props.accessibilityState).toEqual(expect.objectContaining({ checked: true }));
    expect(screen.getByTestId('one-time-method-card').props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));
  });

  it('reports the method that was tapped', () => {
    const onSelectMethod = jest.fn();
    render(<OneTimeMethodList onSelectMethod={onSelectMethod} selectedMethod={null} />);

    fireEvent.press(screen.getByTestId('one-time-method-qrph'));
    expect(onSelectMethod).toHaveBeenCalledWith('qrph');
  });
});
