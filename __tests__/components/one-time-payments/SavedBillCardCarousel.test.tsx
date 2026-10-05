import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import SavedBillCard from '@/components/one-time-payments/SavedBillCard';
import { openSavedBill } from '@/services/routeNavigation';
import type { Bill } from '@/redux/features/bills/billsTypes';
import { Colors } from '@/styles/common/colors';
import { renderWithProviders } from '@/utils/test-utils';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

const makeBill = (overrides: Partial<Bill> = {}): Bill => ({
  billing_id: 1,
  billing_name: 'Filinvest Land',
  billing_reference_id: 'bill-1',
  billing_type: 'saved',
  client_notes: '',
  custom_fields: { amount: { text: 'Amount', value: '10,000.00' } },
  customer_id: 1,
  merchant_category_name: 'Real Estate',
  merchant_id: 55,
  merchant_name: 'Filinvest Land, Inc.',
  payment_type_id: 1,
  project_id: 1,
  ...overrides,
});

describe('SavedBillCard card variant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the nickname, the biller and the amount in pesos', () => {
    renderWithProviders(<SavedBillCard bill={makeBill()} onPress={openSavedBill} variant="card" />);

    expect(screen.getByText('Filinvest Land')).toBeTruthy();
    expect(screen.getByText('Filinvest Land, Inc.')).toBeTruthy();
    expect(screen.getByText('₱ 10,000.00')).toBeTruthy();
  });

  it('asks for an amount when none is saved', () => {
    renderWithProviders(<SavedBillCard bill={makeBill({ custom_fields: {} })} onPress={openSavedBill} variant="card" />);

    const prompt = screen.getByText('Enter amount');
    expect(StyleSheet.flatten(prompt.props.style)).toEqual(
      expect.objectContaining({ color: Colors.maroon08, fontSize: 15 }),
    );
  });

  it('draws the avatar in the brand ring, with initials when the biller has no logo', () => {
    renderWithProviders(<SavedBillCard bill={makeBill()} onPress={openSavedBill} variant="card" />);

    expect(screen.getByTestId('merchant-logo-ring')).toBeTruthy();
    expect(screen.getByText('FL')).toBeTruthy();
  });

  it('shows the biller’s logo in place of the initials', () => {
    renderWithProviders(<SavedBillCard bill={makeBill()} logoUrl="https://example.com/fli.png" onPress={openSavedBill} variant="card" />);

    expect(screen.UNSAFE_getByType(Image).props.source).toEqual({ uri: 'https://example.com/fli.png' });
    expect(screen.queryByText('FL')).toBeNull();
  });

  it('has no status line when the API reports no status', () => {
    renderWithProviders(<SavedBillCard bill={makeBill()} onPress={openSavedBill} variant="card" />);
    expect(screen.queryByTestId(/^biller-status-/)).toBeNull();
  });

  const statusCases: [string, Partial<Bill>, string | RegExp, string][] = [
    ['overdue', { due_date: daysFromNow(-2) }, 'Overdue 2 days', Colors.red09],
    ['due', { due_date: daysFromNow(5) }, /^Due [A-Z][a-z]{2} \d{1,2}$/, Colors.billDueText],
    ['paid', { date_paid: daysFromNow(-4) }, /^Paid [A-Z][a-z]{2} \d{1,2}$/, Colors.dashboardSuccessText],
    ['none', { date_paid: null }, 'Never paid', Colors.maroon09],
  ];

  it.each(statusCases)('shows the %s status in its colour', (tone, overrides, label, color) => {
    renderWithProviders(<SavedBillCard bill={makeBill(overrides)} onPress={openSavedBill} variant="card" />);

    expect(screen.getByTestId(`biller-status-${tone}`)).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByText(label).props.style).color).toBe(color);
  });

  it('describes the whole card to a screen reader, status included', () => {
    renderWithProviders(<SavedBillCard bill={makeBill({ due_date: daysFromNow(-2) })} onPress={openSavedBill} variant="card" />);

    expect(screen.getByRole('button', {
      name: 'Filinvest Land, Filinvest Land, Inc., ₱ 10,000.00, Overdue 2 days',
    })).toBeTruthy();
  });

  it('opens the biller to pay when pressed', () => {
    renderWithProviders(<SavedBillCard bill={makeBill()} onPress={openSavedBill} variant="card" />);

    fireEvent.press(screen.getByTestId('biller-card-bill-1'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
      params: { billingReferenceId: 'bill-1', merchantName: 'Filinvest Land, Inc.' },
    });
  });

  it('is a 156pt card with a 20pt radius', () => {
    renderWithProviders(<SavedBillCard bill={makeBill()} onPress={openSavedBill} variant="card" />);

    expect(StyleSheet.flatten(screen.getByTestId('biller-card-bill-1').props.style)).toEqual(
      expect.objectContaining({ borderRadius: 20, padding: 14, width: 156 }),
    );
  });
});
