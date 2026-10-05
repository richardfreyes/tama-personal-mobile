import { describe, expect, it } from '@jest/globals';
import SavedBillCard from '@/components/one-time-payments/SavedBillCard';
import { renderWithProviders } from '@/utils/test-utils';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

const bill = {
  billing_name: 'Filinvest Land',
  merchant_name: 'FLI',
  client_notes: '',
  custom_fields: { contractNo: { text: 'Contract Number', value: '1231232346433246' } },
};

describe('SavedBillCard hero', () => {
  it('shows the nickname, then the payee with the end of the contract number', () => {
    renderWithProviders(<SavedBillCard bill={bill} status={null} variant="hero" />);

    expect(screen.getByText('Filinvest Land')).toBeTruthy();
    expect(screen.getByText('FLI · Contract •••• 3246')).toBeTruthy();
  });

  it('draws a 56pt avatar in the brand ring, with initials when there is no logo', () => {
    renderWithProviders(<SavedBillCard bill={bill} status={null} variant="hero" />);

    expect(StyleSheet.flatten(screen.getByTestId('merchant-logo-ring').props.style)).toEqual(
      expect.objectContaining({ height: 56, width: 56 }),
    );
    expect(screen.getByText('FL')).toBeTruthy();
  });

  it('shows the biller’s logo when it has one', () => {
    renderWithProviders(<SavedBillCard bill={bill} logoUrl="https://example.com/fli.png" status={null} variant="hero" />);

    expect(screen.UNSAFE_getByType(Image).props.source).toEqual({ uri: 'https://example.com/fli.png' });
  });

  it('shows where the biller stands when the API says', () => {
    renderWithProviders(<SavedBillCard bill={bill} status={{ tone: 'due', label: 'Due Oct 5' }} variant="hero" />);

    expect(screen.getByTestId('biller-status-due')).toBeTruthy();
    expect(screen.getByText('Due Oct 5')).toBeTruthy();
  });

  it('leaves the status out when there is none', () => {
    renderWithProviders(<SavedBillCard bill={bill} status={null} variant="hero" />);
    expect(screen.queryByTestId(/^biller-status-/)).toBeNull();
  });

  it('shows only the payee for a biller without a contract number', () => {
    renderWithProviders(<SavedBillCard bill={{ ...bill, custom_fields: {} }} status={null} variant="hero" />);

    expect(screen.getByText('FLI')).toBeTruthy();
    expect(screen.queryByText(/Contract/)).toBeNull();
  });

  it('falls back to the biller name when the bill has no nickname', () => {
    renderWithProviders(<SavedBillCard bill={{ ...bill, billing_name: '' }} status={null} variant="hero" />);
    expect(screen.getAllByText('FLI').length).toBeGreaterThan(0);
  });

  it('keeps a long nickname to one line', () => {
    renderWithProviders(<SavedBillCard bill={{ ...bill, billing_name: 'A very long nickname that would otherwise wrap' }} status={null} variant="hero" />);
    expect(screen.getByText('A very long nickname that would otherwise wrap').props.numberOfLines).toBe(1);
  });
});
